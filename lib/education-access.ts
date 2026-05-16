import { EDUCATION_LESSONS } from "@/data/education";
import { GUEST_FREE_EDUCATION_LESSON_ID } from "@/lib/auth-access";

/** Урок доступен для просмотра (гость — только первый; далее — после сдачи предыдущего) */
export function isEducationLessonUnlocked(
  lessonId: string,
  isAuthenticated: boolean,
  completedLessonIds: string[],
): boolean {
  if (!isAuthenticated) {
    return lessonId === GUEST_FREE_EDUCATION_LESSON_ID;
  }

  const index = EDUCATION_LESSONS.findIndex((l) => l.id === lessonId);
  if (index < 0) return false;
  if (index === 0) return true;

  const previousId = EDUCATION_LESSONS[index - 1].id;
  return completedLessonIds.includes(previousId);
}

export function getEducationLessonLockReason(
  lessonId: string,
  isAuthenticated: boolean,
  completedLessonIds: string[],
): string | null {
  if (isEducationLessonUnlocked(lessonId, isAuthenticated, completedLessonIds)) {
    return null;
  }

  if (!isAuthenticated) {
    return "Доступен только первый урок. Зарегистрируйтесь для полного курса.";
  }

  const index = EDUCATION_LESSONS.findIndex((l) => l.id === lessonId);
  if (index > 0) {
    const prev = EDUCATION_LESSONS[index - 1];
    return `Сначала пройдите урок ${prev.number} и сдайте тест.`;
  }

  return "Урок заблокирован";
}
