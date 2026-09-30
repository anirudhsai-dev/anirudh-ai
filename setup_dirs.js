const fs = require('fs');
const path = require('path');
const dirs = [
  'src/main', 'src/preload',
  'src/renderer/src/components', 'src/renderer/src/components/letters',
  'src/renderer/src/hooks', 'src/renderer/src/services', 'src/renderer/src/store', 'src/renderer/src/styles',
  'src/agent/orchestrator', 'src/agent/providers', 'src/agent/events', 'src/agent/state', 'src/agent/computeruse',
  'src/shared', 'src/websocket', 'public', 'config',
];
dirs.forEach(d => fs.mkdirSync(path.join(__dirname, d), { recursive: true }));
console.log('done');