import type { IDETheme } from "../../stores/themeStore";

export interface ThemeConfig {
  name: string;
  monacoTheme: string;
  cssClass: string;
}

export const THEME_CONFIGS: Record<IDETheme, ThemeConfig> = {
  dark: {
    name: "Dark+",
    monacoTheme: "vs-dark",
    cssClass: "theme-dark",
  },
  light: {
    name: "Light+",
    monacoTheme: "vs",
    cssClass: "theme-light",
  },
  "high-contrast": {
    name: "High Contrast Dark",
    monacoTheme: "hc-black",
    cssClass: "theme-high-contrast",
  },
};

export function getMonacoTheme(theme: IDETheme): string {
  return THEME_CONFIGS[theme].monacoTheme;
}
