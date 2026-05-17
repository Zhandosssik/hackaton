import { setActiveUserId } from "@/lib/active-user";

/** После входа: привязать сессию к пользователю и перезагрузить страницу */
export function redirectAfterAuth(userId: string, path = "/profile"): void {
  setActiveUserId(userId);
  window.location.assign(path);
}
