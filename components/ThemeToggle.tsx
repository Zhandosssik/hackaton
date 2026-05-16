"use client";

import { ThemeMoonIcon, ThemeSunIcon } from "@/components/icons";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({
  className = "",
  showLabels = true,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-white/10 dark:bg-zinc-800/80 ${className}`}
      role="group"
      aria-label="Тема оформления"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
          theme === "light"
            ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        aria-pressed={theme === "light"}
      >
        {showLabels ? (
          <>
            <ThemeSunIcon className="h-4 w-4" />
            <span>Светлая</span>
          </>
        ) : (
          <ThemeSunIcon className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
          theme === "dark"
            ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        aria-pressed={theme === "dark"}
      >
        {showLabels ? (
          <>
            <ThemeMoonIcon className="h-4 w-4" />
            <span>Тёмная</span>
          </>
        ) : (
          <ThemeMoonIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
