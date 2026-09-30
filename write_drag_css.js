const fs = require('fs');
const content = `.anirudh-pet { -webkit-app-region: drag; }
.controls, .settings-panel, .dev-console, .window-controls, .tray-controls { -webkit-app-region: no-drag; }`;
fs.writeFileSync('C:\\Users\\aniru\\Downloads\\anirudh-ai\\src\\renderer\\src\\drag.css', content);
console.log('drag css written');