const fs = require('fs');
const mainPath = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src-tauri\\src\\main.rs';
let src = fs.readFileSync(mainPath,'utf8');
src = src.replace('use tauri::{Manager, State, tray::{TrayIconBuilder, TrayIcon}, menu::{Menu, MenuItem, MenuItemId}, Manager as _};', 'use tauri::{Manager, State, tray::{TrayIconBuilder, TrayIcon}, menu::{Menu, MenuItem, MenuItemId}};');
src = src.replace('#[tauri::command]\nasync fn get_models', '#[tauri::command]\nfn set_click_through(click_through: bool) -> Result<(), String> {\n    let window = tauri::api::process::process::Process;\n    Ok(())\n}\n\n#[tauri::command]\nasync fn get_models');
src = src.replace('.invoke_handler(tauri::generate_handler![save_api_key, get_api_key, get_models])', '.invoke_handler(tauri::generate_handler![save_api_key, get_api_key, get_models, set_click_through, minimize_window, close_window])');
src = src.replace('pub struct AppState {', 'pub struct AppState {\n    pub window_label: String,\n}');
fs.writeFileSync(mainPath, src);
console.log('commands added');