"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconFlame } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { hydrateAndSyncUserProgress } from "@/lib/progress-sync";
import type { LeaderboardEntry, LeaderboardResponse } from "@/types/leaderboard";

type LeaderboardPayload = LeaderboardResponse & {
  currentUserEntry: LeaderboardEntry | null;
};

export function LeaderboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState<LeaderboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leaderboard?limit=50");
      if (!response.ok) {
        setError("Не удалось загрузить рейтинг");
        return;
      }
      const json = (await response.json()) as LeaderboardPayload;
      setData(json);
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      if (authLoading) return;
      if (isAuthenticated && user) {
        setSyncing(true);
        await hydrateAndSyncUserProgress(user.id);
        setSyncing(false);
      }
      await loadLeaderboard();
    })();
  }, [authLoading, isAuthenticated, user, loadLeaderboard]);

  const currentEntry =
    data?.entries.find((e) => e.isCurrentUser) ?? data?.currentUserEntry ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <main className="mx-auto max-w-3xl px-6 py-10">
        <motion.div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-purple">
            Таблица лидеров
          </p>
          <h1 className="mt-2 text-3xl font-bold">Таблица лидеров</h1>
          {syncing && (
            <p className="mt-2 text-xs text-zinc-400">Обновляем ваш результат…</p>
          )}
        </motion.div>

        {isAuthenticated && currentEntry && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-brand-purple/30 bg-brand-purple/5 p-5 dark:bg-brand-purple/10"
          >
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Ваше место в топе
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <motion.div className="text-center sm:text-left">
                <span className="text-3xl font-bold text-brand-purple">
                  #{currentEntry.rank}
                </span>
                <p className="text-xs text-zinc-500">
                  из {data?.totalPlayers ?? "—"} игроков
                </p>
              </motion.div>
              <div className="min-w-[200px] flex-1">
                <p className="font-semibold">{currentEntry.displayName}</p>
                <p className="text-sm text-zinc-500">
                  {currentEntry.rating} баллов · Ур. {currentEntry.level} ·{" "}
                  {currentEntry.totalXp} XP
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {!authLoading && !isAuthenticated && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Войдите, чтобы попасть в рейтинг и видеть своё место
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold dark:border-white/10"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-brand-purple px-4 py-2 text-sm font-semibold text-white"
              >
                Регистрация
              </Link>
            </div>
          </div>
        )}

        {isAuthenticated && !loading && !currentEntry && data && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-200">
            Пройдите урок или тренировку — ваш результат появится в таблице после
            синхронизации.
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
          {loading ? (
            <motion.div className="p-12 text-center text-zinc-500">Загрузка…</motion.div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-500">{error}</p>
              <button
                type="button"
                onClick={() => void loadLeaderboard()}
                className="mt-4 text-sm font-semibold text-brand-purple"
              >
                Повторить
              </button>
            </div>
          ) : !data || data.entries.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              Пока никого в рейтинге. Будьте первым — пройдите урок после входа.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b border-zinc-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-white/5">
                <span>Место</span>
                <span>Игрок</span>
                <span className="text-right">Баллы</span>
              </div>
              <ol className="divide-y divide-zinc-100 dark:divide-white/5">
                {data.entries.map((entry, index) => (
                  <LeaderboardRow key={entry.userId} entry={entry} index={index} />
                ))}
              </ol>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Баллы = теория + практика + XP (макс. 1000). Чем выше баллы — тем выше место
          среди игроков на платформе.
        </p>
      </main>
    </motion.div>
  );
}

function LeaderboardRow({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const initial = entry.displayName.trim().charAt(0).toUpperCase() || "?";
  const medal =
    entry.rank === 1
      ? "🥇"
      : entry.rank === 2
        ? "🥈"
        : entry.rank === 3
          ? "🥉"
          : null;

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center gap-4 px-4 py-4 ${
        entry.isCurrentUser
          ? "bg-brand-purple/5 dark:bg-brand-purple/10"
          : ""
      }`}
    >
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
            entry.rank <= 3
              ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
          title={`${entry.rank} место`}
        >
          {medal ?? entry.rank}
        </span>
        <span className="mt-0.5 text-[10px] text-zinc-400">место</span>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-sm font-bold text-brand-purple">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-2 text-xs font-medium text-brand-purple">вы</span>
          )}
        </p>
        <p className="text-xs text-zinc-500">
          Ур. {entry.level} · {entry.practiceCompleted} практик ·{" "}
          {entry.educationCompleted} теория
          {entry.streak > 0 && (
            <span className="ml-1 inline-flex items-center gap-0.5">
              · {entry.streak}
              <IconFlame className="h-3 w-3" />
            </span>
          )}
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-brand-purple">{entry.rating}</p>
        <p className="text-xs text-zinc-500">баллов</p>
        <p className="text-xs text-zinc-400">{entry.totalXp} XP</p>
      </div>
    </motion.li>
  );
}
