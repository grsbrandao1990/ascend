import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { todayInSP } from "./lib/dates";

export const recurrenceValidator = v.object({
  type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  weekdays: v.optional(v.array(v.number())),
  monthDay: v.optional(v.number()),
});

export type RecurrenceRule = {
  type: "daily" | "weekly" | "monthly";
  weekdays?: number[]; // 0=Sun … 6=Sat
  monthDay?: number;   // 1-31
};

/** Retorna true se a tarefa com essa regra ocorre na data informada (YYYY-MM-DD). */
export function occursOnDate(rule: RecurrenceRule, dateStr: string): boolean {
  // Usa noon UTC para evitar qualquer problema de DST/fuso
  const d = new Date(dateStr + "T12:00:00.000Z");
  const dayOfWeek = d.getUTCDay();   // 0=Dom, 6=Sab
  const dayOfMonth = d.getUTCDate();
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;

  switch (rule.type) {
    case "daily":
      return true;
    case "weekly":
      return (rule.weekdays ?? []).includes(dayOfWeek);
    case "monthly": {
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const target = Math.min(rule.monthDay ?? 1, lastDay);
      return dayOfMonth === target;
    }
  }
}

/**
 * Mutation interna idempotente chamada pelo cron diário.
 * No modelo de query dinâmica, as ocorrências são derivadas em tempo real
 * pelo listToday — esta mutation é o hook de extensibilidade para
 * lógica futura (notificações, pré-aquecimento de cache, etc.).
 */
export const ensureTodayOccurrences = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = todayInSP();
    // Busca todas as tarefas recorrentes não deletadas
    const tasks = await ctx.db
      .query("tasks")
      .collect();
    const recurring = tasks.filter(
      (t) => !t.deleted && t.recurrence != null
    );
    // Valida quais ocorrem hoje (útil para debug no painel do Convex)
    const todayCount = recurring.filter((t) =>
      occursOnDate(t.recurrence!, today)
    ).length;
    return { today, recurringTasksTotal: recurring.length, occurringToday: todayCount };
  },
});
