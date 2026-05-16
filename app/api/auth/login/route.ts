import { NextResponse } from "next/server";
import {
  createSessionToken,
  findUserByEmail,
  normalizeEmail,
  setAuthCookie,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { authConfigErrorResponse, isAuthConfigError } from "@/lib/auth-errors";
import type { AuthResponse, LoginRequestBody } from "@/types/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email и пароль обязательны" },
      { status: 400 },
    );
  }

  const user = findUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 },
    );
  }

  try {
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

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Не удалось войти" },
      { status: 500 },
    );
  }
}
