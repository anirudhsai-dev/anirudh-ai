/**
 * Example: Wire up everything for manual testing.
 * Run with: node examples/bootstrap.ts (after building)
 */

import { FreeLLMAPIProvider } from '@agent/providers/freellmapi';
import { AgentOrchestrator } from '@agent/orchestrator/orchestrator';
import { AgentWsServer } from '@websocket/server';
import { AgentEventBus } from '@agent/events/eventBus';
import { DEFAULT_SETTINGS } from '@shared/types';
import { InMemorySecureStore } from '@shared/secureStore';

async function run() {
  const store = new InMemorySecureStore();
  await store.set('FREELLMAPI_API_KEY', process.env.FREELLMAPI_API_KEY ?? '');
  const apiKey = await store.get('FREELLMAPI_API_KEY') ?? '';

  const provider = new FreeLLMAPIProvider({
    apiKey,
    baseUrl: DEFAULT_SETTINGS.freellmapi.baseUrl,
  });

  const bus = new AgentEventBus();
  bus.subscribe(evt => console.log('[EVENT]', evt));

  const orchestrator = new AgentOrchestrator({
    settings: DEFAULT_SETTINGS,
    provider,
  });

  const ws = new AgentWsServer({ port: 8765, bus });
  ws.start();

  // Demo: list models
  try {
    const models = await provider.listModels();
    console.log('Available models:', models.map(m => m.id).join(', '));
  } catch (e) {
    console.warn('Could not list models (no key?)', e);
  }
}

run().catch(console.error);