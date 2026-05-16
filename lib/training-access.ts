import { EDUCATION_LESSONS } from "@/data/education";
import { LESSON_SECTIONS, findLesson } from "@/data/lessons";

export const TRAINING_UNLOCK_EDUCATION_COUNT = 3;

export const TRAINING_REQUIRED_EDUCATION_IDS = EDUCATION_LESSONS.slice(
  0,
  TRAINING_UNLOCK_EDUCATION_COUNT,
).map((l) => l.id);

/** Минимальная оценка AI для зачёта и открытия следующего задания в секции */
export const TRAINING_PASS_SCORE = 70;

export function isTrainingUnlocked(completedEducationIds: string[]): boolean {
  return TRAINING_REQUIRED_EDUCATION_IDS.every((id) =>
    completedEducationIds.includes(id),
  );
}

export function getTrainingUnlockLockReason(
  completedEducationIds: string[],
): string | null {
  if (isTrainingUnlocked(completedEducationIds)) return null;

  const done = TRAINING_REQUIRED_EDUCATION_IDS.filter((id) =>
    completedEducationIds.includes(id),
  ).length;

  if (done === 0) {
    return `Пройдите первые ${TRAINING_UNLOCK_EDUCATION_COUNT} урока в разделе «Обучение», чтобы открыть тренировку.`;
  }

  return `Пройдено ${done} из ${TRAINING_UNLOCK_EDUCATION_COUNT} уроков обучения. Завершите оставшиеся, чтобы открыть тренировку.`;
}

export function isTrainingLessonUnlocked(
  lessonId: string,
  completedEducationIds: string[],
  completedPracticeIds: string[],
): boolean {
  if (!isTrainingUnlocked(completedEducationIds)) return false;

  const found = findLesson(lessonId);
  if (!found) return false;

  const index = found.section.lessons.findIndex((l) => l.id === lessonId);
  if (index <= 0) return true;

  const previousId = found.section.lessons[index - 1].id;
  return completedPracticeIds.includes(previousId);
}

export function getTrainingLessonLockReason(
  lessonId: string,
  completedEducationIds: string[],
  completedPracticeIds: string[],
): string | null {
  const trainingReason = getTrainingUnlockLockReason(completedEducationIds);
  if (trainingReason) return trainingReason;

  if (
    isTrainingLessonUnlocked(
      lessonId,
      completedEducationIds,
      completedPracticeIds,
    )
  ) {
    return null;
  }

  const found = findLesson(lessonId);
  if (!found) return "Задание не найдено";

  const index = found.section.lessons.findIndex((l) => l.id === lessonId);
  if (index <= 0) return null;

  const prev = found.section.lessons[index - 1];
  return `Сначала наберите ${TRAINING_PASS_SCORE}+ баллов в задании «${prev.title}».`;
}

export function getDefaultUnlockedTrainingLessonId(
  completedEducationIds: string[],
  completedPracticeIds: string[],
): string {
  for (const section of LESSON_SECTIONS) {
    for (const lesson of section.lessons) {
      if (
        isTrainingLessonUnlocked(
          lesson.id,
          completedEducationIds,
          completedPracticeIds,
        )
      ) {
        return lesson.id;
      }
    }
  }
  return LESSON_SECTIONS[0].lessons[0].id;
}
