const SESSION_USER_KEY = "pq-active-user-id";

export function getActiveUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage.getItem(SESSION_USER_KEY);
    return id && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

export function setActiveUserId(userId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_USER_KEY, userId);
}

export function clearActiveUserId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_USER_KEY);
}

/** Ключ хранилища: guest или id пользователя */
export function getProgressOwnerKey(): string {
  return getActiveUserId() ?? "guest";
}
