import React from 'react';
export const TrayControls: React.FC = () => {
  return (
    <div className="tray-controls">
      <button onClick={() => window.dispatchEvent(new Event('hide-window'))}>Hide</button>
      <button onClick={() => window.dispatchEvent(new Event('show-window'))}>Show</button>
    </div>
  );
};
