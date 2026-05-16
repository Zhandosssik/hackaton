import { Agent, fetch as undiciFetch } from "undici";

const MAX_RETRIES = 3;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
export const MISTRAL_MODEL = "mistral-small-latest";

const mistralAgent = new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 120_000,
  bodyTimeout: 120_000,
});

export function isMistralNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const cause = error.cause as { code?: string } | undefined;
  const code = cause?.code ?? "";

  return (
    error.message.includes("fetch failed") ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_BODY_TIMEOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT"
  );
}

export function mistralNetworkErrorMessage(): string {
  return (
    "Не удаётся подключиться к Mistral (таймаут сети). " +
    "Проверьте интернет и перезапустите npm run dev."
  );
}

export interface MistralChatPayload {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature: number;
  response_format: { type: "json_object" };
}

export async function fetchMistral(
  apiKey: string,
  payload: MistralChatPayload,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await undiciFetch(MISTRAL_API_URL, {
        method: "POST",
        dispatcher: mistralAgent,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000),
      });

      return response as unknown as Response;
    } catch (error) {
      lastError = error;

      if (!isMistralNetworkError(error) || attempt === MAX_RETRIES) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }

  throw lastError;
}

export function extractMistralText(data: {
  choices?: { message?: { content?: string | null } }[];
}): string | null {
  return data.choices?.[0]?.message?.content ?? null;
}
