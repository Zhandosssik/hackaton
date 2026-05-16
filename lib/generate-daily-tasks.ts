import {
  extractMistralText,
  fetchMistral,
  MISTRAL_MODEL,
} from "@/lib/mistral";
import type { DailyRequestContext, DailyTask } from "@/types/daily";

const SYSTEM_PROMPT = `Ты методист по обучению AI-промптингу в приложении Prompto.
Составь ровно 5 уникальных практических заданий на один день для конкретного ученика.
Задания — написать промпт для LLM (не код приложения). Темы разнообразные: текст, анализ, креатив, роли, структура, few-shot и т.д.
Учитывай уровень ученика: новичкам — проще, опытным — сложнее и глубже.
Каждый день задания должны отличаться от типовых шаблонов.
Ответь ТОЛЬКО JSON без markdown:
{
  "tasks": [
    {
      "number": 1,
      "title": "краткое название",
      "description": "что именно должен сделать ученик в промпте (1-3 предложения, на русском)",
      "category": "текст | анализ | креатив | роль | структура | few-shot | другое",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}`;

function parseDailyTasksJson(
  content: string,
  date: string,
): DailyTask[] {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON shape");
  }

  const data = parsed as { tasks?: unknown };
  if (!Array.isArray(data.tasks) || data.tasks.length !== 5) {
    throw new Error("Expected exactly 5 tasks");
  }

  return data.tasks.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid task entry");
    }

    const task = raw as Record<string, unknown>;
    const number = Number(task.number) || index + 1;
    const title = String(task.title ?? "").trim();
    const description = String(task.description ?? "").trim();
    const category = String(task.category ?? "общее").trim();
    const diff = String(task.difficulty ?? "medium");

    if (!title || !description) {
      throw new Error("Task missing title or description");
    }

    const difficulty =
      diff === "easy" || diff === "medium" || diff === "hard"
        ? diff
        : "medium";

    return {
      id: `${date}-${number}`,
      number,
      title,
      description,
      category,
      difficulty,
    } satisfies DailyTask;
  });
}

function buildUserPrompt(
  displayName: string,
  context: DailyRequestContext,
): string {
  const goal = context.learningGoal?.trim() || "не указана";
  const lines = [
    `Дата заданий: ${context.date}`,
    `Ученик: ${displayName}`,
    `Цель обучения: ${goal}`,
    `Уровень игрока: ${context.playerLevel}`,
    `Всего XP: ${context.totalXp}`,
    `Пройдено уроков теории: ${context.educationCompleted}`,
    `Пройдено заданий тренировки: ${context.practiceCompleted}`,
    `Текущий стрик (дней): ${context.streak ?? 0}`,
    "",
    "Сгенерируй 5 заданий с номерами 1–5, подходящих именно этому ученику на сегодня.",
  ];
  return lines.join("\n");
}

export async function generateDailyTasksForUser(
  apiKey: string,
  displayName: string,
  context: DailyRequestContext,
): Promise<DailyTask[]> {
  const mistralResponse = await fetchMistral(apiKey, {
    model: MISTRAL_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(displayName, context),
      },
    ],
    temperature: 0.85,
    response_format: { type: "json_object" },
  });

  if (!mistralResponse.ok) {
    const errText = await mistralResponse.text();
    throw new Error(`Mistral ${mistralResponse.status}: ${errText}`);
  }

  const mistralData = (await mistralResponse.json()) as Parameters<
    typeof extractMistralText
  >[0];

  const content = extractMistralText(mistralData);
  if (!content) {
    throw new Error("Empty Mistral response");
  }

  return parseDailyTasksJson(content, context.date);
}
