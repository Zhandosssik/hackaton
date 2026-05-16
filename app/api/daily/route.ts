import { NextResponse } from "next/server";
import { findDailyTasks, saveDailyTasks } from "@/lib/daily-db";
import { generateDailyTasksForUser } from "@/lib/generate-daily-tasks";
import { getSessionUser } from "@/lib/auth";
import {
  isMistralNetworkError,
  mistralNetworkErrorMessage,
} from "@/lib/mistral";
import type { DailyRequestContext, DailyTasksPayload } from "@/types/daily";

export const maxDuration = 120;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function mistralErrorMessage(status: number, errText: string): string {
  if (status === 400 || status === 401 || status === 403) {
    return "Неверный MISTRAL_API_KEY. Создайте ключ на console.mistral.ai, вставьте в .env.local и перезапустите npm run dev";
  }
  if (status === 429) {
    return "Лимит запросов Mistral исчерпан. Подождите и попробуйте снова";
  }
  return "Не удалось сгенерировать задания. Попробуйте позже.";
}

function parseContext(body: unknown): DailyRequestContext | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const date = typeof data.date === "string" ? data.date.trim() : "";

  if (!DATE_RE.test(date)) return null;

  return {
    date,
    learningGoal:
      typeof data.learningGoal === "string" ? data.learningGoal : undefined,
    educationCompleted: Math.max(0, Number(data.educationCompleted) || 0),
    practiceCompleted: Math.max(0, Number(data.practiceCompleted) || 0),
    playerLevel: Math.max(1, Number(data.playerLevel) || 1),
    totalXp: Math.max(0, Number(data.totalXp) || 0),
    streak: Math.max(0, Number(data.streak) || 0),
  };
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Войдите в аккаунт, чтобы получить ежедневные задания" },
      { status: 401 },
    );
  }

  const apiKey = process.env.MISTRAL_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "MISTRAL_API_KEY не настроен. Добавьте ключ в .env.local и перезапустите сервер",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const context = parseContext(body);
  if (!context) {
    return NextResponse.json(
      { error: "Укажите корректную дату (YYYY-MM-DD) и контекст прогресса" },
      { status: 400 },
    );
  }

  const existing = findDailyTasks(user.id, context.date);
  if (existing) {
    const payload: DailyTasksPayload = {
      date: context.date,
      tasks: existing.tasks,
      cached: true,
    };
    return NextResponse.json(payload);
  }

  try {
    const tasks = await generateDailyTasksForUser(
      apiKey,
      user.displayName,
      context,
    );
    saveDailyTasks(user.id, context.date, tasks);

    const payload: DailyTasksPayload = {
      date: context.date,
      tasks,
      cached: false,
    };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Daily tasks generation error:", error);

    if (isMistralNetworkError(error)) {
      return NextResponse.json(
        { error: mistralNetworkErrorMessage() },
        { status: 503 },
      );
    }

    const message = error instanceof Error ? error.message : "";
    const statusMatch = message.match(/Mistral (\d+)/);
    if (statusMatch) {
      const status = Number(statusMatch[1]);
      return NextResponse.json(
        { error: mistralErrorMessage(status, message) },
        { status: status === 429 ? 429 : 502 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Не удалось разобрать ответ AI. Попробуйте ещё раз." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось подготовить задания на сегодня. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
