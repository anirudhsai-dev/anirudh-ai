use tauri::{
    menu::{Menu, MenuItem, MenuItemId},
    tray::TrayIconBuilder,
    Manager, State,
};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use keyring::Entry;

const SERVICE_NAME: &str = "anirudh-ai-pet";
const ACCOUNT_NAME: &str = "freellmapi-api-key";

pub struct AppState {
    pub window_label: String,
    // Fallback in-memory storage if OS keyring is unavailable
    pub memory_api_key: Mutex<Option<String>>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveKeyPayload {
    pub api_key: String,
}

#[tauri::command]
fn save_api_key(state: State<'_, AppState>, payload: SaveKeyPayload) -> Result<(), String> {
    match Entry::new(SERVICE_NAME, ACCOUNT_NAME) {
        Ok(entry) => {
            if let Err(e) = entry.set_password(&payload.api_key) {
                // If keyring fails, fall back to in-memory store
                let mut guard = state.memory_api_key.lock().map_err(|e| e.to_string())?;
                *guard = Some(payload.api_key);
                eprintln!("Keyring set_password failed, fell back to in-memory: {}", e);
            }
        }
        Err(_) => {
            let mut guard = state.memory_api_key.lock().map_err(|e| e.to_string())?;
            *guard = Some(payload.api_key);
        }
    }
    Ok(())
}

#[tauri::command]
fn get_api_key(state: State<'_, AppState>) -> Option<String> {
    if let Ok(entry) = Entry::new(SERVICE_NAME, ACCOUNT_NAME) {
        if let Ok(password) = entry.get_password() {
            if !password.is_empty() {
                return Some(password);
            }
        }
    }
    // Fall back to in-memory
    state.memory_api_key.lock().ok()?.clone()
}

#[tauri::command]
fn delete_api_key(state: State<'_, AppState>) -> Result<(), String> {
    if let Ok(entry) = Entry::new(SERVICE_NAME, ACCOUNT_NAME) {
        let _ = entry.delete_password();
    }
    if let Ok(mut guard) = state.memory_api_key.lock() {
        *guard = None;
    }
    Ok(())
}

#[tauri::command]
async fn set_click_through(window: tauri::Window, click_through: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(click_through).map_err(|e| e.to_string())?;
    window.set_always_on_top(true).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn set_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
    window.set_always_on_top(always_on_top).map_err(|e| e.to_string())
}

#[tauri::command]
async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_models(base_url: String, api_key: String) -> Result<Vec<serde_json::Value>, String> {
    use reqwest::Client;
    let client = Client::new();
    let res = client
        .get(format!("{}/models", base_url.trim_end_matches('/')))
        .header("Authorization", format!("Bearer {}", api_key))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("HTTP {}", res.status()));
    }

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    if let Some(data) = json.get("data").and_then(|d| d.as_array()) {
        Ok(data.clone())
    } else {
        Ok(vec![])
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .manage(AppState {
            window_label: "main".into(),
            memory_api_key: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            save_api_key,
            get_api_key,
            delete_api_key,
            get_models,
            set_click_through,
            set_always_on_top,
            minimize_window,
            close_window
        ])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(true);
                let _ = window.set_decorations(false);
                let _ = window.set_ignore_cursor_events(false);
            }
            let window_label = "main".to_string();
            let show_item = MenuItem::with_id(app.handle(), MenuItemId::new("show"), "Show", true, None);
            let hide_item = MenuItem::with_id(app.handle(), MenuItemId::new("hide"), "Hide", true, None);
            let quit_item = MenuItem::with_id(app.handle(), MenuItemId::new("quit"), "Quit", true, None);
            let tray_menu = Menu::with_items(app.handle(), &[&show_item, &hide_item, &quit_item]);
            
            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .on_menu_event(move |app, id| {
                    let label = window_label.clone();
                    match id.as_ref() {
                        "show" => {
                            if let Some(w) = app.get_webview_window(&label) {
                                let _ = w.show();
                            }
                        }
                        "hide" => {
                            if let Some(w) = app.get_webview_window(&label) {
                                let _ = w.hide();
                            }
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
