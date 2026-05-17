"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { redirectAfterAuth } from "@/lib/client-storage-reset";
import type { AuthResponse } from "@/types/auth";

const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as AuthResponse & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Что-то пошло не так");
        return;
      }

      redirectAfterAuth(data.user.id, "/profile");
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-zinc-900 sm:p-10"
      >
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-purple transition hover:text-brand-purple-dark"
        >
          ← На главную
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Вход
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Войдите в свой аккаунт Prompto
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={inputClassName}
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={inputClassName}
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-purple text-base font-semibold text-white shadow-lg shadow-brand-purple/25 transition hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Подождите..." : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-purple hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
