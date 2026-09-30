const fs = require('fs');
const p = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src-tauri';
fs.mkdirSync(p, {recursive:true});
fs.mkdirSync(p + '\\src', {recursive:true});
fs.writeFileSync(p + '\\Cargo.toml', `[package]
name = "anirudh"
version = "0.1.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "2" }

[dependencies]
tauri = { version = "2" }
`);
fs.writeFileSync(p + '\\src\\main.rs', `use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let _ = window.set_always_on_top(true);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`);
console.log('tauri scaffolded');