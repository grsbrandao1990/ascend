import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { todayInSP } from "./lib/dates";

export const recurrenceValidator = v.object({
  type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  weekdays: v.optional(v.array(v.number())),
  monthDay: v.optional(v.number()),
  interval: v.optional(v.number()),    // weeks between occurrences (weekly only)
  startDate: v.optional(v.string()),   // anchor date for interval calculation (YYYY-MM-DD)
});

export type RecurrenceRule = {
  type: "daily" | "weekly" | "monthly";
  weekdays?: number[]; // 0=Sun … 6=Sat
  monthDay?: number;   // 1-31
  interval?: number;   // weeks
  startDate?: string;  // YYYY-MM-DD
};

/** Retorna true se a tarefa com essa regra ocorre na data informada (YYYY-MM-DD). */
export function occursOnDate(rule: RecurrenceRule, dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00.000Z");
  const dayOfWeek = d.getUTCDay();
  const dayOfMonth = d.getUTCDate();
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;

  switch (rule.type) {
    case "daily":
      return true;
    case "weekly": {
      const dayMatch = (rule.weekdays ?? []).includes(dayOfWeek);
      if (!dayMatch) return false;
      const interval = rule.interval ?? 1;
      if (interval <= 1) return true;
      const start = rule.startDate ?? dateStr;
      const startD = new Date(start + "T12:00:00.000Z");
      const targetD = new Date(dateStr + "T12:00:00.000Z");
      const weekDiff = Math.round(
        (targetD.getTime() - startD.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      return weekDiff >= 0 && weekDiff % interval === 0;
    }
    case "monthly": {
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const target = Math.min(rule.monthDay ?? 1, lastDay);
      return dayOfMonth === target;
    }
  }
}

export const ensureTodayOccurrences = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = todayInSP();
    const tasks = await ctx.db.query("tasks").collect();
    const recurring = tasks.filter((t) => !t.deleted && t.recurrence != null);
    const todayCount = recurring.filter((t) =>
      occursOnDate(t.recurrence!, today)
    ).length;
    return { today, recurringTasksTotal: recurring.length, occurringToday: todayCount };
  },
});
