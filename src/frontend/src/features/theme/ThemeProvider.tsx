import { useEffect } from "react";
import { useThemeStore } from "../../stores/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-ide-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
