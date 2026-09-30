import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { getModels, saveApiKey } from '../tauri';

export const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const settings = useSettingsStore(s => s.settings);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const [apiKey, setApiKey] = useState(settings.freellmapi.apiKey || '');
  const [routing, setRouting] = useState(settings.modelRouting);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const capabilities = [
    { key: 'analyzing', label: 'A Analyze' },
    { key: 'navigating', label: 'N Navigate' },
    { key: 'interacting', label: 'I Interact' },
    { key: 'reasoning', label: 'R Reason' },
    { key: 'understanding', label: 'U Understand' },
    { key: 'doing', label: 'D Do' },
    { key: 'helping', label: 'H Help' },
  ];

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
    await saveApiKey(apiKey);
    updateSettings({ modelRouting: routing });
    onClose();
  };

  return (
    <div className="settings-panel">
      <h2>ANIRUDH AI</h2>
      <label>
        FreeLLMAPI API Key
        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="●●●●●●●●●●●●" />
      </label>
      {loading && <div>Loading models...</div>}
      {capabilities.map(c => (
        <div key={c.key} className="row">
          <span>{c.label}</span>
          <select value={routing[c.key as keyof typeof routing]} onChange={e => setRouting(r => ({...r, [c.key]: e.target.value}))}>
            <option value="">Select model</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
          </select>
        </div>
      ))}
      <button onClick={save}>Save Configuration</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
