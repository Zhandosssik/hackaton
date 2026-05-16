const STORAGE_KEY = "promptquest-education-completed";

export function getCompletedEducationLessons(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function markEducationLessonComplete(lessonId: string): void {
  const current = getCompletedEducationLessons();
  if (current.includes(lessonId)) return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...current, lessonId]),
  );
}
