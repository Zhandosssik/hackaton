import { EDUCATION_LESSONS } from "@/data/education";
import { LESSON_SECTIONS } from "@/data/lessons";
import { getProgressOwnerKey } from "@/lib/active-user";
import { getCompletedEducationLessons } from "@/lib/education-storage";
import { calculateRating } from "@/lib/rating";
import type { Achievement, GameProgress, PracticeHistoryEntry } from "@/types/game";

const LEGACY_PROGRESS_KEY = "promptquest-game-progress";
const XP_PER_LEVEL = 300;
const MAX_HEARTS = 3;
const TOTAL_PRACTICE = LESSON_SECTIONS.reduce(
  (sum, section) => sum + section.lessons.length,
  0,
);

export const TOTAL_EDUCATION = EDUCATION_LESSONS.length;

function gameProgressKey(ownerKey?: string): string {
  return `promptquest-game-progress-${ownerKey ?? getProgressOwnerKey()}`;
}

function defaultProgress(): GameProgress {
  return {
    totalXp: 0,
    hearts: MAX_HEARTS,
    streak: 0,
    lastActiveDate: null,
    completedPractice: [],
    practiceHistory: [],
  };
}

function parseProgress(raw: string): GameProgress {
  const parsed = JSON.parse(raw) as Partial<GameProgress>;
  return {
    totalXp: typeof parsed.totalXp === "number" ? parsed.totalXp : 0,
    hearts:
      typeof parsed.hearts === "number"
        ? Math.min(MAX_HEARTS, Math.max(0, parsed.hearts))
        : MAX_HEARTS,
    streak: typeof parsed.streak === "number" ? parsed.streak : 0,
    lastActiveDate:
      typeof parsed.lastActiveDate === "string" ? parsed.lastActiveDate : null,
    completedPractice: Array.isArray(parsed.completedPractice)
      ? parsed.completedPractice.filter((id): id is string => typeof id === "string")
      : [],
    practiceHistory: Array.isArray(parsed.practiceHistory)
      ? parsed.practiceHistory.filter(isHistoryEntry)
      : [],
  };
}

function isHistoryEntry(value: unknown): value is PracticeHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as PracticeHistoryEntry;
  return (
    typeof entry.lessonId === "string" &&
    typeof entry.score === "number" &&
    typeof entry.xpEarned === "number" &&
    typeof entry.date === "string"
  );
}

function saveProgress(progress: GameProgress, ownerKey?: string): void {
  localStorage.setItem(gameProgressKey(ownerKey), JSON.stringify(progress));
}

/** Перенос старого общего ключа в guest (один раз) */
export function migrateLegacyGameProgress(): void {
  if (typeof window === "undefined") return;
  const legacy = localStorage.getItem(LEGACY_PROGRESS_KEY);
  const guestKey = gameProgressKey("guest");
  if (legacy && !localStorage.getItem(guestKey)) {
    localStorage.setItem(guestKey, legacy);
  }
  if (legacy) localStorage.removeItem(LEGACY_PROGRESS_KEY);
}

/** Если у пользователя ещё нет сохранения — копируем гостевой прогресс */
export function copyGuestProgressToUser(userId: string): void {
  if (typeof window === "undefined") return;
  migrateLegacyGameProgress();
  const userKey = gameProgressKey(userId);
  if (localStorage.getItem(userKey)) return;
  const guestRaw = localStorage.getItem(gameProgressKey("guest"));
  if (guestRaw) localStorage.setItem(userKey, guestRaw);
}

export function getGameProgress(ownerKey?: string): GameProgress {
  if (typeof window === "undefined") return defaultProgress();
  migrateLegacyGameProgress();
  try {
    const raw = localStorage.getItem(gameProgressKey(ownerKey));
    if (!raw) return defaultProgress();
    return parseProgress(raw);
  } catch {
    return defaultProgress();
  }
}

