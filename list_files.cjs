const fs = require('fs');
const path = require('path');

function walk(base, files = []) {
  const entries = fs.readdirSync(base, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(base, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

const root = __dirname;
const files = walk(root);
console.log('Files created:');
files.filter(f => !f.includes('node_modules')).forEach(f => console.log(f.replace(root, '.')));
