import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  todayInSP,
  weekStartInSP,
  weekEndInSP,
  monthStartInSP,
} from "./lib/dates";
import {
  DAILY_TARGET,
  WEEKLY_TARGET,
  MONTHLY_TARGET,
  xpToNextLevel,
  xpIntoCurrentLevel,
} from "./gameConfig";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const today = todayInSP();
    const weekStart = weekStartInSP();
    const weekEnd = weekEndInSP();
    const monthStart = monthStartInSP();

    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("completionDate", monthStart)
      )
      .collect();

    const dailyCount = completions.filter(
      (c) => c.completionDate === today
    ).length;
    const weeklyCount = completions.filter(
      (c) => c.completionDate >= weekStart && c.completionDate <= weekEnd
    ).length;
    const monthlyCount = completions.filter(
      (c) => c.completionDate >= monthStart
    ).length;

    const level = stats?.level ?? 1;
    const totalXp = stats?.totalXp ?? 0;
    const xpInLevel = xpIntoCurrentLevel(totalXp);
    const xpNeeded = xpToNextLevel(level);

    return {
      level,
      totalXp,
      xpInLevel,
      xpNeeded,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      tasksCompleted: stats?.tasksCompleted ?? 0,
      goals: {
        daily: { count: dailyCount, target: DAILY_TARGET },
        weekly: { count: weeklyCount, target: WEEKLY_TARGET },
        monthly: { count: monthlyCount, target: MONTHLY_TARGET },
      },
    };
  },
});
