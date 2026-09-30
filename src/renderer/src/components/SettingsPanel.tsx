import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { getModels, saveApiKey, getApiKey } from '../tauri';

export const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const settings = useSettingsStore(s => s.settings);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const setApiKeyFromTauri = useSettingsStore(s => s.setApiKeyFromTauri);
  const apiKeyFromTauri = useSettingsStore(s => s.apiKeyFromTauri);
  
  const [apiKey, setApiKey] = useState('');
  const [routing, setRouting] = useState(settings.modelRouting);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const capabilities = [
    { key: 'analyzing', label: 'A Analyze' },
    { key: 'navigating', label: 'N Navigate' },
    { key: 'interacting', label: 'I Interact' },
    { key: 'reasoning', label: 'R Reason' },
    { key: 'understanding', label: 'U Understand' },
    { key: 'doing', label: 'D Do' },
    { key: 'helping', label: 'H Help' },
  ];

  // Load API key from Tauri keychain on mount
  useEffect(() => {
    const loadKey = async () => {
      try {
        const key = await getApiKey();
        setApiKey(key || '');
        setApiKeyFromTauri(key);
      } catch {
        setApiKey('');
        setApiKeyFromTauri(null);
      }
    };
    loadKey();
  }, [setApiKeyFromTauri]);

  const fetchModels = async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      const data = await getModels(settings.freellmapi.baseUrl, apiKey);
      setModels(data || []);
    } catch { setModels([]); }
    setLoading(false);
  };

  useEffect(() => { fetchModels(); }, [apiKey]);

  const save = async () => {
    if (!apiKey) return;
    setSaving(true);
    try {
      await saveApiKey(apiKey);
      updateSettings({ modelRouting: routing });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-panel">
      <h2>ANIRUDH AI</h2>
      <label>
        FreeLLMAPI API Key
        <input 
          type="password" 
          value={apiKey} 
          onChange={e => setApiKey(e.target.value)} 
          placeholder="●●●●●●●●●●●●" 
        />
        <small>
          {apiKeyFromTauri ? 'Stored in OS keychain' : 'Not stored'}
        </small>
      </label>
      {loading && <div>Loading models...</div>}
      {capabilities.map(c => (
        <div key={c.key} className="row">
          <span>{c.label}</span>
          <select 
            value={routing[c.key as keyof typeof routing]} 
            onChange={e => setRouting(r => ({...r, [c.key]: e.target.value}))}
          >
            <option value="">Select model</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
          </select>
        </div>
      ))}
      <div className="actions">
        <button onClick={save} disabled={saving || !apiKey}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
