import fs from "fs";
import path from "path";
import type { DailyTask } from "@/types/daily";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "daily-tasks.json");

export interface StoredDailyEntry {
  user_id: string;
  date: string;
  tasks: DailyTask[];
  generated_at: string;
}

interface DailyTasksDatabase {
  entries: StoredDailyEntry[];
}

function readDatabase(): DailyTasksDatabase {
  fs.mkdirSync(DB_DIR, { recursive: true });

  if (!fs.existsSync(DB_FILE)) {
    const empty: DailyTasksDatabase = { entries: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DailyTasksDatabase;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return { entries: [] };
  }
}

function writeDatabase(data: DailyTasksDatabase): void {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, DB_FILE);
}

export function findDailyTasks(
  userId: string,
  date: string,
): StoredDailyEntry | null {
  return (
    readDatabase().entries.find(
      (e) => e.user_id === userId && e.date === date,
    ) ?? null
  );
}

export function saveDailyTasks(
  userId: string,
  date: string,
  tasks: DailyTask[],
): StoredDailyEntry {
  const db = readDatabase();
  const generated_at = new Date().toISOString();

  const entry: StoredDailyEntry = {
    user_id: userId,
    date,
    tasks,
    generated_at,
  };

  const index = db.entries.findIndex(
    (e) => e.user_id === userId && e.date === date,
  );

  if (index >= 0) {
    db.entries[index] = entry;
  } else {
    db.entries.push(entry);
  }

  writeDatabase(db);
  return entry;
}
