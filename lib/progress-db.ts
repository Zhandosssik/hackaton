import fs from "fs";
import path from "path";
import { findStoredUserById } from "@/lib/db";
import {
  calculateRating,
  getPlayerLevelFromXp,
} from "@/lib/rating";
import type { LeaderboardEntry } from "@/types/leaderboard";

const DB_DIR = path.join(process.cwd(), "data");
const PROGRESS_FILE = path.join(DB_DIR, "user-progress.json");

export interface StoredUserProgress {
  user_id: string;
  total_xp: number;
  streak: number;
  practice_completed: string[];
  education_completed: string[];
  /** @deprecated только для старых записей */
  practice_completed_count?: number;
  /** @deprecated только для старых записей */
  education_completed_count?: number;
  rating: number;
  updated_at: string;
}

interface ProgressDatabase {
  entries: StoredUserProgress[];
}

function readDatabase(): ProgressDatabase {
  fs.mkdirSync(DB_DIR, { recursive: true });

  if (!fs.existsSync(PROGRESS_FILE)) {
    const empty: ProgressDatabase = { entries: [] };
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }

  try {
    const raw = fs.readFileSync(PROGRESS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ProgressDatabase;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return { entries: [] };
  }
}

function writeDatabase(data: ProgressDatabase): void {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const tmp = `${PROGRESS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, PROGRESS_FILE);
}

function practiceIds(row: StoredUserProgress): string[] {
  if (Array.isArray(row.practice_completed)) return row.practice_completed;
  return [];
}

function educationIds(row: StoredUserProgress): string[] {
  if (Array.isArray(row.education_completed)) return row.education_completed;
  return [];
}

function practiceCount(row: StoredUserProgress): number {
  const ids = practiceIds(row);
  if (ids.length > 0) return ids.length;
  return row.practice_completed_count ?? 0;
}

function educationCount(row: StoredUserProgress): number {
  const ids = educationIds(row);
  if (ids.length > 0) return ids.length;
  return row.education_completed_count ?? 0;
}

export function findStoredProgressByUserId(
  userId: string,
): StoredUserProgress | null {
  return readDatabase().entries.find((e) => e.user_id === userId) ?? null;
}

export interface UpsertProgressInput {
  userId: string;
  totalXp: number;
  streak: number;
  completedPractice: string[];
  educationCompleted: string[];
}

export function upsertUserProgress(
  input: UpsertProgressInput,
): StoredUserProgress {
  const practice = Array.from(new Set(input.completedPractice));
  const education = Array.from(new Set(input.educationCompleted));
  const totalXp = Math.max(0, Math.round(input.totalXp));
  const streak = Math.max(0, Math.round(input.streak));
  const rating = calculateRating(totalXp, practice.length, education.length);

  const record: StoredUserProgress = {
    user_id: input.userId,
    total_xp: totalXp,
    streak,
    practice_completed: practice,
    education_completed: education,
    rating,
    updated_at: new Date().toISOString(),
  };

  const db = readDatabase();
  const index = db.entries.findIndex((e) => e.user_id === input.userId);

  if (index >= 0) {
    db.entries[index] = record;
  } else {
    db.entries.push(record);
  }

  writeDatabase(db);
  return record;
}

function sortEntries(entries: StoredUserProgress[]): StoredUserProgress[] {
  return [...entries].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.total_xp !== a.total_xp) return b.total_xp - a.total_xp;
    return (
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });
}

function rowToLeaderboardEntry(
  row: StoredUserProgress,
  displayName: string,
  rank: number,
  currentUserId?: string | null,
): LeaderboardEntry {
  return {
    rank,
    userId: row.user_id,
    displayName,
    rating: row.rating,
    totalXp: row.total_xp,
    level: getPlayerLevelFromXp(row.total_xp),
    streak: row.streak,
    practiceCompleted: practiceCount(row),
    educationCompleted: educationCount(row),
    updatedAt: row.updated_at,
    isCurrentUser: currentUserId === row.user_id,
  };
}

export function getLeaderboard(
  limit = 100,
  currentUserId?: string | null,
): { entries: LeaderboardEntry[]; totalPlayers: number } {
  const sorted = sortEntries(readDatabase().entries);
  const withUsers = sorted
    .map((row) => {
      const user = findStoredUserById(row.user_id);
      if (!user) return null;
      return { row, displayName: user.display_name };
    })
    .filter(
      (
        item,
      ): item is { row: StoredUserProgress; displayName: string } =>
        item !== null,
    );

  const totalPlayers = withUsers.length;
  const sliced = withUsers.slice(0, limit);

  const entries: LeaderboardEntry[] = sliced.map((item, index) =>
    rowToLeaderboardEntry(
      item.row,
      item.displayName,
      index + 1,
      currentUserId,
    ),
  );

  return { entries, totalPlayers };
}

export function findUserProgressRank(
  userId: string,
): LeaderboardEntry | null {
  const sorted = sortEntries(readDatabase().entries);
  const withUsers = sorted
    .map((row) => {
      const user = findStoredUserById(row.user_id);
      if (!user) return null;
      return { row, displayName: user.display_name };
    })
    .filter(
      (
        item,
      ): item is { row: StoredUserProgress; displayName: string } =>
        item !== null,
    );

  const index = withUsers.findIndex((item) => item.row.user_id === userId);
  if (index < 0) return null;

  const item = withUsers[index];
  return rowToLeaderboardEntry(
    item.row,
    item.displayName,
    index + 1,
    userId,
  );
}
