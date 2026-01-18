mod database;
mod filesystem;
mod export;

use database::Database;
use filesystem::{Filesystem, ProjectFile};
use export::Exporter;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

pub struct AppState {
    database: Mutex<Database>,
    filesystem: Filesystem,
    exporter: Exporter,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseError {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FilesystemError {
    pub message: String,
}

#[tauri::command]
async fn get_cells(
    search: Option<String>,
    state: State<'_, AppState>,
) -> Result<database::Cell, DatabaseError> {
    let db = state.database.lock().unwrap();
    match db.get_cells(search.as_deref()) {
        Ok(cells) => Ok(cells),
        Err(e) => Err(DatabaseError {
            message: format!("Failed to get cells: {}", e),
        }),
    }
}

#[tauri::command]
async fn get_cell_by_id(
    id: i64,
    state: State<'_, AppState>,
) -> Result<Option<database::Cell>, DatabaseError> {
    let db = state.database.lock().unwrap();
    match db.get_cell_by_id(id) {
        Ok(cell) => Ok(cell),
        Err(e) => Err(DatabaseError {
            message: format!("Failed to get cell: {}", e),
        }),
    }
}

#[tauri::command]
async fn get_materials(
    state: State<'_, AppState>,
) -> Result<database::Material, DatabaseError> {
    let db = state.database.lock().unwrap();
    match db.get_materials() {
        Ok(materials) => Ok(materials),
        Err(e) => Err(DatabaseError {
            message: format!("Failed to get materials: {}", e),
        }),
    }
}

#[tauri::command]
async fn get_shapes(
    state: State<'_, AppState>,
) -> Result<database::Shape, DatabaseError> {
    let db = state.database.lock().unwrap();
    match db.get_shapes() {
        Ok(shapes) => Ok(shapes),
        Err(e) => Err(DatabaseError {
            message: format!("Failed to get shapes: {}", e),
        }),
    }
}

#[tauri::command]
async fn save_project(
    project: ProjectFile,
    path: String,
    state: State<'_, AppState>,
) -> Result<(), FilesystemError> {
    let path = std::path::Path::new(&path);
    match state.filesystem.save_project(&project, path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FilesystemError { message: e }),
    }
}

#[tauri::command]
async fn load_project(
    path: String,
    state: State<'_, AppState>,
) -> Result<ProjectFile, FilesystemError> {
    let path = std::path::Path::new(&path);
    match state.filesystem.load_project(path) {
        Ok(project) => Ok(project),
        Err(e) => Err(FilesystemError { message: e }),
    }
}

#[tauri::command]
async fn create_new_project(
    name: String,
    state: State<'_, AppState>,
) -> Result<ProjectFile, FilesystemError> {
    Ok(state.filesystem.create_new_project(name))
}

#[tauri::command]
async fn export_stl(
    data: Vec<u8>,
    path: String,
    state: State<'_, AppState>,
) -> Result<(), FilesystemError> {
    let path = std::path::Path::new(&path);
    match state.filesystem.export_stl(&data, path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FilesystemError { message: e }),
    }
}

#[tauri::command]
async fn export_three_mf(
    data: Vec<u8>,
    path: String,
    state: State<'_, AppState>,
) -> Result<(), FilesystemError> {
    let path = std::path::Path::new(&path);
    match state.filesystem.export_three_mf(&data, path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FilesystemError { message: e }),
    }
}

#[tauri::command]
async fn import_mesh(
    path: String,
    state: State<'_, AppState>,
) -> Result<Vec<u8>, FilesystemError> {
    let path = std::path::Path::new(&path);
    match state.filesystem.import_mesh(path) {
        Ok(data) => Ok(data),
        Err(e) => Err(FilesystemError { message: e }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize database
            let db = Database::new(app.handle())?;
            db.init_schema()?;
            db.seed_data()?;

            // Initialize filesystem and exporter
            let filesystem = Filesystem::new(app.handle().clone());
            let exporter = Exporter::new();

            // Store in app state
            app.manage(AppState {
                database: Mutex::new(db),
                filesystem,
                exporter,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_cells,
            get_cell_by_id,
            get_materials,
            get_shapes,
            save_project,
            load_project,
            create_new_project,
            export_stl,
            export_three_mf,
            import_mesh
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
