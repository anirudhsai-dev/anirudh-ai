import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings, DEFAULT_SETTINGS } from '@shared/types';

type SettingsState = {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  loadDefaults: () => void;
  saveApiKey: (key: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      loadDefaults: () => set({ settings: DEFAULT_SETTINGS }),
      saveApiKey: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            freellmapi: { ...s.settings.freellmapi, apiKey: key },
          },
        })),
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