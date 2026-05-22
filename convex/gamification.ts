import { DatabaseWriter, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  XP_PER_TASK,
  DAILY_TARGET,
  DAILY_BONUS,
  WEEKLY_TARGET,
  WEEKLY_BONUS,
  MONTHLY_TARGET,
  MONTHLY_BONUS,
  LEVEL_CAP,
  computeLevel,
} from "./gameConfig";
import {
  todayInSP,
  yesterdayInSP,
  weekStartInSP,
  weekEndInSP,
  monthStartInSP,
  weekKeyInSP,
  monthKeyInSP,
} from "./lib/dates";

export interface GamificationResult {
  xpAwarded: number;
  goalBonuses: Array<{ goalType: "daily" | "weekly" | "monthly"; xp: number }>;
  leveledUp: boolean;
  newLevel: number;
  totalXp: number;
}

async function getOrCreateUserStats(db: DatabaseWriter, userId: Id<"users">) {
  const existing = await db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (existing) return existing;

  const id = await db.insert("userStats", {
    userId,
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: undefined,
    tasksCompleted: 0,
  });
  return (await db.get(id))!;
}

async function countCompletionsInRange(
  db: DatabaseWriter,
  userId: Id<"users">,
  from: string,
  to: string
): Promise<number> {
  const rows = await db
    .query("taskCompletions")
    .withIndex("by_user_date", (q) =>
      q.eq("userId", userId).gte("completionDate", from)
    )
    .collect();
  return rows.filter((r) => r.completionDate <= to).length;
}

async function checkAndAwardGoal(
  db: DatabaseWriter,
  userId: Id<"users">,
  goalType: "daily" | "weekly" | "monthly",
  periodKey: string,
  count: number,
  target: number,
  bonus: number
): Promise<number> {
  if (count < target) return 0;

  const already = await db
    .query("goalAwards")
    .withIndex("by_user_goal_period", (q) =>
      q.eq("userId", userId).eq("goalType", goalType).eq("periodKey", periodKey)
    )
    .first();
  if (already) return 0;

  await db.insert("goalAwards", {
    userId,
    goalType,
    periodKey,
    xpAwarded: bonus,
    awardedAt: Date.now(),
  });
  return bonus;
}

async function updateStreak(
  db: DatabaseWriter,
  stats: Awaited<ReturnType<typeof getOrCreateUserStats>>,
  today: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  const yesterday = yesterdayInSP();
  let currentStreak = stats.currentStreak;

  if (stats.lastCompletionDate === today) {
    // Already counted today
    return { currentStreak, longestStreak: stats.longestStreak };
  } else if (stats.lastCompletionDate === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  const longestStreak = Math.max(currentStreak, stats.longestStreak);
  return { currentStreak, longestStreak };
}

export async function awardXpForCompletion(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<GamificationResult> {
  const db = ctx.db as DatabaseWriter;
  const stats = await getOrCreateUserStats(db, userId);
  const today = todayInSP();

  // Count completions after this one
  const todayCompletions =
    (await countCompletionsInRange(db, userId, today, today)) + 1;
  const weekStart = weekStartInSP();
  const weekEnd = weekEndInSP();
  const weekCompletions =
    (await countCompletionsInRange(db, userId, weekStart, weekEnd)) + 1;
  const monthStart = monthStartInSP();
  const monthCompletions =
    (await countCompletionsInRange(db, userId, monthStart, today)) + 1;

  // Base XP
  let totalAwarded = XP_PER_TASK;
  const goalBonuses: GamificationResult["goalBonuses"] = [];

  // Goal bonuses
  const dailyBonus = await checkAndAwardGoal(
    db,
    userId,
    "daily",
    today,
    todayCompletions,
    DAILY_TARGET,
    DAILY_BONUS
  );
  if (dailyBonus > 0) {
    totalAwarded += dailyBonus;
    goalBonuses.push({ goalType: "daily", xp: dailyBonus });
  }

  const weeklyBonus = await checkAndAwardGoal(
    db,
    userId,
    "weekly",
    weekKeyInSP(),
    weekCompletions,
    WEEKLY_TARGET,
    WEEKLY_BONUS
  );
  if (weeklyBonus > 0) {
    totalAwarded += weeklyBonus;
    goalBonuses.push({ goalType: "weekly", xp: weeklyBonus });
  }

  const monthlyBonus = await checkAndAwardGoal(
    db,
    userId,
    "monthly",
    monthKeyInSP(),
    monthCompletions,
    MONTHLY_TARGET,
    MONTHLY_BONUS
  );
  if (monthlyBonus > 0) {
    totalAwarded += monthlyBonus;
    goalBonuses.push({ goalType: "monthly", xp: monthlyBonus });
  }

  // Streak
  const { currentStreak, longestStreak } = await updateStreak(db, stats, today);

  // Level
  const oldLevel = stats.level;
  const newTotalXp = stats.totalXp + totalAwarded;
  const newLevel = Math.min(computeLevel(newTotalXp), LEVEL_CAP);
  const leveledUp = newLevel > oldLevel;

  await db.patch(stats._id, {
    totalXp: newTotalXp,
    level: newLevel,
    currentStreak,
    longestStreak,
    lastCompletionDate: today,
    tasksCompleted: stats.tasksCompleted + 1,
  });

  return {
    xpAwarded: totalAwarded,
    goalBonuses,
    leveledUp,
    newLevel,
    totalXp: newTotalXp,
  };
}

export async function reverseXpForTask(
  ctx: MutationCtx,
  userId: Id<"users">,
  xpAwarded: number
): Promise<void> {
  const db = ctx.db as DatabaseWriter;
  const stats = await getOrCreateUserStats(db, userId);
  const newTotalXp = Math.max(0, stats.totalXp - xpAwarded);
  const newLevel = Math.min(computeLevel(newTotalXp), LEVEL_CAP);
  await db.patch(stats._id, {
    totalXp: newTotalXp,
    level: newLevel,
    tasksCompleted: Math.max(0, stats.tasksCompleted - 1),
  });
}
