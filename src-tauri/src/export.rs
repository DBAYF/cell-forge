use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct STLExportOptions {
    pub selection: String, // "all" | "selected" | "holders-only" | "cells-only"
    pub merge_geometries: bool,
    pub apply_transforms: bool,
    pub scale: f64,
    pub file_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ThreeMFExportOptions {
    pub selection: String, // "all" | "selected"
    pub include_colors: bool,
    pub include_materials: bool,
    pub separate_objects: bool,
    pub build_plate_origin: bool,
    pub file_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResult {
    pub success: bool,
    pub data: Option<Vec<u8>>,
    pub error: Option<String>,
}

pub struct Exporter;

impl Exporter {
    pub fn new() -> Self {
        Exporter
    }

    // These functions are primarily handled on the frontend with Three.js
    // The backend just provides file I/O operations
    pub fn validate_stl_options(&self, options: &STLExportOptions) -> Result<(), String> {
        if options.file_name.is_empty() {
            return Err("File name cannot be empty".to_string());
        }

        match options.selection.as_str() {
            "all" | "selected" | "holders-only" | "cells-only" => Ok(()),
            _ => Err("Invalid selection option".to_string()),
        }
    }

    pub fn validate_three_mf_options(&self, options: &ThreeMFExportOptions) -> Result<(), String> {
        if options.file_name.is_empty() {
            return Err("File name cannot be empty".to_string());
        }

        match options.selection.as_str() {
            "all" | "selected" => Ok(()),
            _ => Err("Invalid selection option".to_string()),
        }
    }

    pub fn get_supported_formats(&self) -> Vec<String> {
        vec!["stl".to_string(), "3mf".to_string()]
    }

    pub fn get_format_extensions(&self) -> HashMap<String, String> {
        let mut extensions = HashMap::new();
        extensions.insert("stl".to_string(), "stl".to_string());
        extensions.insert("3mf".to_string(), "3mf".to_string());
        extensions
    }
}