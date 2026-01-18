use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::{AppHandle, Manager};

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

        // TODO: Add database seeding back when parameter limits are resolved

        Ok(())
    }

    pub fn get_cells(&self, search: Option<&str>) -> Result<Vec<Cell>> {
        let mut cells = Vec::new();

        if let Some(search_term) = search {
            let query = "SELECT * FROM cells WHERE id IN (SELECT rowid FROM cells_fts WHERE cells_fts MATCH ?) ORDER BY manufacturer, model";
            let mut stmt = self.conn.prepare(query)?;
            let rows = stmt.query_map([search_term], Self::row_to_cell)?;

            for row in rows {
                cells.push(row?);
            }
        } else {
            let query = "SELECT * FROM cells ORDER BY manufacturer, model";
            let mut stmt = self.conn.prepare(query)?;
            let rows = stmt.query_map([], Self::row_to_cell)?;

            for row in rows {
                cells.push(row?);
            }
        }

        Ok(cells)
    }

    fn row_to_cell(row: &rusqlite::Row) -> Result<Cell> {
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
    }

    pub fn get_cell_by_id(&self, id: i64) -> Result<Option<Cell>> {
        let mut stmt = self.conn.prepare("SELECT * FROM cells WHERE id = ?")?;
        let mut rows = stmt.query_map([id], Self::row_to_cell)?;

        if let Some(row) = rows.next() {
            Ok(Some(row?))
        } else {
            Ok(None)
        }
    }

    pub fn get_materials(&self) -> Result<Vec<Material>> {
        let mut stmt = self.conn.prepare("SELECT * FROM materials ORDER BY name")?;
        let rows = stmt.query_map([], Self::row_to_material)?;

        let mut materials = Vec::new();
        for row in rows {
            materials.push(row?);
        }

        Ok(materials)
    }

    fn row_to_material(row: &rusqlite::Row) -> Result<Material> {
        Ok(Material {
            id: row.get(0)?,
            name: row.get(1)?,
            material_type: row.get(2)?,
            thickness_mm: row.get(3)?,
            width_mm: row.get(4)?,
            resistance_mohm_per_m: row.get(5)?,
            max_current_a: row.get(6)?,
        })
    }

    pub fn get_shapes(&self) -> Result<Vec<Shape>> {
        let mut stmt = self.conn.prepare("SELECT * FROM shapes ORDER BY name")?;
        let rows = stmt.query_map([], Self::row_to_shape)?;

        let mut shapes = Vec::new();
        for row in rows {
            shapes.push(row?);
        }

        Ok(shapes)
    }

    fn row_to_shape(row: &rusqlite::Row) -> Result<Shape> {
        Ok(Shape {
            id: row.get(0)?,
            name: row.get(1)?,
            category: row.get(2)?,
            file_path: row.get(3)?,
            default_scale: row.get(4)?,
        })
    }
}