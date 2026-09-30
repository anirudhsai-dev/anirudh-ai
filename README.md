# ANIRUDH

AI-Powered Live2D Desktop Agent Pet

## Quick Start

### Desktop App (Tauri)
1. Install Tauri CLI: `npm install -g @tauri/cli`
2. Create `.env` from `.env.example`
3. `npm install`
4. `npm run tauri:dev` — runs as desktop app with always-on-top transparent window

### Web Preview
1. Create `.env` from `.env.example`
2. `npm install`
3. `npm run dev` — opens in browser for development

## FreeLLMAPI Configuration

**Base URL:** `http://127.0.0.1:31415/v1`

**API Endpoints:**
- Chat: `/v1/chat/completions`
- Responses: `/v1/responses`
- Messages (Anthropic-compatible): `/v1/messages`
- Embeddings: `/v1/embeddings`

**Usage:**
```bash
# Auto mode (use active chain)
curl http://127.0.0.1:31415/v1/chat/completions \
  -H "Authorization: Bearer $YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}'

# Fast mode (prioritize speed)
curl http://127.0.0.1:31415/v1/chat/completions \
  -H "Authorization: Bearer $YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"auto:fast","messages":[{"role":"user","content":"Hello"}]}'
```

**Embeddings:** Use model `"auto"` or a family from the Embeddings tab. `auto:fast` prioritizes speed.

## Architecture

See `plan.txt` for full specification.

## MVP Phases

Phase 1 — Visual Pet: transparent window, letters, animations
Phase 2 — State Machine
Phase 3 — FreeLLMAPI integration
Phase 4 — Agent Orchestrator
Phase 5 — External Agent API (WebSocket)
Phase 6 — Computer Use
Phase 7 — Polish

## Security

Never commit API keys. Use OS keychain for production.