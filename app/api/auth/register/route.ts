import { NextResponse } from "next/server";
import {
  createSessionToken,
  createUser,
  hashPassword,
  isEmailTaken,
  setAuthCookie,
  toPublicUser,
} from "@/lib/auth";
import { authConfigErrorResponse, isAuthConfigError } from "@/lib/auth-errors";
import { validateRegisterBody } from "@/lib/register-validation";
import type { AuthResponse, RegisterRequestBody } from "@/types/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: RegisterRequestBody;

  try {
    body = (await request.json()) as RegisterRequestBody;
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const validation = validateRegisterBody(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { email, password, firstName, lastName, age } = validation.data;

  if (isEmailTaken(email)) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 },
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      age,
    });
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
