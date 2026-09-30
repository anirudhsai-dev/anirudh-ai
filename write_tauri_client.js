const fs = require('fs');
fs.writeFileSync('C:\\Users\\aniru\\Downloads\\anirudh-ai\\src\\renderer\\src\\tauri.ts', `export async function saveApiKey(key: string) {
  await (window as any).__TAURI__.invoke('save_api_key', { apiKey: key });
}
export async function getApiKey(): Promise<string | null> {
  return await (window as any).__TAURI__.invoke('get_api_key');
}
export async function getModels(baseUrl: string, apiKey: string) {
  return await (window as any).__TAURI__.invoke('get_models', { baseUrl, apiKey });
}
`);
console.log('tauri client written');