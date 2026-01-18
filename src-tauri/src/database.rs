use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Cell {
    pub id: i64,
    pub manufacturer: String,
    pub model: String,
    pub form_factor: String,
    pub chemistry: String,
    pub nominal_voltage: f64,
    pub max_voltage: f64,
    pub min_voltage: f64,
    pub capacity_mah: i32,
    pub max_discharge_a: f64,
    pub max_charge_a: f64,
    pub internal_res_mohm: Option<f64>,
    pub weight_g: f64,
    pub diameter_mm: Option<f64>,
    pub length_mm: f64,
    pub width_mm: Option<f64>,
    pub height_mm: Option<f64>,
    pub datasheet_url: Option<String>,
    pub thermal_limit_c: Option<f64>,
    pub cycle_life: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Bms {
    pub id: i64,
    pub manufacturer: String,
    pub model: String,
    pub series_count: i32,
    pub max_current_a: f64,
    pub balance_current_ma: Option<f64>,
    pub length_mm: f64,
    pub width_mm: f64,
    pub height_mm: f64,
    pub pinout_json: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Material {
    pub id: i64,
    pub name: String,
    pub material_type: String,
    pub thickness_mm: Option<f64>,
    pub width_mm: Option<f64>,
    pub resistance_mohm_per_m: f64,
    pub max_current_a: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Shape {
    pub id: i64,
    pub name: String,
    pub category: String,
    pub file_path: String,
    pub default_scale: String,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(app: &AppHandle) -> Result<Self> {
        let db_path = app
            .path()
            .app_data_dir()
            .map_err(|_| rusqlite::Error::InvalidPath("App data directory not found".into()))?
            .join("library.db");

        // Ensure directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| {
                rusqlite::Error::InvalidPath(format!("Failed to create database directory: {}", e).into())
            })?;
        }

        let conn = if db_path.exists() {
            Connection::open(&db_path)?
        } else {
            // Copy bundled database
            let bundled_db = app
                .path()
                .resource_dir()
                .map_err(|_| rusqlite::Error::InvalidPath("Resource directory not found".into()))?
                .join("assets/library.db");

            if bundled_db.exists() {
                std::fs::copy(&bundled_db, &db_path).map_err(|e| {
                    rusqlite::Error::InvalidPath(format!("Failed to copy bundled database: {}", e).into())
                })?;
            }

            Connection::open(&db_path)?
        };

        Ok(Database { conn })
    }

    pub fn init_schema(&self) -> Result<()> {
        // Create cells table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS cells (
                id INTEGER PRIMARY KEY,
                manufacturer TEXT NOT NULL,
                model TEXT NOT NULL,
                form_factor TEXT NOT NULL CHECK(form_factor IN ('18650','21700','26650','4680','prismatic','pouch')),
                chemistry TEXT NOT NULL CHECK(chemistry IN ('NMC','NCA','LFP','LTO','LCO')),
                nominal_voltage REAL NOT NULL,
                max_voltage REAL NOT NULL,
                min_voltage REAL NOT NULL,
                capacity_mah INTEGER NOT NULL,
                max_discharge_a REAL NOT NULL,
                max_charge_a REAL NOT NULL,
                internal_res_mohm REAL,
                weight_g REAL NOT NULL,
                diameter_mm REAL,
                length_mm REAL NOT NULL,
                width_mm REAL,
                height_mm REAL,
                datasheet_url TEXT,
                thermal_limit_c REAL DEFAULT 60,
                cycle_life INTEGER,
                UNIQUE(manufacturer, model)
            )",
            [],
        )?;

        // Create BMS table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS bms (
                id INTEGER PRIMARY KEY,
                manufacturer TEXT NOT NULL,
                model TEXT NOT NULL,
                series_count INTEGER NOT NULL,
                max_current_a REAL NOT NULL,
                balance_current_ma REAL,
                length_mm REAL NOT NULL,
                width_mm REAL NOT NULL,
                height_mm REAL NOT NULL,
                pinout_json TEXT,
                UNIQUE(manufacturer, model)
            )",
            [],
        )?;

        // Create materials table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS materials (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('nickel_strip','copper_strip','busbar','wire')),
                thickness_mm REAL,
                width_mm REAL,
                resistance_mohm_per_m REAL NOT NULL,
                max_current_a REAL NOT NULL,
                UNIQUE(name, type)
            )",
            [],
        )?;

        // Create shapes table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS shapes (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL CHECK(category IN ('enclosure','bracket','spacer','vent','terminal')),
                file_path TEXT NOT NULL,
                default_scale TEXT DEFAULT '1,1,1',
                UNIQUE(name)
            )",
            [],
        )?;

        // Create FTS table for cells
        self.conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS cells_fts USING fts5(
                manufacturer, model, form_factor, chemistry,
                content='cells',
                content_rowid='id'
            )",
            [],
        )?;

        // Create triggers to keep FTS table in sync
        self.conn.execute(
            "CREATE TRIGGER IF NOT EXISTS cells_fts_insert AFTER INSERT ON cells
             BEGIN
               INSERT INTO cells_fts(rowid, manufacturer, model, form_factor, chemistry)
               VALUES (new.id, new.manufacturer, new.model, new.form_factor, new.chemistry);
             END",
            [],
        )?;

        self.conn.execute(
            "CREATE TRIGGER IF NOT EXISTS cells_fts_delete AFTER DELETE ON cells
             BEGIN
               DELETE FROM cells_fts WHERE rowid = old.id;
             END",
            [],
        )?;

        self.conn.execute(
            "CREATE TRIGGER IF NOT EXISTS cells_fts_update AFTER UPDATE ON cells
             BEGIN
               UPDATE cells_fts SET manufacturer = new.manufacturer, model = new.model,
                                   form_factor = new.form_factor, chemistry = new.chemistry
               WHERE rowid = new.id;
             END",
            [],
        )?;

        Ok(())
    }

    pub fn seed_data(&self) -> Result<()> {
        // Check if already seeded
        let count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM cells",
            [],
            |row| row.get(0),
        )?;

        if count > 0 {
            return Ok(());
        }

        // Seed cells
        let cells = vec![
            (1, "Samsung", "30Q", "18650", "NMC", 3.6, 4.2, 2.5, 3000, 15.0, 4.0, Some(20.0), 48.0, Some(18.3), 65.2, None, None, Some(60.0), Some(250)),
            (2, "Samsung", "40T", "21700", "NMC", 3.6, 4.2, 2.5, 4000, 35.0, 6.0, Some(12.0), 70.0, Some(21.1), 70.2, None, None, Some(60.0), Some(300)),
            (3, "Molicel", "P42A", "21700", "NMC", 3.6, 4.2, 2.5, 4200, 45.0, 6.0, Some(10.0), 70.0, Some(21.1), 70.2, None, None, Some(60.0), Some(800)),
            (4, "LG", "HG2", "18650", "NMC", 3.6, 4.2, 2.5, 3000, 20.0, 4.0, Some(18.0), 48.0, Some(18.3), 65.2, None, None, Some(60.0), Some(300)),
            (5, "EVE", "40P", "21700", "NMC", 3.6, 4.2, 2.5, 4000, 10.0, 4.0, Some(15.0), 68.0, Some(21.1), 70.2, None, None, Some(60.0), Some(1000)),
        ];

        let mut stmt = self.conn.prepare(
            "INSERT INTO cells (id, manufacturer, model, form_factor, chemistry, nominal_voltage, max_voltage, min_voltage, capacity_mah, max_discharge_a, max_charge_a, internal_res_mohm, weight_g, diameter_mm, length_mm, width_mm, height_mm, thermal_limit_c, cycle_life) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )?;

        for cell in cells {
            stmt.execute([
                &cell.0, &cell.1, &cell.2, &cell.3, &cell.4, &cell.5, &cell.6, &cell.7, &cell.8,
                &cell.9, &cell.10, &cell.11, &cell.12, &cell.13, &cell.14, &cell.15, &cell.16, &cell.17, &cell.18
            ])?;
        }

        // Seed materials
        let materials = vec![
            (1, "Pure Nickel 0.15x8mm", "nickel_strip", Some(0.15), Some(8.0), 70.0, 15.0),
            (2, "Pure Nickel 0.2x10mm", "nickel_strip", Some(0.2), Some(10.0), 50.0, 25.0),
            (3, "Copper Busbar 2mm", "busbar", Some(2.0), Some(20.0), 8.5, 100.0),
        ];

        let mut stmt = self.conn.prepare(
            "INSERT INTO materials (id, name, type, thickness_mm, width_mm, resistance_mohm_per_m, max_current_a) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )?;

        for material in materials {
            stmt.execute([
                &material.0, &material.1, &material.2, &material.3, &material.4, &material.5, &material.6
            ])?;
        }

        Ok(())
    }

    pub fn get_cells(&self, search: Option<&str>) -> Result<Vec<Cell>> {
        let query = if let Some(search_term) = search {
            format!("SELECT * FROM cells WHERE id IN (SELECT rowid FROM cells_fts WHERE cells_fts MATCH ?) ORDER BY manufacturer, model")
        } else {
            "SELECT * FROM cells ORDER BY manufacturer, model".to_string()
        };

        let mut stmt = self.conn.prepare(&query)?;

        let rows = if let Some(search_term) = search {
            stmt.query_map([search_term], |row| {
                Ok(Cell {
                    id: row.get(0)?,
                    manufacturer: row.get(1)?,
                    model: row.get(2)?,
                    form_factor: row.get(3)?,
                    chemistry: row.get(4)?,
                    nominal_voltage: row.get(5)?,
                    max_voltage: row.get(6)?,
                    min_voltage: row.get(7)?,
                    capacity_mah: row.get(8)?,
                    max_discharge_a: row.get(9)?,
                    max_charge_a: row.get(10)?,
                    internal_res_mohm: row.get(11)?,
                    weight_g: row.get(12)?,
                    diameter_mm: row.get(13)?,
                    length_mm: row.get(14)?,
                    width_mm: row.get(15)?,
                    height_mm: row.get(16)?,
                    datasheet_url: row.get(17)?,
                    thermal_limit_c: row.get(18)?,
                    cycle_life: row.get(19)?,
                })
            })?
        } else {
            stmt.query_map([], |row| {
                Ok(Cell {
                    id: row.get(0)?,
                    manufacturer: row.get(1)?,
                    model: row.get(2)?,
                    form_factor: row.get(3)?,
                    chemistry: row.get(4)?,
                    nominal_voltage: row.get(5)?,
                    max_voltage: row.get(6)?,
                    min_voltage: row.get(7)?,
                    capacity_mah: row.get(8)?,
                    max_discharge_a: row.get(9)?,
                    max_charge_a: row.get(10)?,
                    internal_res_mohm: row.get(11)?,
                    weight_g: row.get(12)?,
                    diameter_mm: row.get(13)?,
                    length_mm: row.get(14)?,
                    width_mm: row.get(15)?,
                    height_mm: row.get(16)?,
                    datasheet_url: row.get(17)?,
                    thermal_limit_c: row.get(18)?,
                    cycle_life: row.get(19)?,
                })
            })?
        };

        let mut cells = Vec::new();
        for row in rows {
            cells.push(row?);
        }

        Ok(cells)
    }

    pub fn get_cell_by_id(&self, id: i64) -> Result<Option<Cell>> {
        let mut stmt = self.conn.prepare("SELECT * FROM cells WHERE id = ?")?;

        let mut rows = stmt.query_map([id], |row| {
            Ok(Cell {
                id: row.get(0)?,
                manufacturer: row.get(1)?,
                model: row.get(2)?,
                form_factor: row.get(3)?,
                chemistry: row.get(4)?,
                nominal_voltage: row.get(5)?,
                max_voltage: row.get(6)?,
                min_voltage: row.get(7)?,
                capacity_mah: row.get(8)?,
                max_discharge_a: row.get(9)?,
                max_charge_a: row.get(10)?,
                internal_res_mohm: row.get(11)?,
                weight_g: row.get(12)?,
                diameter_mm: row.get(13)?,
                length_mm: row.get(14)?,
                width_mm: row.get(15)?,
                height_mm: row.get(16)?,
                datasheet_url: row.get(17)?,
                thermal_limit_c: row.get(18)?,
                cycle_life: row.get(19)?,
            })
        })?;

        if let Some(row) = rows.next() {
            Ok(Some(row?))
        } else {
            Ok(None)
        }
    }

    pub fn get_materials(&self) -> Result<Vec<Material>> {
        let mut stmt = self.conn.prepare("SELECT * FROM materials ORDER BY name")?;

        let rows = stmt.query_map([], |row| {
            Ok(Material {
                id: row.get(0)?,
                name: row.get(1)?,
                material_type: row.get(2)?,
                thickness_mm: row.get(3)?,
                width_mm: row.get(4)?,
                resistance_mohm_per_m: row.get(5)?,
                max_current_a: row.get(6)?,
            })
        })?;

        let mut materials = Vec::new();
        for row in rows {
            materials.push(row?);
        }

        Ok(materials)
    }

    pub fn get_shapes(&self) -> Result<Vec<Shape>> {
        let mut stmt = self.conn.prepare("SELECT * FROM shapes ORDER BY name")?;

        let rows = stmt.query_map([], |row| {
            Ok(Shape {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                file_path: row.get(3)?,
                default_scale: row.get(4)?,
            })
        })?;

        let mut shapes = Vec::new();
        for row in rows {
            shapes.push(row?);
        }

        Ok(shapes)
    }
}