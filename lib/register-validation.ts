import { isValidEmail, normalizeEmail } from "@/lib/email";
import { passwordsMatch, validatePassword } from "@/lib/password";
import type { RegisterRequestBody } from "@/types/auth";

const MIN_AGE = 6;
const MAX_AGE = 120;
const NAME_MIN = 2;
const NAME_MAX = 60;

function trimName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isValidName(value: string): boolean {
  return (
    value.length >= NAME_MIN &&
    value.length <= NAME_MAX &&
    /^[a-zA-ZА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүІі\s'-]+$/.test(value)
  );
}

export interface ParsedRegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  displayName: string;
}

export function validateRegisterBody(
  body: RegisterRequestBody,
): { ok: true; data: ParsedRegisterInput } | { ok: false; error: string } {
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  const passwordConfirm = body.passwordConfirm ?? "";
  const firstName = trimName(body.firstName ?? "");
  const lastName = trimName(body.lastName ?? "");
  const ageRaw = body.age;

  if (!email || !password || !firstName || !lastName) {
    return { ok: false, error: "Заполните все обязательные поля" };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Некорректный email" };
  }

  if (!isValidName(firstName)) {
    return {
      ok: false,
      error: `Имя: от ${NAME_MIN} до ${NAME_MAX} символов, только буквы`,
    };
  }

  if (!isValidName(lastName)) {
    return {
      ok: false,
      error: `Фамилия: от ${NAME_MIN} до ${NAME_MAX} символов, только буквы`,
    };
  }

  const age =
    typeof ageRaw === "number"
      ? ageRaw
      : typeof ageRaw === "string"
        ? Number.parseInt(ageRaw, 10)
        : NaN;

  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) {
    return {
      ok: false,
      error: `Укажите возраст от ${MIN_AGE} до ${MAX_AGE} лет`,
    };
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return {
      ok: false,
      error: `Пароль: ${passwordCheck.errors.join(", ")}`,
    };
  }

  if (!passwordConfirm) {
    return { ok: false, error: "Подтвердите пароль" };
  }

  if (!passwordsMatch(password, passwordConfirm)) {
    return { ok: false, error: "Пароли не совпадают" };
  }

  return {
    ok: true,
    data: {
      email,
      password,
      firstName,
      lastName,
      age,
      displayName: `${firstName} ${lastName}`,
    },
  };
}
