/**
 * Secure storage for sensitive data (API keys).
 * Uses Electron safeStorage when available; otherwise stores in memory for tests.
 * In production, Electron main process should use safeStorage.
 */

export interface SecureStore {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
}

export class InMemorySecureStore implements SecureStore {
  private map = new Map<string, string>();
  async set(k: string, v: string) { this.map.set(k, v); }
  async get(k: string) { return this.map.get(k) ?? null; }
  async remove(k: string) { this.map.delete(k); }
}

export class NodeSecureStore implements SecureStore {
  private readonly path: string;
  constructor(private readonly file: string) {
    this.path = file;
  }
  async set(k: string, v: string): Promise<void> {
    // naive JSON map file — for dev only. Real apps should use OS keychain.
    const fs = await import('fs/promises');
    let data: Record<string, string> = {};
    try {
      const raw = await fs.readFile(this.path, 'utf8');
      data = JSON.parse(raw);
    } catch { /* ignore */ }
    data[k] = v;
    await fs.writeFile(this.path, JSON.stringify(data));
  }
  async get(k: string): Promise<string | null> {
    const fs = await import('fs/promises');
    try {
      const raw = await fs.readFile(this.path, 'utf8');
      const data = JSON.parse(raw) as Record<string, string>;
      return data[k] ?? null;
    } catch { return null; }
  }
  async remove(k: string): Promise<void> {
    const fs = await import('fs/promises');
    try {
      const raw = await fs.readFile(this.path, 'utf8');
      const data = JSON.parse(raw) as Record<string, string>;
      delete data[k];
      await fs.writeFile(this.path, JSON.stringify(data));
    } catch { /* ignore */ }
  }
}