import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "users.json");

export interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  created_at: string;
}

interface UserDatabase {
  users: StoredUser[];
}

function readDatabase(): UserDatabase {
  fs.mkdirSync(DB_DIR, { recursive: true });

  if (!fs.existsSync(DB_FILE)) {
    const empty: UserDatabase = { users: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as UserDatabase;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { users: [] };
  }
}

function writeDatabase(data: UserDatabase): void {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, DB_FILE);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findStoredUserByEmail(email: string): StoredUser | null {
  const normalized = normalizeEmail(email);
  return (
    readDatabase().users.find((u) => u.email.toLowerCase() === normalized) ??
    null
  );
}

export function findStoredUserById(id: string): StoredUser | null {
  return readDatabase().users.find((u) => u.id === id) ?? null;
}

export function isStoredEmailTaken(email: string): boolean {
  return findStoredUserByEmail(email) !== null;
}

export function insertStoredUser(user: StoredUser): StoredUser {
  const db = readDatabase();
  const normalized = normalizeEmail(user.email);

  if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new Error("EMAIL_TAKEN");
  }

  const record: StoredUser = {
    ...user,
    email: normalized,
    display_name: user.display_name.trim(),
    first_name: user.first_name?.trim(),
    last_name: user.last_name?.trim(),
    age: user.age,
  };

  db.users.push(record);
  writeDatabase(db);
  return record;
}
