/** Первый урок теории доступен без регистрации */
export const GUEST_FREE_EDUCATION_LESSON_ID = "edu-1";

/** @deprecated Используйте isEducationLessonUnlocked с completedLessonIds */
export function isEducationLessonAccessible(
  lessonId: string,
  isAuthenticated: boolean,
): boolean {
  return isAuthenticated || lessonId === GUEST_FREE_EDUCATION_LESSON_ID;
}
