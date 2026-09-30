const fs = require('fs');
const path = 'C:\\Users\\aniru\\Downloads\\anirudh-ai\\src\\renderer\\src\\components\\TrayControls.tsx';
fs.writeFileSync(path, `import React from 'react';
export const TrayControls: React.FC = () => {
  return (
    <div className="tray-controls">
      <button onClick={() => window.dispatchEvent(new Event('hide-window'))}>Hide</button>
      <button onClick={() => window.dispatchEvent(new Event('show-window'))}>Show</button>
    </div>
  );
};
`);
console.log('done');