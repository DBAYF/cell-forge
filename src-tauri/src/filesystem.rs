use flate2::{write::GzEncoder, read::GzDecoder, Compression};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::{Read, Write};
use std::path::Path;
use tauri::{AppHandle, Manager};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Vector3([f64; 3]);

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Euler([f64; 3]);

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transform {
    pub position: Vector3,
    pub rotation: Euler,
    pub scale: Vector3,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CellInstance {
    pub uuid: String,
    pub cell_id: i64,
    pub position: Vector3,
    pub rotation: Euler,
    pub custom_label: Option<String>,
    pub group_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Connection {
    pub uuid: String,
    pub connection_type: String, // "series" | "parallel" | "busbar"
    pub source_uuid: String,
    pub source_terminal: String, // "positive" | "negative"
    pub target_uuid: String,
    pub target_terminal: String, // "positive" | "negative"
    pub material_id: Option<i64>,
    pub path: Option<Vec<Vector3>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Component {
    pub uuid: String,
    pub component_type: String, // "bms" | "shape" | "custom"
    pub reference_id: Option<i64>,
    pub position: Vector3,
    pub rotation: Euler,
    pub scale: Vector3,
    pub custom_mesh_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Group {
    pub uuid: String,
    pub name: String,
    pub member_uuids: Vec<String>,
    pub color: Option<String>,
    pub locked: bool,
    pub visible: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Scene {
    pub cells: HashMap<String, CellInstance>,
    pub connections: HashMap<String, Connection>,
    pub components: HashMap<String, Component>,
    pub groups: HashMap<String, Group>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub units: String, // "mm" | "in"
    pub grid_size: f64,
    pub snap_enabled: bool,
    pub hex_packing_enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Camera {
    pub position: Vector3,
    pub target: Vector3,
    pub zoom: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectMetadata {
    pub name: String,
    pub created: String, // ISO 8601
    pub modified: String,
    pub author: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectFile {
    pub version: String,
    pub metadata: ProjectMetadata,
    pub scene: Scene,
    pub settings: Settings,
    pub camera: Camera,
}

pub struct Filesystem {
    app: AppHandle,
}

impl Filesystem {
    pub fn new(app: AppHandle) -> Self {
        Filesystem { app }
    }

    pub fn save_project(&self, project: &ProjectFile, path: &Path) -> Result<(), String> {
        // Create directory if it doesn't exist
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        // Serialize to JSON
        let json = serde_json::to_string_pretty(project)
            .map_err(|e| format!("Failed to serialize project: {}", e))?;

        // Compress with gzip
        let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
        encoder.write_all(json.as_bytes())
            .map_err(|e| format!("Failed to compress data: {}", e))?;
        let compressed = encoder.finish()
            .map_err(|e| format!("Failed to finish compression: {}", e))?;

        // Write to file
        fs::write(path, compressed)
            .map_err(|e| format!("Failed to write file: {}", e))?;

        Ok(())
    }

    pub fn load_project(&self, path: &Path) -> Result<ProjectFile, String> {
        // Read compressed file
        let compressed = fs::read(path)
            .map_err(|e| format!("Failed to read file: {}", e))?;

        // Decompress
        let mut decoder = GzDecoder::new(&compressed[..]);
        let mut json = String::new();
        decoder.read_to_string(&mut json)
            .map_err(|e| format!("Failed to decompress data: {}", e))?;

        // Deserialize from JSON
        let project: ProjectFile = serde_json::from_str(&json)
            .map_err(|e| format!("Failed to deserialize project: {}", e))?;

        Ok(project)
    }

    pub fn create_new_project(&self, name: String) -> ProjectFile {
        let now = chrono::Utc::now().to_rfc3339();

        ProjectFile {
            version: "1.0.0".to_string(),
            metadata: ProjectMetadata {
                name,
                created: now.clone(),
                modified: now,
                author: None,
            },
            scene: Scene {
                cells: HashMap::new(),
                connections: HashMap::new(),
                components: HashMap::new(),
                groups: HashMap::new(),
            },
            settings: Settings {
                units: "mm".to_string(),
                grid_size: 1.0,
                snap_enabled: true,
                hex_packing_enabled: false,
            },
            camera: Camera {
                position: Vector3([100.0, 100.0, 100.0]),
                target: Vector3([0.0, 0.0, 0.0]),
                zoom: 1.0,
            },
        }
    }

    pub fn get_autosave_path(&self) -> Result<std::path::PathBuf, String> {
        let data_dir = self.app.path().app_data_dir()
            .map_err(|e| format!("Failed to get app data directory: {:?}", e))?;

        fs::create_dir_all(&data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;

        Ok(data_dir.join("autosave.cellforge"))
    }

    pub fn export_stl(&self, data: &[u8], path: &Path) -> Result<(), String> {
        fs::write(path, data)
            .map_err(|e| format!("Failed to write STL file: {}", e))?;
        Ok(())
    }

    pub fn export_three_mf(&self, data: &[u8], path: &Path) -> Result<(), String> {
        fs::write(path, data)
            .map_err(|e| format!("Failed to write 3MF file: {}", e))?;
        Ok(())
    }

    pub fn import_mesh(&self, path: &Path) -> Result<Vec<u8>, String> {
        fs::read(path)
            .map_err(|e| format!("Failed to read mesh file: {}", e))
    }
}