const fs = require('fs');
const path = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src\\renderer\\src\\components\\WindowControls.tsx';
fs.writeFileSync(path, `import React, { useState } from 'react';
export const WindowControls: React.FC = () => {
  const [clickThrough, setClickThrough] = useState(false);
  const toggle = () => {
    setClickThrough(c => !c);
    // In Tauri, call window.setIgnoreCursorEvents via IPC
    window.dispatchEvent(new CustomEvent('click-through-toggle', { detail: !clickThrough }));
  };
  return (
    <div className="window-controls">
      <label>
        Click-through
        <input type="checkbox" checked={clickThrough} onChange={toggle} />
      </label>
      <button onClick={() => window.dispatchEvent(new Event('minimize-window'))}>_</button>
      <button onClick={() => window.dispatchEvent(new Event('close-window'))}>×</button>
    </div>
  );
};
`);
console.log('window controls written');