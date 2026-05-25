import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  todayInSP,
  weekStartInSP,
  weekEndInSP,
  monthStartInSP,
  nWeeksAgoStart,
  nWeeksAgoEnd,
} from "./lib/dates";
import { Id } from "./_generated/dataModel";
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

export const weeklyBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const weeks = Array.from({ length: 6 }, (_, i) => {
      const n = 5 - i;
      const start = nWeeksAgoStart(n);
      const end = nWeeksAgoEnd(n);
      const [, month, day] = start.split("-");
      return { start, end, label: `${day}/${month}` };
    });

    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("completionDate", weeks[0].start)
      )
      .collect();

    const uniqueTaskIds = [...new Set(completions.map((c) => c.taskId))];
    const tasks = await Promise.all(uniqueTaskIds.map((id) => ctx.db.get(id)));
    const taskMap = new Map(
      tasks.filter(Boolean).map((t) => [t!._id as string, t!])
    );

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId).eq("archived", false)
      )
      .collect();
    const projectMap = new Map(projects.map((p) => [p._id as string, p]));

    const weekData = weeks.map((week) => {
      const weekCompletions = completions.filter(
        (c) => c.completionDate >= week.start && c.completionDate <= week.end
      );

      const countByProject = new Map<string, number>();
      for (const c of weekCompletions) {
        const task = taskMap.get(c.taskId as string);
        const key = (task?.projectId as string | undefined) ?? "none";
        countByProject.set(key, (countByProject.get(key) ?? 0) + 1);
      }

      const byProject = [...countByProject.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => {
          if (key === "none") {
            return { projectId: null, projectName: "Sem projeto", color: "#6B7280", count };
          }
          const project = projectMap.get(key);
          return {
            projectId: key,
            projectName: project?.name ?? "Projeto",
            color: project?.color ?? "#6B7280",
            count,
          };
        });

      return { label: week.label, weekStart: week.start, total: weekCompletions.length, byProject };
    });

    const maxTotal = Math.max(...weekData.map((w) => w.total), 1);
    return { weeks: weekData, maxTotal };
  },
});
