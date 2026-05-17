"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import { IconCheck, IconLock } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import {
  buildDailyContext,
  getClientLocalDateKey,
  getDailyProgress,
  isDailyTaskCompleted,
  recordDailyCompletion,
} from "@/lib/daily-storage";
import { syncUserProgressToServer } from "@/lib/progress-sync";
import { getProfileExtras } from "@/lib/profile-storage";
import type { AnalyzeResult } from "@/types/analyze";
import type { DailyTask, DailyTasksPayload } from "@/types/daily";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

const DIFFICULTY_LABELS = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно",
} as const;

export default function DailyPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dateKey, setDateKey] = useState("");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [showCorrectPrompt, setShowCorrectPrompt] = useState(false);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );

  const refreshCompletion = useCallback(
    (userId: string, date: string) => {
      setCompletedIds(getDailyProgress(userId, date).completedTaskIds);
    },
    [],
  );

  const fetchDailyTasks = useCallback(async () => {
    if (!user) return;

    const date = getClientLocalDateKey();
    setDateKey(date);
    setLoadingTasks(true);
    setLoadError(null);

    const extras = getProfileExtras(user.id);
    const context = buildDailyContext(date, extras.learningGoal);

    try {
      const response = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(context),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: string }).error)
            : "Не удалось загрузить задания";
        setLoadError(message);
        return;
      }

      const payload = data as DailyTasksPayload;
      setTasks(payload.tasks);
      setCached(payload.cached);
      setActiveTaskId(payload.tasks[0]?.id ?? null);
      refreshCompletion(user.id, date);
    } catch {
      setLoadError("Ошибка сети. Проверьте подключение и попробуйте снова.");
    } finally {
      setLoadingTasks(false);
    }
  }, [user, refreshCompletion]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setGateOpen(true);
      return;
    }
    void fetchDailyTasks();
  }, [authLoading, isAuthenticated, fetchDailyTasks]);

  const resetAnalysis = useCallback(() => {
    setAnalyzeResult(null);
    setAnalyzeError(null);
    setShowCorrectPrompt(false);
  }, []);

  const handleSelectTask = useCallback(
    (task: DailyTask) => {
      setActiveTaskId(task.id);
      setPrompt("");
      resetAnalysis();
    },
    [resetAnalysis],
  );

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || !activeTask || !user) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalyzeResult(null);
    setShowCorrectPrompt(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: trimmed,
          taskDescription: `${activeTask.title}. ${activeTask.description}`,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: string }).error)
            : "Не удалось проверить промпт";
        setAnalyzeError(message);
        return;
      }

      const result = data as AnalyzeResult;
      setAnalyzeResult(result);
      recordDailyCompletion(
        user.id,
        dateKey,
        activeTask.id,
        result.score,
        result.isCorrect,
      );
      void syncUserProgressToServer(user.id);
      refreshCompletion(user.id, dateKey);
    } catch {
      setAnalyzeError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeTask, dateKey, prompt, refreshCompletion, user]);

  const completedCount = completedIds.length;
  const xpEarned = analyzeResult ? Math.round(analyzeResult.score) : 0;

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Загрузка…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-zinc-100 px-6 dark:bg-zinc-950">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-purple/10 dark:bg-brand-purple/20">
              <IconLock className="h-7 w-7 text-brand-purple dark:text-brand-purple-light" />
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Ежедневные задания
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              AI готовит 5 персональных заданий каждый день — только для
              зарегистрированных пользователей.
            </p>
            <button
              type="button"
              onClick={() => setGateOpen(true)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-purple px-6 text-sm font-semibold text-white shadow-md shadow-brand-purple/25 transition hover:bg-brand-purple-dark"
            >
              Войти или зарегистрироваться
            </button>
          </motion.div>
        </div>
        <AuthGateModal
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          title="Войдите для ежедневных заданий"
          description="Mistral AI составляет 5 уникальных заданий каждый день под ваш уровень и цели. Нужен аккаунт Prompto."
        />
      </>
    );
  }

  if (loadingTasks) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 bg-zinc-100 px-6 dark:bg-zinc-950"
      >
        <Spinner large />
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Готовим ваши задания…
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Mistral AI подбирает 5 заданий под ваш прогресс. Это может занять до
            минуты.
          </p>
        </div>
      </motion.div>
    );
  }

  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-zinc-100 px-6 dark:bg-zinc-950"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900/50 dark:bg-zinc-900"
        >
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
          <button
            type="button"
            onClick={() => void fetchDailyTasks()}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-purple px-6 text-sm font-semibold text-white transition hover:bg-brand-purple-dark"
          >
            Попробовать снова
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[calc(100vh-3.5rem)] bg-zinc-100 dark:bg-zinc-950"
    >
      <aside className="flex w-[30%] min-w-[240px] flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <CalendarIcon />
            </span>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Ежедневные
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDateLabel(dateKey)}
              </p>
            </motion.div>
          </div>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {completedCount}/5 выполнено
            {cached ? " · загружено с сервера" : " · сгенерировано сегодня"}
          </p>
          <motion.div
            className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full rounded-full bg-brand-purple"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {tasks.map((task) => {
              const isActive = activeTaskId === task.id;
              const isCompleted =
                user &&
                (completedIds.includes(task.id) ||
                  isDailyTaskCompleted(user.id, dateKey, task.id));

              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectTask(task)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      isActive
                        ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20 dark:text-brand-purple-light"
                        : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isCompleted
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {isCompleted ? (
                        <IconCheck className="h-4 w-4" />
                      ) : (
                        task.number
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug">
                        {task.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-500">
                        {task.category} · {DIFFICULTY_LABELS[task.difficulty]}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {completedCount === 5 && (
          <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
            <p className="rounded-xl bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
              Все задания дня выполнены! Завтра — новый набор.
            </p>
          </div>
        )}
      </aside>

      <main className="flex w-[70%] flex-1 flex-col overflow-y-auto bg-zinc-50 px-8 py-8 dark:bg-zinc-950 lg:px-12">
        {activeTask ? (
          <>
            <header className="mb-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Задание {activeTask.number} · {activeTask.category}
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {activeTask.title}
              </h2>
              <span className="mt-2 inline-block rounded-lg bg-zinc-200/80 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {DIFFICULTY_LABELS[activeTask.difficulty]}
              </span>
            </header>

            <section className="mb-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Что нужно сделать
              </h3>
              <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-lg">
                {activeTask.description}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <label
                htmlFor="daily-prompt"
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
              >
                Ваш промпт
              </label>
              <textarea
                id="daily-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isAnalyzing}
                placeholder="Напишите промпт для этого задания..."
                rows={12}
                className="min-h-[280px] resize-none rounded-2xl border border-zinc-200 bg-white p-5 text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400 shadow-sm transition focus:border-brand-purple/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </section>

            <AnimatePresence mode="wait">
              {analyzeError && (
                <motion.p
                  key="error"
                  {...fadeIn}
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                  {analyzeError}
                </motion.p>
              )}

              {analyzeResult && (
                <motion.div key="result" {...fadeIn} className="mt-6 space-y-4">
                  {analyzeResult.isCorrect ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/35">
                      <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                        Отлично! +{xpEarned} XP
                      </p>
                      <p className="mt-2 text-base leading-relaxed text-green-700 dark:text-green-400/90">
                        {analyzeResult.feedback}
                      </p>
                    </div>
                  ) : (
                    <>
                      <motion.div
                        {...fadeIn}
                        className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/35"
                      >
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-red-600">
                          Нужно доработать
                        </p>
                        <p className="text-base leading-relaxed text-red-800 dark:text-red-300">
                          {analyzeResult.feedback}
                        </p>
                        <p className="mt-2 text-sm text-red-600">
                          Оценка: {analyzeResult.score}/100
                        </p>
                      </motion.div>
                      <motion.div
                        {...fadeIn}
                        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/35"
                      >
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-700">
                          Подсказка
                        </p>
                        <p className="text-base leading-relaxed text-amber-900 dark:text-amber-200/90">
                          {analyzeResult.hint}
                        </p>
                      </motion.div>
                      <button
                        type="button"
                        onClick={() => setShowCorrectPrompt((p) => !p)}
                        className="text-sm font-semibold text-brand-purple hover:underline dark:text-brand-purple-light"
                      >
                        {showCorrectPrompt
                          ? "Скрыть правильный промпт"
                          : "Показать правильный промпт"}
                      </button>
                      <AnimatePresence>
                        {showCorrectPrompt && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            <p className="whitespace-pre-wrap text-base text-zinc-800 dark:text-zinc-200">
                              {analyzeResult.correctPrompt}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isAnalyzing}
              className="mt-6 flex h-14 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-brand-purple text-lg font-semibold text-white shadow-lg shadow-brand-purple/30 transition hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Spinner />
                  Проверяем...
                </>
              ) : (
                "Отправить"
              )}
            </button>
          </>
        ) : (
          <p className="text-zinc-500">Выберите задание слева</p>
        )}
      </main>
    </motion.div>
  );
}

function formatDateLabel(dateKey: string): string {
  if (!dateKey) return "Сегодня";
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function CalendarIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function Spinner({ large }: { large?: boolean }) {
  return (
    <svg
      className={`animate-spin text-brand-purple ${large ? "h-10 w-10" : "h-5 w-5"}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
