import { useEffect, useRef, useState } from 'react';
import type { AgentState } from '@shared/types';

type AgentStatus = 'idle' | 'active' | 'completed' | 'error';

export function useAgentEvents() {
  const [state, setState] = useState<AgentState>('idle');
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [model, setModel] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case 'task_started':
            setState(data.state || 'waiting');
            setStatus('active');
            setMessage(data.message);
            break;
          case 'state_changed':
            setState(data.state);
            setModel(data.model);
            setMessage(data.message);
            setStatus('active');
            break;
          case 'model_started':
            setStatus('active');
            setModel(data.model);
            break;
          case 'model_completed':
            setStatus('completed');
            setMessage(data.message);
            break;
          case 'task_completed':
            setState(data.state);
            setStatus('completed');
            setMessage(data.message);
            break;
          case 'task_failed':
            setState(data.state);
            setStatus('error');
            setMessage(data.message);
            break;
          case 'model_streaming':
            setMessage(data.message);
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setTimeout(() => {
        // reconnect
        wsRef.current = null;
      }, 2000);
    };

    return () => { ws.close(); };
  }, []);

  return { state, status, model, message };
}