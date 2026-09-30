const fs = require('fs');
const mainPath = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src-tauri\\src\\main.rs';
let src = fs.readFileSync(mainPath, 'utf8');
src = src.replace('use tauri::{Manager, State};', 'use tauri::{Manager, State, tray::{TrayIconBuilder, TrayIcon}};');
src = src.replace('pub struct AppState {', 'pub struct AppState {\n    pub window_label: String,\n}');
src = src.replace("pub struct AppState {\n    pub api_key: Option<String>,\n}", 'pub struct AppState {\n    pub api_key: Option<String>,\n    pub window_label: String,\n}');
src = src.replace('.manage(AppState::default())', '.manage(AppState { api_key: None, window_label: "main".into() })');
src = src.replace('.setup(|app| {\n            let window = app.get_webview_window(\"main\").unwrap();\n            let _ = window.set_always_on_top(true);\n            let _ = window.set_decorations(false);\n            Ok(())\n        })', `.setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let _ = window.set_always_on_top(true);
            let _ = window.set_decorations(false);
            let state = app.state::<AppState>();
            let window_label = state.window_label.clone();
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(move |app, event_id| {
                    let _ = app.get_webview_window(&window_label);
                })
                .build(app);
            let _ = tray;
            Ok(())
        })`);
fs.writeFileSync(mainPath, src);
console.log('tray added');