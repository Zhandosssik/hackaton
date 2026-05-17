import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { findStoredProgressByUserId } from "@/lib/progress-db";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const record = findStoredProgressByUserId(user.id);

  if (!record) {
    return NextResponse.json({
      totalXp: 0,
      streak: 0,
      completedPractice: [],
      educationCompleted: [],
      rating: 0,
      updatedAt: null,
    });
  }

  return NextResponse.json({
    totalXp: record.total_xp,
    streak: record.streak,
    completedPractice: Array.isArray(record.practice_completed)
      ? record.practice_completed
      : [],
    educationCompleted: Array.isArray(record.education_completed)
      ? record.education_completed
      : [],
    rating: record.rating,
    updatedAt: record.updated_at,
  });
}
