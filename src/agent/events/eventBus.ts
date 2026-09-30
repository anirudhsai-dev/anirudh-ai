/**
 * AgentEventBus
 * A tiny in-process pub/sub for agent events.
 * The WebSocket server bridges this to external agents.
 */

import type { AgentEvent } from '@shared/types';

export type EventListener = (event: AgentEvent) => void;

export class AgentEventBus {
  private listeners: EventListener[] = [];
  private history: AgentEvent[] = [];
  private readonly maxHistory: number;

  constructor(maxHistory = 100) {
    this.maxHistory = maxHistory;
  }

  emit(event: AgentEvent): void {
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        // never let a listener crash the bus
      }
    }
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getHistory(): AgentEvent[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
  }
}