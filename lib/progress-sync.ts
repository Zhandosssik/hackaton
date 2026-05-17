import { setActiveUserId } from "@/lib/active-user";
import {
  copyGuestProgressToUser,
  getGameProgress,
  setGameProgress,
} from "@/lib/game-progress";
import {
  copyGuestEducationToUser,
  getCompletedEducationLessons,
  setCompletedEducationLessons,
} from "@/lib/education-storage";
import type { SyncProgressBody } from "@/types/leaderboard";
import type { GameProgress } from "@/types/game";

export interface ServerProgressPayload {
  totalXp: number;
  streak: number;
  completedPractice: string[];
  educationCompleted: string[];
  rating: number;
  updatedAt: string;
}

export function prepareUserSession(userId: string): void {
  setActiveUserId(userId);
  copyGuestProgressToUser(userId);
  copyGuestEducationToUser(userId);
}

export function buildProgressSyncPayload(userId?: string): SyncProgressBody {
  const game = getGameProgress(userId);
  return {
    totalXp: game.totalXp,
    streak: game.streak,
    completedPractice: game.completedPractice,
    educationCompleted: getCompletedEducationLessons(userId),
  };
}

function mergeLessonIds(a: string[], b: string[]): string[] {
  return Array.from(new Set(a.concat(b)));
}

function mergeGameProgress(
  local: GameProgress,
  server: ServerProgressPayload,
): GameProgress {
  const useServer =
    server.totalXp > local.totalXp ||
    server.completedPractice.length > local.completedPractice.length;

  if (!useServer) return local;

  return {
    ...local,
    totalXp: Math.max(local.totalXp, server.totalXp),
    streak: Math.max(local.streak, server.streak),
    completedPractice: mergeLessonIds(
      local.completedPractice,
      server.completedPractice,
    ),
  };
}

/** Подтянуть прогресс с сервера и синхронизировать актуальное состояние */
export async function hydrateAndSyncUserProgress(
  userId: string,
): Promise<boolean> {
  prepareUserSession(userId);

  let server: ServerProgressPayload | null = null;

  try {
    const response = await fetch("/api/progress/me", { credentials: "include" });
    if (response.ok) {
      server = (await response.json()) as ServerProgressPayload;
    }
  } catch {
    // продолжаем с локальными данными
  }

  if (server) {
    const localGame = getGameProgress(userId);
    const localEdu = getCompletedEducationLessons(userId);

    const mergedGame = mergeGameProgress(localGame, server);
    const mergedEdu = mergeLessonIds(
      localEdu,
      server.educationCompleted,
    );

    setGameProgress(mergedGame, userId);
    setCompletedEducationLessons(mergedEdu, userId);
  }

  return syncUserProgressToServer(userId);
}

export async function syncUserProgressToServer(
  userId?: string,
): Promise<boolean> {
  try {
    const response = await fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(buildProgressSyncPayload(userId)),
    });
    return response.ok;
  } catch {
    return false;
  }
}
