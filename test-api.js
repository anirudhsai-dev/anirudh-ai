/**
 * Simple FreeLLMAPI test using fetch
 * Usage: node test-api.js
 * Requires FREELLMAPI_API_KEY environment variable
 */

const apiKey = process.env.FREELLMAPI_API_KEY;
const baseUrl = process.env.FREELLMAPI_BASE_URL || 'http://127.0.0.1:31415/v1';

if (!apiKey) {
  console.error('❌ FREELLMAPI_API_KEY environment variable is not set');
  console.log('\nSet it with:');
  console.log('  set FREELLMAPI_API_KEY=your_key_here');
  process.exit(1);
}

console.log('Testing FreeLLMAPI connection...\n');
console.log(`Base URL: ${baseUrl}`);
console.log(`API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
console.log('');

async function testAPI() {
  try {
    // Test 1: List models
    console.log('1. Testing listModels()...');
    const modelsRes = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!modelsRes.ok) {
      throw new Error(`HTTP ${modelsRes.status}: ${await modelsRes.text()}`);
    }
    
    const modelsData = await modelsRes.json();
    const models = modelsData.data || [];
    console.log(`✅ Successfully fetched ${models.length} models`);
    console.log('Available models:');
    models.slice(0, 10).forEach(m => {
      console.log(`   - ${m.id}`);
    });
    console.log('');
    
    // Test 2: Generate with auto
    console.log('2. Testing generate() with auto routing...');
    const genRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'auto',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello! Please respond with a short greeting.' }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });
    
    if (!genRes.ok) {
      throw new Error(`HTTP ${genRes.status}: ${await genRes.text()}`);
    }
    
    const genData = await genRes.json();
    console.log(`✅ Generate successful`);
    console.log(`   Model: ${genData.model}`);
    console.log(`   Response: ${genData.choices[0].message.content.slice(0, 100)}...`);
    console.log('');
    
    console.log('🎉 All tests passed! FreeLLMAPI is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();
