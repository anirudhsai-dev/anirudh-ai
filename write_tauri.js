const fs = require('fs');
const content = `{
  "$schema": "https://tauri.studio/schema/v2.json",
  "productName": "anirudh",
  "version": "0.1.0",
  "identifier": "app.anirudh.desktop",
  "build": {
    "beforeDevCommand": "vite",
    "beforeBuildCommand": "vite build",
    "devPath": "http://localhost:5173",
    "distDir": "dist",
    "withGlobalTauri": true
  },
  "package": { "productName": "ANIRUDH", "version": "0.1.0" },
  "tauri": {
    "allowlist": { "all": false, "shell": {"open": true}, "window": {"all": true}, "fs": {"readFile": true, "writeFile": true} },
    "bundle": { "resources": ["assets"], "category": "Utility" },
    "security": { "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" },
    "windows": [{ "label": "main", "width": 420, "height": 220, "resizable": true, "decorations": false, "transparent": true, "alwaysOnTop": true }]
  }
}`;
fs.writeFileSync('C:\\Users\\aniru\\Downloads\\anirudh-ai\\tauri.conf.json', content);
console.log('done');