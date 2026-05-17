"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import { EducationSectionView } from "@/components/learning/EducationContent";
import { EducationQuiz } from "@/components/learning/EducationQuiz";
import {
  EducationIcon,
  IconCheck,
  IconLock,
} from "@/components/learning/EducationIcons";
import { EducationVideo } from "@/components/learning/EducationVideo";
import { EDUCATION_LESSONS, findEducationLesson } from "@/data/education";
import { useAuth } from "@/hooks/useAuth";
import {
  getEducationLessonLockReason,
  isEducationLessonUnlocked,
} from "@/lib/education-access";
import {
  getCompletedEducationLessons,
  markEducationLessonComplete,
} from "@/lib/education-storage";
import { syncUserProgressToServer } from "@/lib/progress-sync";

const INITIAL_LESSON_ID = "edu-1";

export default function LearningPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeLessonId, setActiveLessonId] = useState(INITIAL_LESSON_ID);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const [lockHint, setLockHint] = useState<string | null>(null);

  useEffect(() => {
    setCompletedLessons(getCompletedEducationLessons(user?.id));
  }, [user?.id]);

  const lesson = useMemo(
    () => findEducationLesson(activeLessonId),
    [activeLessonId],
  );

  const handleLessonPassed = useCallback(() => {
    markEducationLessonComplete(activeLessonId);
    setCompletedLessons(getCompletedEducationLessons(user?.id));
    if (user) void syncUserProgressToServer(user.id);
  }, [activeLessonId, user]);

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      const reason = getEducationLessonLockReason(
        lessonId,
        isAuthenticated,
        completedLessons,
      );
      if (reason) {
        setLockHint(reason);
        if (!isAuthenticated) {
          setGateOpen(true);
        }
        return;
      }
      setLockHint(null);
      setActiveLessonId(lessonId);
    },
    [completedLessons, isAuthenticated],
  );

  const activeIndex = EDUCATION_LESSONS.findIndex((l) => l.id === activeLessonId);
  const nextLesson =
    activeIndex >= 0 && activeIndex < EDUCATION_LESSONS.length - 1
      ? EDUCATION_LESSONS[activeIndex + 1]
      : null;

  const tryGoToNextLesson = useCallback(() => {
    if (!nextLesson) return;
    const reason = getEducationLessonLockReason(
      nextLesson.id,
      isAuthenticated,
      completedLessons,
    );
    if (reason) {
      setLockHint(reason);
      if (!isAuthenticated) setGateOpen(true);
      return;
    }
    setActiveLessonId(nextLesson.id);
    setLockHint(null);
  }, [completedLessons, isAuthenticated, nextLesson]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[calc(100vh-3.5rem)] bg-zinc-100 dark:bg-zinc-950"
    >
      <aside className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:w-[30%]">
        <div className="border-b border-zinc-100 px-5 py-5 dark:border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Обучение
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Теория, видео и тесты по 10 вопросов
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Пройдено: {completedLessons.length}/{EDUCATION_LESSONS.length}
          </p>
          {!authLoading && !isAuthenticated && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              Гость: урок 1. Для остальных —{" "}
              <Link href="/register" className="font-semibold underline">
                регистрация
              </Link>
            </p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {EDUCATION_LESSONS.map((item) => {
              const isActive = activeLessonId === item.id;
              const isCompleted = completedLessons.includes(item.id);
              const unlocked = isEducationLessonUnlocked(
                item.id,
                isAuthenticated,
                completedLessons,
              );
              const lockReason = getEducationLessonLockReason(
                item.id,
                isAuthenticated,
                completedLessons,
              );

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectLesson(item.id)}
                    title={lockReason ?? undefined}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm transition ${
                      isActive
                        ? "bg-brand-purple font-medium text-white shadow-md shadow-brand-purple/25"
                        : !unlocked
                          ? "cursor-not-allowed text-zinc-400 opacity-80"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20"
                      }`}
                    >
                      <EducationIcon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {item.number}. {item.title}
                      </span>
                      {!unlocked && lockReason && (
                        <span className="mt-0.5 block truncate text-xs opacity-80">
                          {lockReason}
                        </span>
                      )}
                    </span>
                    {!unlocked && (
                      <IconLock
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-white/80" : "text-zinc-400"}`}
                      />
                    )}
                    {isCompleted && unlocked && (
                      <IconCheck
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-brand-green"}`}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {lockHint && (
          <div
            role="alert"
            className="mx-6 mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 lg:mx-12"
          >
            {lockHint}
          </div>
        )}

        {lesson ? (
          <motion.article
            key={lesson.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="px-6 py-8 lg:px-12"
          >
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="relative h-40 sm:h-48">
                <Image
                  src={lesson.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-purple-light">
                    Урок {lesson.number} · {lesson.sections.length} раздела
                  </p>
                  <h2 className="mt-1 flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                      <EducationIcon
                        name={lesson.icon}
                        className="h-5 w-5 text-white"
                      />
                    </span>
                    {lesson.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-300">
                    {lesson.description}
                  </p>
                </div>
              </div>
            </div>

            <EducationVideo video={lesson.video} />

            <div className="mt-8 space-y-6">
              {lesson.sections.map((section, index) => (
                <EducationSectionView
                  key={`${lesson.id}-section-${index}`}
                  section={section}
                  index={index}
                />
              ))}
            </div>

            <EducationQuiz
              key={`${lesson.id}-quiz`}
              questions={lesson.quiz}
              onPassed={handleLessonPassed}
            />

            {completedLessons.includes(lesson.id) && nextLesson && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={tryGoToNextLesson}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-purple px-6 text-sm font-semibold text-white shadow-lg shadow-brand-purple/25 transition hover:bg-brand-purple-dark"
                >
                  Следующий урок: {nextLesson.title}
                </button>
              </div>
            )}
          </motion.article>
        ) : (
          <p className="p-8 text-zinc-500">Урок не найден</p>
        )}
      </main>

      <AuthGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </motion.div>
  );
}
