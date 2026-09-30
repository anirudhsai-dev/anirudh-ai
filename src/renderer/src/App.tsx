import React from 'react';
import { AnirudhPet } from './components/AnirudhPet';
import { SettingsPanel } from './components/SettingsPanel';
import { DeveloperConsole } from './components/DeveloperConsole';
import { useAgentEvents } from './hooks/useAgentEvents';
import { useSettingsStore } from './store/settingsStore';

export const App: React.FC = () => {
  const { state, status, model, message } = useAgentEvents();
  const settings = useSettingsStore(s => s.settings);
  const [showSettings, setShowSettings] = React.useState(false);
  const [devMode, setDevMode] = React.useState(false);

  return (
    <div className="app">
      <AnirudhPet
        state={state}
        status={status}
        model={model}
        message={message}
        settings={settings.appearance}
      />
      <div className="controls">
        <button onClick={() => setShowSettings(s => !s)}>⚙️ Settings</button>
        <button onClick={() => setDevMode(d => !d)}>🛠️ Dev</button>
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {devMode && <DeveloperConsole />}
    </div>
  );
};