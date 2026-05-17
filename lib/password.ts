const HAS_UPPERCASE = /[A-ZА-ЯЁ]/;
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("не менее 8 символов");
  }
  if (!HAS_UPPERCASE.test(password)) {
    errors.push("хотя бы одна заглавная буква");
  }
  if (!HAS_SPECIAL.test(password)) {
    errors.push("хотя бы один спецсимвол (!@#$…)");
  }

  return { valid: errors.length === 0, errors };
}

export function passwordsMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password === confirmPassword;
}

export const PASSWORD_REQUIREMENTS_HINT =
  "Минимум 8 символов, одна заглавная буква и один спецсимвол";
