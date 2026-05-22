export const XP_PER_TASK = 10;

export const DAILY_TARGET = 5;
export const DAILY_BONUS = 50;

export const WEEKLY_TARGET = 25;
export const WEEKLY_BONUS = 200;

export const MONTHLY_TARGET = 80;
export const MONTHLY_BONUS = 500;

export const LEVEL_CAP = 100;

export function xpToNextLevel(level: number): number {
  return 100 + 50 * level;
}

export function computeLevel(totalXp: number): number {
  let level = 1;
  let xpConsumed = 0;
  while (level < LEVEL_CAP) {
    const needed = xpToNextLevel(level);
    if (xpConsumed + needed > totalXp) break;
    xpConsumed += needed;
    level++;
  }
  return level;
}

export function xpIntoCurrentLevel(totalXp: number): number {
  let level = 1;
  let xpConsumed = 0;
  while (level < LEVEL_CAP) {
    const needed = xpToNextLevel(level);
    if (xpConsumed + needed > totalXp) break;
    xpConsumed += needed;
    level++;
  }
  return totalXp - xpConsumed;
}
