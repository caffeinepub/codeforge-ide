import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IDESettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  fontLigatures: boolean;
}

interface SettingsStore {
  settings: IDESettings;
  updateSettings: (partial: Partial<IDESettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: IDESettings = {
  fontSize: 14,
  fontFamily:
    "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  lineNumbers: true,
  fontLigatures: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: "codeforge-settings" },
  ),
);
