/**
 * Test FreeLLMAPI connectivity
 * Usage: npx ts-node src/examples/test-freellmapi.ts
 * Requires FREELLMAPI_API_KEY environment variable
 */

import { FreeLLMAPIProvider } from '@agent/providers/freellmapi';

async function testFreeLLMAPI() {
  console.log('Testing FreeLLMAPI connection...\n');
  
  const apiKey = process.env.FREELLMAPI_API_KEY;
  const baseUrl = process.env.FREELLMAPI_BASE_URL || 'http://127.0.0.1:31415/v1';
  
  if (!apiKey) {
    console.error('❌ FREELLMAPI_API_KEY environment variable is not set');
    console.log('\nSet it with:');
    console.log('  set FREELLMAPI_API_KEY=your_key_here');
    console.log('  or add to .env file');
    process.exit(1);
  }
  
  console.log(`Base URL: ${baseUrl}`);
  console.log(`API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
  console.log('');
  
  const provider = new FreeLLMAPIProvider({
    apiKey,
    baseUrl,
  });
  
  try {
    console.log('1. Testing listModels()...');
    const models = await provider.listModels();
    console.log(`✅ Successfully fetched ${models.length} models`);
    console.log('Available models:');
    models.slice(0, 10).forEach(m => {
      console.log(`   - ${m.id}${m.name && m.name !== m.id ? ` (${m.name})` : ''}`);
    });
    if (models.length > 10) {
      console.log(`   ... and ${models.length - 10} more`);
    }
    console.log('');
    
    console.log('2. Testing generate() with auto routing...');
    const response = await provider.generate({
      model: 'auto',
      prompt: 'Hello! Please respond with a short greeting.',
      systemPrompt: 'You are a helpful assistant.',
      temperature: 0.7,
      maxTokens: 50,
    });
    console.log(`✅ Generate successful`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Response: ${response.text.slice(0, 100)}...`);
    console.log('');
    
    console.log('3. Testing generate() with auto:fast routing...');
    const fastResponse = await provider.generate({
      model: 'auto:fast',
      prompt: 'What is 2+2?',
      systemPrompt: 'You are a helpful assistant.',
      temperature: 0.3,
      maxTokens: 30,
    });
    console.log(`✅ Fast generate successful`);
    console.log(`   Model: ${fastResponse.model}`);
    console.log(`   Response: ${fastResponse.text}`);
    console.log('');
    
    console.log('🎉 All tests passed! FreeLLMAPI is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

testFreeLLMAPI();
