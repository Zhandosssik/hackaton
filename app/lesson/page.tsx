"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconCheck, IconLock, PracticeSectionIcon } from "@/components/icons";
import { LESSON_SECTIONS, findLesson } from "@/data/lessons";
import { getCompletedEducationLessons } from "@/lib/education-storage";
import { getGameProgress, recordPracticeResult } from "@/lib/game-progress";
import { syncUserProgressToServer } from "@/lib/progress-sync";
import { useAuth } from "@/hooks/useAuth";
import {
  getDefaultUnlockedTrainingLessonId,
  getTrainingLessonLockReason,
  getTrainingUnlockLockReason,
  isTrainingLessonUnlocked,
  isTrainingUnlocked,
  TRAINING_REQUIRED_EDUCATION_IDS,
  TRAINING_PASS_SCORE,
} from "@/lib/training-access";
import type { AnalyzeResult } from "@/types/analyze";
import type { SectionId } from "@/types/lesson";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export default function LessonPage() {
  const { user } = useAuth();
  const [completedEducation, setCompletedEducation] = useState<string[]>([]);
  const [completedPractice, setCompletedPractice] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("text");
  const [activeLesson, setActiveLesson] = useState("text-1");
  const [expandedSection, setExpandedSection] = useState<SectionId | null>("text");
  const [lockHint, setLockHint] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [showCorrectPrompt, setShowCorrectPrompt] = useState(false);

  useEffect(() => {
    const ownerKey = user?.id;
    const edu = getCompletedEducationLessons(ownerKey);
    const practice = getGameProgress(ownerKey).completedPractice;
    setCompletedEducation(edu);
    setCompletedPractice(practice);

    if (isTrainingUnlocked(edu)) {
      const defaultId = getDefaultUnlockedTrainingLessonId(edu, practice);
      const found = findLesson(defaultId);
      if (found) {
        setActiveLesson(defaultId);
        setActiveSection(found.section.id);
        setExpandedSection(found.section.id);
      }
    }
    setHydrated(true);
  }, [user?.id]);

  const trainingUnlocked = isTrainingUnlocked(completedEducation);

  const current = useMemo(() => findLesson(activeLesson), [activeLesson]);

  const resetAnalysis = useCallback(() => {
    setAnalyzeResult(null);
    setAnalyzeError(null);
    setShowCorrectPrompt(false);
  }, []);

  const refreshPracticeProgress = useCallback(() => {
    setCompletedPractice(getGameProgress(user?.id).completedPractice);
  }, [user?.id]);

  const handleSelectLesson = useCallback(
    (sectionId: SectionId, lessonId: string) => {
      const reason = getTrainingLessonLockReason(
        lessonId,
        completedEducation,
        completedPractice,
      );
      if (reason) {
        setLockHint(reason);
        return;
      }
      setLockHint(null);
      setActiveSection(sectionId);
      setActiveLesson(lessonId);
      setExpandedSection(sectionId);
      setPrompt("");
      resetAnalysis();
    },
    [completedEducation, completedPractice, resetAnalysis],
  );

  const handleToggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
    setActiveSection(sectionId);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || !current?.lesson) return;

    setIsLoading(true);
    setAnalyzeError(null);
    setAnalyzeResult(null);
    setShowCorrectPrompt(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: trimmed,
          taskDescription: current.lesson.description,
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
      recordPracticeResult(activeLesson, result.score, result.isCorrect);
      if (user) void syncUserProgressToServer(user.id);
      refreshPracticeProgress();
    } catch {
      setAnalyzeError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  }, [activeLesson, current, prompt, refreshPracticeProgress]);

  const sectionLabel = current?.section.title ?? "";
  const lesson = current?.lesson;
  const xpEarned = analyzeResult ? Math.round(analyzeResult.score) : 0;
  const trainingLockReason = getTrainingUnlockLockReason(completedEducation);

  if (!hydrated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-100 dark:bg-zinc-950"
      >
        <p className="text-sm text-zinc-500">Загрузка…</p>
      </motion.div>
    );
  }

  if (!trainingUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-zinc-100 px-6 dark:bg-zinc-950"
      >
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <IconLock className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Тренировка
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {trainingLockReason}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Пройдено уроков обучения:{" "}
            {
              completedEducation.filter((id) =>
                TRAINING_REQUIRED_EDUCATION_IDS.includes(id),
              ).length
            }
            /3
          </p>
          <Link
            href="/learning"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-purple px-6 text-sm font-semibold text-white shadow-md shadow-brand-purple/25 transition hover:bg-brand-purple-dark"
          >
            Перейти к обучению
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-zinc-100 dark:bg-zinc-950">
      <aside className="flex w-[30%] min-w-[240px] flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-b border-zinc-100 px-5 py-5 dark:border-zinc-800"
        >
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Тренировка
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Выберите задание
          </p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            В каждой категории открыто первое задание. Остальные — после{" "}
            {TRAINING_PASS_SCORE}+ баллов в предыдущем.
          </p>
        </motion.div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {LESSON_SECTIONS.map((section) => {
            const isExpanded = expandedSection === section.id;
            const isSectionActive = activeSection === section.id;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2"
              >
                <button
                  type="button"
                  onClick={() => handleToggleSection(section.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                    isSectionActive
                      ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20 dark:text-brand-purple-light"
                      : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <PracticeSectionIcon sectionId={section.id} />
                    {section.title}
                  </span>
                  <ChevronIcon open={isExpanded} />
                </button>

                {isExpanded && (
                  <ul className="mt-1 space-y-0.5 pb-2 pl-1">
                    {section.lessons.map((item) => {
                      const isActive = activeLesson === item.id;
                      const isCompleted = completedPractice.includes(item.id);
                      const unlocked = isTrainingLessonUnlocked(
                        item.id,
                        completedEducation,
                        completedPractice,
                      );
                      const itemLockReason = getTrainingLessonLockReason(
                        item.id,
                        completedEducation,
                        completedPractice,
                      );

                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectLesson(section.id, item.id)
                            }
                            title={itemLockReason ?? undefined}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              isActive
                                ? "bg-brand-purple font-medium text-white shadow-md shadow-brand-purple/25"
                                : !unlocked
                                  ? "cursor-not-allowed text-zinc-400 opacity-80 dark:text-zinc-500"
                                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                              }`}
                            >
                              {item.number}
                            </span>
                            <span className="flex-1 truncate">{item.title}</span>
                            {!unlocked && (
                              <IconLock
                                className={`h-4 w-4 shrink-0 ${
                                  isActive ? "text-white/80" : "text-zinc-400"
                                }`}
                                aria-hidden
                              />
                            )}
                            {isCompleted && unlocked && (
                              <IconCheck
                                className={`h-4 w-4 shrink-0 ${
                                  isActive ? "text-white" : "text-brand-green"
                                }`}
                                aria-label="Пройдено"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </nav>
      </aside>

      <main className="flex w-[70%] flex-1 flex-col overflow-y-auto bg-zinc-50 px-8 py-8 dark:bg-zinc-950 lg:px-12">
        {lockHint && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
          >
            {lockHint}
          </motion.p>
        )}

        {lesson ? (
          <>
            <header className="mb-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-brand-purple dark:text-brand-purple-light">
                {sectionLabel}
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Задание {lesson.number}: {lesson.title}
              </h2>
            </header>

            <section className="mb-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Что нужно сделать
              </h3>
              <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-lg">
                {lesson.description}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <label
                htmlFor="prompt"
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
              >
                Ваш промпт
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                placeholder="Напишите промпт здесь..."
                rows={12}
                className="min-h-[280px] resize-none rounded-2xl border border-zinc-200 bg-white p-5 text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400 shadow-sm transition focus:border-brand-purple/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:shadow-none dark:focus:border-brand-purple/40 dark:focus:ring-brand-purple/20"
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
                <motion.div
                  key="result"
                  {...fadeIn}
                  className="mt-6 space-y-4"
                >
                  {analyzeResult.isCorrect ? (
                    <motion.div
                      {...fadeIn}
                      className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/35"
                    >
                      <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                        Отлично! +{xpEarned} XP
                      </p>
                      <p className="mt-2 text-base leading-relaxed text-green-700 dark:text-green-400/90">
                        {analyzeResult.feedback}
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        {...fadeIn}
                        className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/35"
                      >
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                          Нужно доработать
                        </p>
                        <p className="text-base leading-relaxed text-red-800 dark:text-red-300">
                          {analyzeResult.feedback}
                        </p>
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          Оценка: {analyzeResult.score}/100
                        </p>
                      </motion.div>

                      <motion.div
                        {...fadeIn}
                        transition={{ ...fadeIn.transition, delay: 0.08 }}
                        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/35"
                      >
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          Подсказка
                        </p>
                        <p className="text-base leading-relaxed text-amber-900 dark:text-amber-200/90">
                          {analyzeResult.hint}
                        </p>
                      </motion.div>

                      <motion.div>
                        <button
                          type="button"
                          onClick={() =>
                            setShowCorrectPrompt((prev) => !prev)
                          }
                          className="text-sm font-semibold text-brand-purple transition hover:text-brand-purple-dark hover:underline dark:text-brand-purple-light"
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
                              transition={{ duration: 0.3 }}
                              className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                            >
                              <p className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                Правильный промпт
                              </p>
                              <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                                {analyzeResult.correctPrompt}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="mt-6 flex h-14 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-brand-purple text-lg font-semibold text-white shadow-lg shadow-brand-purple/30 transition hover:bg-brand-purple-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
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
          <p className="text-zinc-500 dark:text-zinc-400">Задание не найдено</p>
        )}
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
