import type { ProfileExtras } from "@/types/profile";

function storageKey(userId: string): string {
  return `promptquest-profile-${userId}`;
}

const DEFAULT_EXTRAS: ProfileExtras = {
  bio: "",
  city: "",
  learningGoal: "",
};

export function getProfileExtras(userId: string): ProfileExtras {
  if (typeof window === "undefined") return { ...DEFAULT_EXTRAS };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { ...DEFAULT_EXTRAS };
    const parsed = JSON.parse(raw) as Partial<ProfileExtras>;
    return {
      bio: typeof parsed.bio === "string" ? parsed.bio : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      learningGoal:
        typeof parsed.learningGoal === "string" ? parsed.learningGoal : "",
    };
  } catch {
    return { ...DEFAULT_EXTRAS };
  }
}

export function saveProfileExtras(
  userId: string,
  extras: ProfileExtras,
): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(extras));
}
