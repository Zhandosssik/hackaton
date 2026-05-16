import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { authConfigErrorResponse, isAuthConfigError } from "@/lib/auth-errors";
import type { AuthResponse } from "@/types/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    return NextResponse.json<AuthResponse>({ user });
  } catch (error) {
    if (isAuthConfigError(error)) {
      return authConfigErrorResponse();
    }

    console.error("Me error:", error);
    return NextResponse.json(
      { error: "Не удалось получить профиль" },
      { status: 500 },
    );
  }
}
