import { create } from "zustand";
import { persist } from "zustand/middleware";

export type IDETheme =
  | "dark"
  | "light"
  | "high-contrast"
  | "monokai"
  | "solarized-dark"
  | "dracula"
  | "nord"
  | "one-dark";

interface ThemeStore {
  theme: IDETheme;
  setTheme: (t: IDETheme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "codeforge-theme" },
  ),
);
