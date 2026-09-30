const { AgentEventBus } = require('./src/agent/events/eventBus');
const { AgentWsServer } = require('./src/websocket/server');

// simple test: emit events to WS
const bus = new AgentEventBus();
const ws = new AgentWsServer({ port: 8765, bus });
ws.start();

setInterval(() => {
  bus.emit({ type: 'state_changed', state: 'reasoning', model: 'demo-model', message: 'Thinking...', timestamp: Date.now() });
}, 3000);

console.log('WS server running on ws://localhost:8765');