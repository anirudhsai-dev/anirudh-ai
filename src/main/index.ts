/**
 * Main process bootstrap (Electron/Tauri entrypoint concept)
 * Loads settings, creates provider, orchestrator, WS server.
 * For Tauri, replace native Node imports with Tauri APIs.
 */

import { FreeLLMAPIProvider } from '@agent/providers/freellmapi';
import { AgentOrchestrator } from '@agent/orchestrator/orchestrator';
import { AgentEventBus } from '@agent/events/eventBus';
import { AgentWsServer } from '@websocket/server';
import { DEFAULT_SETTINGS } from '@shared/types';
import { InMemorySecureStore } from '@shared/secureStore';

// Placeholder bootstrap — in a real Tauri app this runs in main thread
async function bootstrap() {
  const store = new InMemorySecureStore();
  const settings = { ...DEFAULT_SETTINGS };
  const apiKey = await store.get('FREELLMAPI_API_KEY') || '';

  const provider = new FreeLLMAPIProvider({
    apiKey,
    baseUrl: settings.freellmapi.baseUrl,
  });

  const bus = new AgentEventBus();
  const orchestrator = new AgentOrchestrator({ settings, provider });

  const ws = new AgentWsServer({ port: 8765, bus });
  ws.start();

  // Expose a simple test hook
  (globalThis as any).orchestrator = orchestrator;
  (globalThis as any).bus = bus;

  console.log('ANIRUDH agent started. WebSocket on ws://localhost:8765');
}

bootstrap().catch(console.error);