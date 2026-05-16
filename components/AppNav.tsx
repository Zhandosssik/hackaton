"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { IconLogo, NavIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import type { NavIconId } from "@/types/icons";

const MAIN_LINKS: {
  href: string;
  label: string;
  short: string;
  icon: NavIconId;
}[] = [
  { href: "/", label: "Главная", short: "Главная", icon: "home" },
  { href: "/learning", label: "Обучение", short: "Теория", icon: "book" },
  { href: "/lesson", label: "Тренировка", short: "Практика", icon: "target" },
  { href: "/daily", label: "Ежедневные", short: "День", icon: "calendar" },
  { href: "/profile", label: "Профиль", short: "Профиль", icon: "user" },
];

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, refresh } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await refresh();
      router.refresh();
      if (pathname === "/profile") {
        router.push("/");
      }
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-lg dark:border-white/10 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg py-1 pr-1 transition hover:opacity-90"
          aria-label="Prompto — на главную"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple text-white shadow-md shadow-brand-purple/25">
            <IconLogo className="h-4 w-4" />
          </span>
          <span className="hidden font-bold tracking-tight text-zinc-900 dark:text-white sm:inline">
            Prompto
          </span>
        </Link>

        <nav
          className="mx-auto flex min-w-0 flex-1 items-center justify-center px-1"
          aria-label="Основная навигация"
        >
          <div className="flex w-full max-w-[340px] overflow-x-auto items-center gap-0.5 rounded-xl border border-zinc-200/80 bg-zinc-100/90 p-0.5 dark:border-white/10 dark:bg-zinc-900/90 sm:w-auto sm:max-w-none sm:gap-1 sm:p-1">
            {MAIN_LINKS.map((item) => {
              const active = isLinkActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-xs font-semibold transition sm:flex-none sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm ${
                    active
                      ? "bg-white text-brand-purple shadow-sm dark:bg-zinc-800 dark:text-brand-purple-light"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  <span className="hidden truncate md:inline">{item.short}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle showLabels={false} />

          {loading ? (
            <span className="h-8 w-14 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : isAuthenticated && user ? (
            <>
              <Link
                href="/profile"
                className="hidden max-w-[100px] truncate rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-brand-purple dark:text-zinc-300 dark:hover:bg-white/5 lg:inline"
              >
                {user.displayName}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
                title="Выйти"
              >
                {loggingOut ? "..." : "Выйти"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5 sm:inline"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-purple px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-purple/25 transition hover:bg-brand-purple-dark"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
