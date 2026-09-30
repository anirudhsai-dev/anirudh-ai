/**
 * DeveloperConsole
 * Test UI without real AI model.
 */

import React, { useState } from 'react';

export const DeveloperConsole: React.FC = () => {
  const [model, setModel] = useState('test-model');
  const states = ['analyzing','navigating','interacting','reasoning','understanding','doing','helping'];
  
  const wsRef = React.useRef<WebSocket | null>(null);
  
  React.useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const sendState = (state: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    wsRef.current.send(JSON.stringify({
      type: 'dev_event',
      payload: {
        type: 'state_changed',
        state,
        model,
        message: `Dev test: ${state}`,
        timestamp: Date.now(),
      }
    }));
    console.log('Dev event sent:', state);
  };

  const sendSuccess = () => {
    sendState('success');
  };

  const sendError = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    wsRef.current.send(JSON.stringify({
      type: 'dev_event',
      payload: {
        type: 'task_failed',
        state: 'error',
        model,
        message: 'Dev test error',
        timestamp: Date.now(),
      }
    }));
  };

  return (
    <div className="dev-console">
      <h3>ANIRUDH Developer Console</h3>
      <div className="dev-row">
        <label>Model:</label>
        <input 
          value={model} 
          onChange={e => setModel(e.target.value)}
          placeholder="test-model"
        />
      </div>
      <div className="dev-grid">
        {states.map(s => (
          <button key={s} onClick={() => sendState(s)}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="dev-actions">
        <button onClick={sendSuccess} className="success">Success</button>
        <button onClick={sendError} className="error">Error</button>
      </div>
    </div>
  );
};