const fs = require('fs');
const mainPath = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src-tauri\\src\\main.rs';
let src = fs.readFileSync(mainPath,'utf8');
src = src.replace('use tauri::{Manager, State, tray::{TrayIconBuilder, TrayIcon}};', 'use tauri::{Manager, State, tray::{TrayIconBuilder, TrayIcon}, menu::{Menu, MenuItem, MenuItemId}, Manager as _};');
src = src.replace('let _ = window.set_decorations(false);', 'let _ = window.set_decorations(false);\n            let _ = window.set_ignore_cursor_events(false);');
src = src.replace("let _ = window.set_always_on_top(true);\n            let _ = window.set_decorations(false);", "let _ = window.set_always_on_top(true);\n            let _ = window.set_decorations(false);\n            let _ = window.set_ignore_cursor_events(false);");
const setupBlock = `.setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let _ = window.set_always_on_top(true);
            let _ = window.set_decorations(false);
            let _ = window.set_ignore_cursor_events(false);
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
                        "show" => { if let Some(w) = app.get_webview_window(&label) { let _ = w.show(); } }
                        "hide" => { if let Some(w) = app.get_webview_window(&label) { let _ = w.hide(); } }
                        "quit" => { std::process::exit(0); }
                        _ => {}
                    }
                })
                .build(app);
            Ok(())
        })`;
src = src.replace(/\.setup\(\|app\|\s*\{[\s\S]*?\n\s*\}\s*\)/, setupBlock);
fs.writeFileSync(mainPath, src);
console.log('tray controls added');