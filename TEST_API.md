# Testing FreeLLMAPI Integration

## Quick Test

Test API connectivity with the provided script:

```bash
# Set your API key
set FREELLMAPI_API_KEY=your_api_key_here

# Run test
npx ts-node src/examples/test-freellmapi.ts
```

Or create a `.env` file:
```
FREELLMAPI_API_KEY=your_api_key_here
FREELLMAPI_BASE_URL=http://127.0.0.1:31415/v1
```

## What the test checks

1. **listModels()** - Fetches available models from FreeLLMAPI
2. **generate() with auto** - Tests auto routing
3. **generate() with auto:fast** - Tests fast mode routing

## Manual test with curl

```bash
curl http://127.0.0.1:31415/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}'
```

## Expected output

```
Testing FreeLLMAPI connection...

Base URL: http://127.0.0.1:31415/v1
API Key: abcd1234...wxyz

1. Testing listModels()...
✅ Successfully fetched 15 models
Available models:
   - auto
   - auto:fast
   - gpt-4o-mini
   ...

2. Testing generate() with auto routing...
✅ Generate successful
   Model: gpt-4o-mini
   Response: Hello! How can I help you today?...

🎉 All tests passed! FreeLLMAPI is working correctly.
```
