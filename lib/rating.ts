/** Максимум баллов рейтинга (не путать с местом в таблице лидеров) */
export const MAX_RATING_SCORE = 1000;

/** Единая формула баллов рейтинга (клиент и сервер) */
export function calculateRating(
  totalXp: number,
  practiceCompletedCount: number,
  educationCompletedCount: number,
): number {
  const practiceScore = practiceCompletedCount * 40;
  const theoryScore = educationCompletedCount * 25;
  const xpScore = Math.min(500, totalXp);
  return Math.min(
    MAX_RATING_SCORE,
    practiceScore + theoryScore + Math.floor(xpScore / 2),
  );
}

export const XP_PER_LEVEL = 300;

export function getPlayerLevelFromXp(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}
