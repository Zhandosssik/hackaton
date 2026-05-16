import type { ThemeMode } from "@/types/theme";
import { THEME_STORAGE_KEY } from "@/types/theme";

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
    return null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyThemeToDocument(theme: ThemeMode): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
