import { NextResponse } from "next/server";
import {
  createSessionToken,
  createUser,
  hashPassword,
  isEmailTaken,
  isValidEmail,
  normalizeEmail,
  setAuthCookie,
  toPublicUser,
} from "@/lib/auth";
import { authConfigErrorResponse, isAuthConfigError } from "@/lib/auth-errors";
import type { AuthResponse, RegisterRequestBody } from "@/types/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: RegisterRequestBody;

  try {
    body = (await request.json()) as RegisterRequestBody;
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  const displayName = (body.displayName ?? "").trim();

  if (!email || !password || !displayName) {
    return NextResponse.json(
      { error: "Email, пароль и имя обязательны" },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 6 символов" },
      { status: 400 },
    );
  }

  if (displayName.length < 2) {
    return NextResponse.json(
      { error: "Имя должно быть не короче 2 символов" },
      { status: 400 },
    );
  }

  if (isEmailTaken(email)) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 },
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser({ email, passwordHash, displayName });
    const token = await createSessionToken(user.id);

    const response = NextResponse.json<AuthResponse>({
      user: toPublicUser(user),
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (isAuthConfigError(error)) {
      return authConfigErrorResponse();
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Не удалось создать аккаунт" },
      { status: 500 },
    );
  }
}
