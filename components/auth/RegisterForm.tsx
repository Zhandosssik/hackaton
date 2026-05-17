"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { redirectAfterAuth } from "@/lib/client-storage-reset";
import { PASSWORD_REQUIREMENTS_HINT, validatePassword } from "@/lib/password";
import { validateRegisterBody } from "@/lib/register-validation";
import type { AuthResponse, RegisterRequestBody } from "@/types/auth";

const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100";

export function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordCheck = useMemo(() => validatePassword(password), [password]);
  const passwordsMatchState =
    passwordConfirm.length > 0 && password === passwordConfirm;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const body: RegisterRequestBody = {
      firstName,
      lastName,
      age,
      email,
      password,
      passwordConfirm,
    };

    const validation = validateRegisterBody(body);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-zinc-900 sm:p-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-purple transition hover:text-brand-purple-dark"
        >
          ← На главную
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Регистрация
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Создайте аккаунт, чтобы сохранять прогресс и попасть в рейтинг
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <motion.div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Имя <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
                minLength={2}
                maxLength={60}
                className={inputClassName}
                placeholder="Жандос"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Фамилия <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
                minLength={2}
                maxLength={60}
                className={inputClassName}
                placeholder="Тұрлыбек"
              />
            </label>
          </motion.div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Возраст <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              autoComplete="bday"
              required
              min={6}
              max={120}
              className={inputClassName}
              placeholder="18"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email <span className="text-red-500">*</span>
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
              Пароль <span className="text-red-500">*</span>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={inputClassName}
              placeholder="••••••••"
            />
            <p className="mt-1.5 text-xs text-zinc-500">{PASSWORD_REQUIREMENTS_HINT}</p>
            {password.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs">
                <RequirementItem
                  ok={password.length >= 8}
                  label="Не менее 8 символов"
                />
                <RequirementItem
                  ok={/[A-ZА-ЯЁ]/.test(password)}
                  label="Заглавная буква"
                />
                <RequirementItem
                  ok={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)}
                  label="Спецсимвол"
                />
              </ul>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Подтверждение пароля <span className="text-red-500">*</span>
            </span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className={`${inputClassName} ${
                passwordConfirm.length > 0 && !passwordsMatchState
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                  : ""
              }`}
              placeholder="••••••••"
            />
            {passwordConfirm.length > 0 && !passwordsMatchState && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                Пароли не совпадают
              </p>
            )}
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passwordCheck.valid}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-purple text-base font-semibold text-white shadow-lg shadow-brand-purple/25 transition hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Создаём аккаунт…" : "Создать аккаунт"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-purple hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function RequirementItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={
        ok ? "text-brand-green dark:text-brand-green" : "text-zinc-500"
      }
    >
      {ok ? "✓" : "○"} {label}
    </li>
  );
}
