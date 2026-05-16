import { getCompletedEducationLessons } from "@/lib/education-storage";
import {
  getGameProgress,
  getPlayerLevel,
  recordDailyTaskResult,
} from "@/lib/game-progress";
import type { DailyProgress, DailyRequestContext } from "@/types/daily";

const PASS_SCORE = 70;

function storageKey(userId: string): string {
  return `promptquest-daily-${userId}`;
}

function defaultProgress(date: string): DailyProgress {
  return {
    date,
    completedTaskIds: [],
    taskScores: {},
  };
}

export function getDailyProgress(userId: string, date: string): DailyProgress {
  if (typeof window === "undefined") return defaultProgress(date);
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return defaultProgress(date);
    const parsed = JSON.parse(raw) as Partial<DailyProgress>;
    if (parsed.date !== date) return defaultProgress(date);
    return {
      date,
      completedTaskIds: Array.isArray(parsed.completedTaskIds)
        ? parsed.completedTaskIds.filter((id): id is string => typeof id === "string")
        : [],
      taskScores:
        parsed.taskScores && typeof parsed.taskScores === "object"
          ? Object.fromEntries(
              Object.entries(parsed.taskScores).filter(
                ([, v]) => typeof v === "number",
              ),
            )
          : {},
    };
  } catch {
    return defaultProgress(date);
  }
}

export function saveDailyProgress(userId: string, progress: DailyProgress): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(progress));
}

export function isDailyTaskCompleted(
  userId: string,
  date: string,
  taskId: string,
): boolean {
  return getDailyProgress(userId, date).completedTaskIds.includes(taskId);
}

export function recordDailyCompletion(
  userId: string,
  date: string,
  taskId: string,
  score: number,
  isCorrect: boolean,
): DailyProgress {
  const progress = getDailyProgress(userId, date);
  const passed = isCorrect || score >= PASS_SCORE;

  if (passed && !progress.completedTaskIds.includes(taskId)) {
    progress.completedTaskIds = [...progress.completedTaskIds, taskId];
  }

  progress.taskScores = {
    ...progress.taskScores,
    [taskId]: score,
  };

  saveDailyProgress(userId, progress);
  recordDailyTaskResult(taskId, score, passed);
  return progress;
}

export function getDailyCompletionCount(
  userId: string,
  date: string,
): number {
  return getDailyProgress(userId, date).completedTaskIds.length;
}

export function getClientLocalDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDailyContext(
  date: string,
  learningGoal?: string,
): DailyRequestContext {
  const game = getGameProgress();
  const education = getCompletedEducationLessons();

  return {
    date,
    learningGoal: learningGoal?.trim() || undefined,
    educationCompleted: education.length,
    practiceCompleted: game.completedPractice.length,
    playerLevel: getPlayerLevel(game.totalXp),
    totalXp: game.totalXp,
    streak: game.streak,
  };
}
