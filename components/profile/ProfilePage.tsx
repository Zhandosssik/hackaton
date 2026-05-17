"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AchievementIcon, IconCheck, IconFlame } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { getCompletedEducationLessons } from "@/lib/education-storage";
import {
  getAchievements,
  getGameProgress,
  getLevelProgress,
  getOverallProgressPercent,
  getPlayerLevel,
  getRating,
  TOTAL_EDUCATION,
  TOTAL_PRACTICE,
} from "@/lib/game-progress";
import { hydrateAndSyncUserProgress } from "@/lib/progress-sync";
import { getProfileExtras, saveProfileExtras } from "@/lib/profile-storage";
import type { Achievement, GameProgress } from "@/types/game";
import type { ProfileExtras } from "@/types/profile";

export function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [educationDone, setEducationDone] = useState<string[]>([]);
  const [extras, setExtras] = useState<ProfileExtras>({
    bio: "",
    city: "",
    learningGoal: "",
  });
  const [saved, setSaved] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      await hydrateAndSyncUserProgress(user.id);
      const game = getGameProgress(user.id);
      const edu = getCompletedEducationLessons(user.id);
      setProgress(game);
      setEducationDone(edu);
      setExtras(getProfileExtras(user.id));
      setAchievements(getAchievements(game, edu));
    })();
  }, [user]);

  function handleSaveExtras() {
    if (!user) return;
    saveProfileExtras(user.id, extras);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !isAuthenticated || !user || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Загрузка профиля...</p>
      </div>
    );
  }

  const level = getPlayerLevel(progress.totalXp);
  const levelBar = getLevelProgress(progress.totalXp);
  const rating = getRating(progress.totalXp, educationDone.length);
  const overallPercent = getOverallProgressPercent(progress, educationDone);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const initial = user.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900"
        >
          <div className="bg-gradient-to-br from-brand-purple/20 via-brand-purple/5 to-transparent px-8 py-10 dark:from-brand-purple/30">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-purple text-3xl font-bold text-white shadow-lg shadow-brand-purple/30">
                {initial}
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{user.displayName}</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {user.firstName} {user.lastName}
                  {user.age !== null ? ` · ${user.age} лет` : ""}
                </p>
                <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Уровень" value={String(level)} hint="каждые 300 XP" />
            <StatCard label="XP" value={String(progress.totalXp)} hint="всего очков" />
            <StatCard
              label="Баллы"
              value={String(rating)}
              hint={
                <Link href="/leaderboard" className="hover:underline">
                  из 1000 · не место в топе →
                </Link>
              }
            />
            <StatCard
              label="Стрик"
              value={
                <span className="inline-flex items-center justify-center gap-1">
                  {progress.streak}
                  <IconFlame className="h-5 w-5" />
                </span>
              }
              hint="дней подряд"
            />
          </div>

          <div className="border-t border-zinc-100 px-8 py-6 dark:border-white/5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                Прогресс до уровня {level + 1}
              </span>
              <span className="text-zinc-500">
                {levelBar.current}/{levelBar.max} XP
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <motion.div
                className="h-full rounded-full bg-brand-purple"
                initial={{ width: 0 }}
                animate={{ width: `${levelBar.percent}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="mt-4 text-center text-sm text-zinc-500">
              Общий прогресс курса: {overallPercent}%
            </p>
          </div>
        </motion.section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-bold">Прогресс</h2>
            <ProgressRow
              label="Теория"
              done={educationDone.length}
              total={TOTAL_EDUCATION}
            />
            <ProgressRow
              label="Тренировка"
              done={progress.completedPractice.length}
              total={TOTAL_PRACTICE}
            />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-bold">Тема сайта</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Переключите светлую или тёмную тему для всего Prompto.
            </p>
            <div className="mt-4">
              <ThemeToggle />
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
        >
          <h2 className="mb-6 text-lg font-bold">
            Достижения ({unlockedCount}/{achievements.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((item) => (
              <AchievementCard key={item.id} achievement={item} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-bold">О себе</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Дополнительные данные сохраняются в вашем браузере.
          </p>
          <div className="mt-6 space-y-4">
            <ProfileField
              label="Город"
              value={extras.city}
              onChange={(city) => setExtras((p) => ({ ...p, city }))}
              placeholder="Алматы"
            />
            <ProfileField
              label="Цель обучения"
              value={extras.learningGoal}
              onChange={(learningGoal) =>
                setExtras((p) => ({ ...p, learningGoal }))
              }
              placeholder="Научиться писать промпты для работы"
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                О себе
              </span>
              <textarea
                value={extras.bio}
                onChange={(e) =>
                  setExtras((p) => ({ ...p, bio: e.target.value }))
                }
                rows={4}
                placeholder="Расскажите коротко о себе..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveExtras}
              className="rounded-xl bg-brand-purple px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-purple/25 transition hover:bg-brand-purple-dark"
            >
              {saved ? (
                <span className="inline-flex items-center gap-1.5">
                  <IconCheck className="h-4 w-4" />
                  Сохранено
                </span>
              ) : (
                "Сохранить"
              )}
            </button>
          </div>
        </motion.section>

        {progress.practiceHistory.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-bold">Последняя тренировка</h2>
            <ul className="mt-4 space-y-2">
              {progress.practiceHistory.slice(0, 5).map((entry) => (
                <li
                  key={`${entry.lessonId}-${entry.date}`}
                  className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800/50"
                >
                  <span className="font-medium">{entry.lessonId}</span>
                  <span className="text-zinc-500">
                    {entry.score}/100 · +{entry.xpEarned} XP
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/50">
      <p className="text-2xl font-bold text-brand-purple">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function ProgressRow({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-zinc-500">
          {done}/{total}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-brand-green transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        achievement.unlocked
          ? "border-brand-purple/30 bg-brand-purple/5 dark:bg-brand-purple/10"
          : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-white/5 dark:bg-zinc-800/30"
      }`}
    >
      <AchievementIcon
        name={achievement.icon}
        className={
          achievement.unlocked
            ? "h-7 w-7 text-brand-purple dark:text-brand-purple-light"
            : "h-7 w-7 text-zinc-400"
        }
      />
      <p className="mt-2 font-semibold text-sm">{achievement.title}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {achievement.description}
      </p>
      {achievement.unlocked && (
        <p className="mt-2 text-xs font-medium text-brand-green">Получено</p>
      )}
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100"
      />
    </label>
  );
}
