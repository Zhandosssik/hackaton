export function authConfigErrorResponse(): Response {
  return Response.json(
    {
      error:
        "JWT_SECRET не настроен. Добавьте секрет (мин. 16 символов) в .env.local и перезапустите сервер",
    },
    { status: 500 },
  );
}

export function isAuthConfigError(error: unknown): boolean {
  return (
    error instanceof Error && error.message === "JWT_SECRET is not configured"
  );
}