export function setGameProgress(
  progress: GameProgress,
  ownerKey?: string,
): void {
  if (typeof window === "undefined") return;
  saveProgress(progress, ownerKey);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(progress: GameProgress): GameProgress {
  const today = todayKey();
  if (progress.lastActiveDate === today) return progress;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  let streak = progress.streak;
  if (progress.lastActiveDate === yesterdayKey) {
    streak += 1;
  } else if (progress.lastActiveDate !== today) {
    streak = 1;
  }

  return { ...progress, streak, lastActiveDate: today };
}

export function recordPracticeResult(
  lessonId: string,
  score: number,
  isCorrect: boolean,
): GameProgress {
  const xpEarned = Math.round(score);
  let progress = updateStreak(getGameProgress());

  if (!isCorrect && score < 40) {
    progress = {
      ...progress,
      hearts: Math.max(0, progress.hearts - 1),
    };
  }

  if (isCorrect && !progress.completedPractice.includes(lessonId)) {
    progress = {
      ...progress,
      completedPractice: [...progress.completedPractice, lessonId],
    };
  }

  progress = {
    ...progress,
    totalXp: progress.totalXp + (isCorrect ? xpEarned : 0),
    practiceHistory: [
      {
        lessonId,
        score,
        xpEarned: isCorrect ? xpEarned : 0,
        date: new Date().toISOString(),
      },
      ...progress.practiceHistory,
    ].slice(0, 50),
  };

  saveProgress(progress);
  return progress;
}

export function recordDailyTaskResult(
  taskId: string,
  score: number,
  isCorrect: boolean,
): GameProgress {
  const xpEarned = Math.round(score);
  let progress = updateStreak(getGameProgress());

  if (!isCorrect && score < 40) {
    progress = {
      ...progress,
      hearts: Math.max(0, progress.hearts - 1),
    };
  }

  progress = {
    ...progress,
    totalXp: progress.totalXp + (isCorrect ? xpEarned : 0),
    practiceHistory: [
      {
        lessonId: `daily:${taskId}`,
        score,
        xpEarned: isCorrect ? xpEarned : 0,
        date: new Date().toISOString(),
      },
      ...progress.practiceHistory,
    ].slice(0, 50),
  };

  saveProgress(progress);
  return progress;
}

export function getPlayerLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(totalXp: number): {
  current: number;
  max: number;
  percent: number;
} {
  const inLevel = totalXp % XP_PER_LEVEL;
  return {
    current: inLevel,
    max: XP_PER_LEVEL,
    percent: Math.round((inLevel / XP_PER_LEVEL) * 100),
  };
}

export function getRating(
  totalXp: number,
  educationDoneCount: number,
  practiceDoneCount?: number,
  ownerKey?: string,
): number {
  const practiceCount =
    practiceDoneCount ??
    getGameProgress(ownerKey).completedPractice.length;
  return calculateRating(totalXp, practiceCount, educationDoneCount);
}

export function getAchievements(
  progress: GameProgress,
  educationCompleted: string[],
): Achievement[] {
  const level = getPlayerLevel(progress.totalXp);
  const defs: Achievement[] = [
    {
      id: "first_theory",
      title: "Первые знания",
      description: "Пройдите первый урок теории",
      icon: "book-open",
      unlocked: educationCompleted.length >= 1,
    },
    {
      id: "theory_master",
      title: "Теоретик",
      description: "Пройдите все 10 уроков",
      icon: "graduation",
      unlocked: educationCompleted.length >= TOTAL_EDUCATION,
    },
    {
      id: "first_practice",
      title: "В тренировке",
      description: "Выполните первое задание тренировки с AI",
      icon: "target",
      unlocked: progress.completedPractice.length >= 1,
    },
    {
      id: "practice_pro",
      title: "Промпт-мастер",
      description: "Пройдите 10 заданий тренировки",
      icon: "zap",
      unlocked: progress.completedPractice.length >= 10,
    },
    {
      id: "streak_3",
      title: "На волне",
      description: "Стрик 3 дня подряд",
      icon: "flame",
      unlocked: progress.streak >= 3,
    },
    {
      id: "streak_7",
      title: "Неделя силы",
      description: "Стрик 7 дней подряд",
      icon: "dumbbell",
      unlocked: progress.streak >= 7,
    },
    {
      id: "level_5",
      title: "Уровень 5",
      description: "Достигните 5-го уровня",
      icon: "star",
      unlocked: level >= 5,
    },
    {
      id: "xp_500",
      title: "500 XP",
      description: "Накопите 500 очков опыта",
      icon: "gem",
      unlocked: progress.totalXp >= 500,
    },
  ];

  return defs;
}

export function getOverallProgressPercent(
  progress: GameProgress,
  educationCompleted: string[],
): number {
  const practicePart =
    (progress.completedPractice.length / TOTAL_PRACTICE) * 50;
  const theoryPart = (educationCompleted.length / TOTAL_EDUCATION) * 50;
  return Math.round(practicePart + theoryPart);
}

export { TOTAL_PRACTICE, XP_PER_LEVEL, MAX_HEARTS };
