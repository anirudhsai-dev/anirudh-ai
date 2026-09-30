/**
 * DeveloperConsole
 * Test UI without real AI model.
 */

import React from 'react';

export const DeveloperConsole: React.FC = () => {
  const states = ['analyzing','navigating','interacting','reasoning','understanding','doing','helping'];
  const send = (type: string) => {
    // In real app this would emit via WS to agent bus
    console.log('Dev event', type);
  };
  return (
    <div className="dev-console">
      <h3>ANIRUDH Developer Console</h3>
      {states.map(s => (
        <button key={s} onClick={() => send(s)}>{s.toUpperCase()}</button>
      ))}
      <button onClick={() => send('success')}>Success</button>
      <button onClick={() => send('error')}>Error</button>
    </div>
  );
};