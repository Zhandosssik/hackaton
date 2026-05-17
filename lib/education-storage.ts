import { getProgressOwnerKey } from "@/lib/active-user";

const LEGACY_STORAGE_KEY = "promptquest-education-completed";

function educationKey(ownerKey?: string): string {
  return `promptquest-education-completed-${ownerKey ?? getProgressOwnerKey()}`;
}

export function migrateLegacyEducationProgress(): void {
  if (typeof window === "undefined") return;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  const guestKey = educationKey("guest");
  if (legacy && !localStorage.getItem(guestKey)) {
    localStorage.setItem(guestKey, legacy);
  }
  if (legacy) localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function copyGuestEducationToUser(userId: string): void {
  if (typeof window === "undefined") return;
  migrateLegacyEducationProgress();
  const userKey = educationKey(userId);
  if (localStorage.getItem(userKey)) return;
  const guestRaw = localStorage.getItem(educationKey("guest"));
  if (guestRaw) localStorage.setItem(userKey, guestRaw);
}

export function getCompletedEducationLessons(ownerKey?: string): string[] {
  if (typeof window === "undefined") return [];
  migrateLegacyEducationProgress();
  try {
    const raw = localStorage.getItem(educationKey(ownerKey));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function setCompletedEducationLessons(
  lessonIds: string[],
  ownerKey?: string,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    educationKey(ownerKey),
    JSON.stringify(Array.from(new Set(lessonIds))),
  );
}

export function markEducationLessonComplete(lessonId: string): void {
  const current = getCompletedEducationLessons();
  if (current.includes(lessonId)) return;
  setCompletedEducationLessons([...current, lessonId]);
}
