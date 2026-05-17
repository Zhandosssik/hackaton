import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { upsertUserProgress } from "@/lib/progress-db";
import type { SyncProgressBody } from "@/types/leaderboard";

function parseBody(raw: unknown): SyncProgressBody | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  const totalXp = Number(data.totalXp);
  const streak = Number(data.streak);

  if (!Number.isFinite(totalXp) || !Number.isFinite(streak)) {
    return null;
  }

  const completedPractice = Array.isArray(data.completedPractice)
    ? data.completedPractice.filter((id): id is string => typeof id === "string")
    : [];

  const educationCompleted = Array.isArray(data.educationCompleted)
    ? data.educationCompleted.filter((id): id is string => typeof id === "string")
    : [];

  return {
    totalXp,
    streak,
    completedPractice,
    educationCompleted,
  };
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = parseBody(body);

  if (!parsed) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const record = upsertUserProgress({
    userId: user.id,
    totalXp: parsed.totalXp,
    streak: parsed.streak,
    completedPractice: parsed.completedPractice,
    educationCompleted: parsed.educationCompleted,
  });

  return NextResponse.json({
    rating: record.rating,
    updatedAt: record.updated_at,
  });
}
