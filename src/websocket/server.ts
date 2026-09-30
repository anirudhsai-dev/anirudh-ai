/**
 * WebSocket Server
 * Bridges AgentEventBus to remote agents / renderer.
 * Listens on a local port so any process can control ANIRUDH via events.
 */

import { WebSocketServer } from 'ws';
import type { AgentEvent } from '@shared/types';
import { AgentEventBus } from '@agent/events/eventBus';

export interface WsServerOptions {
  port: number;
  bus: AgentEventBus;
}

export class AgentWsServer {
  private wss: WebSocketServer | null = null;
  private clients = new Set<any>();

  constructor(private readonly options: WsServerOptions) {}

  start(): void {
    this.wss = new WebSocketServer({ port: this.options.port });
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
      ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          // Simple echo back for test events
          if (msg.type === 'dev_event') {
            this.options.bus.emit({
              type: 'message',
              message: JSON.stringify(msg.payload),
              timestamp: Date.now(),
            });
          }
        } catch { /* ignore */ }
      });
    });

    this.options.bus.subscribe((evt) => this.broadcast(evt));
  }

  private broadcast(evt: AgentEvent): void {
    const payload = JSON.stringify(evt);
    for (const ws of this.clients) {
      if (ws.readyState === 1) {
        ws.send(payload);
      }
    }
  }

  stop(): void {
    this.wss?.close();
    this.wss = null;
  }
}