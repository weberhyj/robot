use serde::Serialize;
use std::{fs, path::PathBuf};
use tauri::Manager;

const DEFAULT_API_BASE_URL: &str = "http://127.0.0.1:8080";

#[derive(Serialize)]
struct RuntimeConfig {
    #[serde(rename = "apiBaseUrl")]
    api_base_url: String,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self {
            api_base_url: DEFAULT_API_BASE_URL.to_string(),
        }
    }
}

#[tauri::command]
fn get_runtime_config(app: tauri::AppHandle) -> RuntimeConfig {
    runtime_config_paths(&app)
        .into_iter()
        .find_map(read_runtime_config)
        .unwrap_or_default()
}

fn runtime_config_paths(app: &tauri::AppHandle) -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if cfg!(debug_assertions) {
        if let Ok(current_dir) = std::env::current_dir() {
            paths.push(current_dir.join("config.json"));
        }
    }

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            paths.push(exe_dir.join("config.json"));
        }
    }

    if let Ok(resource_dir) = app.path().resource_dir() {
        paths.push(resource_dir.join("config.json"));
    }

    paths
}

fn read_runtime_config(path: PathBuf) -> Option<RuntimeConfig> {
    let content = fs::read_to_string(path).ok()?;
    let value = serde_json::from_str::<serde_json::Value>(&content).ok()?;
    let api_base_url = value
        .get("apiBaseUrl")
        .and_then(|value| value.as_str())
        .map(str::trim)
        .filter(|value| !value.is_empty())?;

    Some(RuntimeConfig {
        api_base_url: api_base_url.to_string(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_runtime_config])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
