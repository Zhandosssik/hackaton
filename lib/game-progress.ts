import { EDUCATION_LESSONS } from "@/data/education";
import { LESSON_SECTIONS } from "@/data/lessons";
import { getCompletedEducationLessons } from "@/lib/education-storage";
import type { Achievement, GameProgress, PracticeHistoryEntry } from "@/types/game";

const PROGRESS_KEY = "promptquest-game-progress";
const XP_PER_LEVEL = 300;
const MAX_HEARTS = 3;
const TOTAL_PRACTICE = LESSON_SECTIONS.reduce(
  (sum, section) => sum + section.lessons.length,
  0,
);

export const TOTAL_EDUCATION = EDUCATION_LESSONS.length;

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

export function getGameProgress(): GameProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
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
  } catch {
    return defaultProgress();
  }
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

function saveProgress(progress: GameProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
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

/** XP за ежедневное задание (не влияет на список тренировки) */
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

export function getRating(totalXp: number, educationDone: number): number {
  const practiceScore = getGameProgress().completedPractice.length * 40;
  const theoryScore = educationDone * 25;
  const xpScore = Math.min(500, totalXp);
  return Math.min(1000, practiceScore + theoryScore + Math.floor(xpScore / 2));
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
