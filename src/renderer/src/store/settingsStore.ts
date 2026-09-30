import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings, DEFAULT_SETTINGS } from '@shared/types';

type SettingsState = {
  settings: AppSettings;
  apiKeyLoaded: boolean;
  apiKeyFromTauri?: string | null;
  updateSettings: (patch: Partial<AppSettings>) => void;
  loadDefaults: () => void;
  setApiKeyFromTauri: (key: string | null) => void;
  clearApiKeyFromTauri: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      apiKeyLoaded: false,
      apiKeyFromTauri: null,
      
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      
      loadDefaults: () => set({ settings: DEFAULT_SETTINGS }),
      
      setApiKeyFromTauri: (key) =>
        set({ apiKeyFromTauri: key, apiKeyLoaded: true }),
      
      clearApiKeyFromTauri: () =>
        set({ apiKeyFromTauri: null, apiKeyLoaded: true }),
    }),
    {
      name: 'anirudh-settings',
      partialize: (state) => ({
        settings: {
          ...state.settings,
          freellmapi: { baseUrl: state.settings.freellmapi.baseUrl }, // never persist key
        },
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);