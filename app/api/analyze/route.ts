import { NextResponse } from "next/server";
import {
  extractMistralText,
  fetchMistral,
  MISTRAL_MODEL,
  isMistralNetworkError,
  mistralNetworkErrorMessage,
} from "@/lib/mistral";
import type { AnalyzeRequestBody, AnalyzeResult } from "@/types/analyze";

export const maxDuration = 120;

const SYSTEM_PROMPT = `Ты эксперт по AI-промптингу. Пользователь выполняет задание и пишет промпт.
Оцени его промпт и ответь ТОЛЬКО JSON без markdown:
{
  "score": number (0-100),
  "isCorrect": boolean (true если score >= 70),
  "feedback": string (что именно не так, на русском),
  "hint": string (подсказка как улучшить, на русском),
  "correctPrompt": string (правильный вариант промпта)
}`;

function parseAnalyzeJson(content: string): AnalyzeResult {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON shape");
  }

  const data = parsed as Record<string, unknown>;

  const score = Number(data.score);
  const isCorrect = Boolean(data.isCorrect);
  const feedback = String(data.feedback ?? "");
  const hint = String(data.hint ?? "");
  const correctPrompt = String(data.correctPrompt ?? "");

  if (Number.isNaN(score) || score < 0 || score > 100) {
    throw new Error("Invalid score");
  }

  return {
    score: Math.round(score),
    isCorrect: isCorrect || score >= 70,
    feedback,
    hint,
    correctPrompt,
  };
}

function mistralErrorMessage(status: number, errText: string): string {
  if (status === 400 || status === 401 || status === 403) {
    return "Неверный MISTRAL_API_KEY. Создайте ключ на console.mistral.ai, вставьте в .env.local и перезапустите npm run dev";
  }
  if (status === 429) {
    return "Лимит запросов Mistral исчерпан. Подождите и попробуйте снова";
  }
  try {
    const parsed = JSON.parse(errText) as {
      message?: string;
      error?: { message?: string };
    };
    const msg = parsed.message ?? parsed.error?.message;
    if (msg) return msg;
  } catch {
    // ignore
  }
  return "Ошибка при обращении к AI";
}

export async function POST(request: Request) {
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

  let body: AnalyzeRequestBody;

  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const userPrompt = body.userPrompt?.trim();
  const taskDescription = body.taskDescription?.trim();

  if (!userPrompt || !taskDescription) {
    return NextResponse.json(
      { error: "userPrompt и taskDescription обязательны" },
      { status: 400 },
    );
  }

  try {
    const mistralResponse = await fetchMistral(apiKey, {
      model: MISTRAL_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Задание: ${taskDescription}\n\nПромпт пользователя:\n${userPrompt}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    if (!mistralResponse.ok) {
      const errText = await mistralResponse.text();
      console.error("Mistral API error:", mistralResponse.status, errText);
      return NextResponse.json(
        { error: mistralErrorMessage(mistralResponse.status, errText) },
        {
          status:
            mistralResponse.status === 401 || mistralResponse.status === 403
              ? 401
              : 502,
        },
      );
    }

    const mistralData = (await mistralResponse.json()) as Parameters<
      typeof extractMistralText
    >[0];

    const content = extractMistralText(mistralData);

    if (!content) {
      return NextResponse.json(
        { error: "Пустой ответ от AI" },
        { status: 502 },
      );
    }

    const result = parseAnalyzeJson(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze error:", error);

    if (isMistralNetworkError(error)) {
      return NextResponse.json(
        { error: mistralNetworkErrorMessage() },
        { status: 503 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Не удалось разобрать ответ AI" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось проверить промпт. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
