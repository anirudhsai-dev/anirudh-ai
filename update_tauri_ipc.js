const fs = require('fs');
const p = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src-tauri\\src';
fs.mkdirSync(p, {recursive:true});
const libRs = fs.readFileSync(p+'\\main.rs','utf8');
const mainRs = `use tauri::{Manager, State};
use serde::{Serialize, Deserialize};

#[derive(Default)]
pub struct AppState {
    pub api_key: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveKeyPayload { pub api_key: String, }

#[tauri::command]
fn save_api_key(state: State<'_, AppState>, payload: SaveKeyPayload) -> Result<(), String> {
    state.api_key = Some(payload.api_key);
    Ok(())
}

#[tauri::command]
fn get_api_key(state: State<'_, AppState>) -> Option<String> {
    state.api_key.clone()
}

#[tauri::command]
async fn get_models(base_url: String, api_key: String) -> Result<Vec<serde_json::Value>, String> {
    use reqwest::Client;
    let client = Client::new();
    let res = client.get(format!("{}/models", base_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .send().await.map_err(|e| e.to_string())?;
    if !res.status().is_success() { return Err(format!("HTTP {}", res.status())); }
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    if let Some(data) = json.get("data").and_then(|d| d.as_array()) { Ok(data.clone()) } else { Ok(vec![]) }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![save_api_key, get_api_key, get_models])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let _ = window.set_always_on_top(true);
            let _ = window.set_decorations(false);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`;
fs.writeFileSync(p+'\\main.rs', mainRs);
const cargo = `[package]
name = "anirudh"
version = "0.1.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "2" }

[dependencies]
tauri = { version = "2" }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.11", features = ["json"] }
`;
fs.writeFileSync('C:\\Users\\aniru\\Downloads\\anirudh-ai\\src-tauri\\Cargo.toml', cargo);
console.log('tauri ipc updated');