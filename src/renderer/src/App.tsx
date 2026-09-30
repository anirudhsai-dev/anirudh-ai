import React from 'react';
import { AnirudhPet } from './components/AnirudhPet';
import { SettingsPanel } from './components/SettingsPanel';
import { DeveloperConsole } from './components/DeveloperConsole';
import { useAgentEvents } from './hooks/useAgentEvents';
import { useSettingsStore } from './store/settingsStore';
import { getApiKey } from './tauri';

export const App: React.FC = () => {
  const { state, status, model, message } = useAgentEvents();
  const settings = useSettingsStore(s => s.settings);
  const setApiKeyFromTauri = useSettingsStore(s => s.setApiKeyFromTauri);
  const apiKeyFromTauri = useSettingsStore(s => s.apiKeyFromTauri);
  const apiKeyLoaded = useSettingsStore(s => s.apiKeyLoaded);
  
  const [showSettings, setShowSettings] = React.useState(false);
  const [devMode, setDevMode] = React.useState(false);
  const [checkingKey, setCheckingKey] = React.useState(true);

  // Check API key on app start
  React.useEffect(() => {
    const checkApiKey = async () => {
      try {
        const key = await getApiKey();
        setApiKeyFromTauri(key);
      } catch {
        setApiKeyFromTauri(null);
      } finally {
        setCheckingKey(false);
      }
    };
    checkApiKey();
  }, [setApiKeyFromTauri]);

  return (
    <div className="app">
      <AnirudhPet
        state={state}
        status={status}
        model={model}
        message={message}
        settings={{
          ...settings.appearance,
          showTaskStatus: settings.behavior.showTaskStatus,
          showModelName: settings.behavior.showModelName,
        }}
      />
      <div className="controls">
        <button onClick={() => setShowSettings(s => !s)}>⚙️ Settings</button>
        <button onClick={() => setDevMode(d => !d)}>🛠️ Dev</button>
      </div>
      {!checkingKey && !apiKeyFromTauri && (
        <div className="api-key-warning">
          <span>⚠️ FreeLLMAPI key not configured</span>
          <button onClick={() => setShowSettings(true)}>Configure</button>
        </div>
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {devMode && <DeveloperConsole />}
    </div>
  );
};