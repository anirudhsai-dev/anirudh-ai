const fs = require('fs');
const mainPath = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src-tauri\\src\\main.rs';
let src = fs.readFileSync(mainPath,'utf8');
src = src.replace('#[tauri::command]\nfn set_click_through(click_through: bool) -> Result<(), String> {\n    let window = tauri::api::process::process::Process;\n    Ok(())\n}', `#[tauri::command]
async fn set_click_through(window: tauri::Window, click_through: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(click_through).map_err(|e| e.to_string())?;
    window.set_always_on_top(true).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}`);
fs.writeFileSync(mainPath, src);
console.log('window commands implemented');