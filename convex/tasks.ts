import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { todayInSP } from "./lib/dates";
import { Doc, Id } from "./_generated/dataModel";
import { awardXpForCompletion, reverseXpForTask } from "./gamification";
import { XP_PER_TASK } from "./gameConfig";
import { recurrenceValidator, occursOnDate } from "./recurrence";

const priorityValidator = v.optional(v.union(v.literal("p1"), v.literal("p2"), v.literal("p3")));

export const create = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: priorityValidator,
    recurrence: v.optional(recurrenceValidator),
  },
  handler: async (ctx, { projectId, title, description, dueDate, priority, recurrence }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("tasks", {
      userId,
      projectId,
      title,
      description,
      dueDate: recurrence ? undefined : dueDate,
      priority,
      recurrence,
      completed: false,
      deleted: false,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    priority: priorityValidator,
    clearPriority: v.optional(v.boolean()),
    recurrence: v.optional(recurrenceValidator),
    clearRecurrence: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, title, description, dueDate, projectId, priority, clearPriority, recurrence, clearRecurrence }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = (await ctx.db.get(id)) as Doc<"tasks"> | null;
    if (!task || task.userId !== userId) throw new Error("Not found");
    const patch: Record<string, unknown> = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (dueDate !== undefined) patch.dueDate = dueDate;
    if (projectId !== undefined) patch.projectId = projectId;
    if (priority !== undefined) patch.priority = priority;
    if (clearPriority) patch.priority = undefined;
    if (recurrence !== undefined) {
      patch.recurrence = recurrence;
      patch.dueDate = undefined;
    }
    if (clearRecurrence) {
      patch.recurrence = undefined;
    }
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { deleted: true });
  },
});

export const duplicate = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    return await ctx.db.insert("tasks", {
      userId,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      recurrence: task.recurrence,
      completed: false,
      deleted: false,
      createdAt: Date.now(),
    });
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId || task.deleted) return null;
    return task;
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    return tasks.filter((t) => t.userId === userId && !t.deleted);
  },
});

export const listToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const today = todayInSP();
    const todayStartMs = Date.parse(today + "T03:00:00.000Z");

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const results: (typeof allTasks[number] & { completedToday: boolean })[] = [];

    for (const t of allTasks) {
      if (t.deleted) continue;

      if (t.recurrence) {
        // Tarefa recorrente: ocorre hoje?
        if (!occursOnDate(t.recurrence, today)) continue;
        const completion = await ctx.db
          .query("taskCompletions")
          .withIndex("by_task_date", (q) =>
            q.eq("taskId", t._id).eq("completionDate", today)
          )
          .first();
        results.push({ ...t, completedToday: completion != null });
      } else {
        // Tarefa avulsa: vencida ou de hoje (pendente), ou concluída hoje
        const pendingToday =
          !t.completed && t.dueDate != null && t.dueDate <= today;
        const completedToday =
          t.completed &&
          t.completedAt != null &&
          t.completedAt >= todayStartMs;
        if (!pendingToday && !completedToday) continue;
        results.push({ ...t, completedToday: t.completed });
      }
    }

    return results;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return tasks.filter((t) => !t.deleted && !t.completed);
  },
});

export const complete = mutation({
  args: {
    id: v.id("tasks"),
    occurrenceDate: v.optional(v.string()),
  },
  returns: v.object({
    xpAwarded: v.number(),
    goalBonuses: v.array(
      v.object({
        goalType: v.union(
          v.literal("daily"),
          v.literal("weekly"),
          v.literal("monthly")
        ),
        xp: v.number(),
      })
    ),
    leveledUp: v.boolean(),
    newLevel: v.number(),
    totalXp: v.number(),
  }),
  handler: async (ctx, { id, occurrenceDate }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const completionDate = occurrenceDate ?? todayInSP();
    const now = Date.now();

    // Idempotência: não duplicar se já concluída nessa data
    const existing = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task_date", (q) =>
        q.eq("taskId", id).eq("completionDate", completionDate)
      )
      .first();
    if (existing) {
      // Já concluída — retorna stats atuais sem re-conceder XP
      const stats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      return {
        xpAwarded: 0,
        goalBonuses: [],
        leveledUp: false,
        newLevel: stats?.level ?? 1,
        totalXp: stats?.totalXp ?? 0,
      };
    }

    // Para tarefas avulsas, marcar como concluída no registro
    if (!task.recurrence) {
      await ctx.db.patch(id, { completed: true, completedAt: now });
    }

    const result = await awardXpForCompletion(ctx, userId);

    await ctx.db.insert("taskCompletions", {
      taskId: id,
      userId,
      completedAt: now,
      completionDate,
      xpAwarded: XP_PER_TASK,
    });

    return result;
  },
});

export const uncomplete = mutation({
  args: {
    id: v.id("tasks"),
    occurrenceDate: v.optional(v.string()),
  },
  handler: async (ctx, { id, occurrenceDate }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    // Para tarefas avulsas, desmarcar como concluída
    if (!task.recurrence) {
      await ctx.db.patch(id, { completed: false, completedAt: undefined });
    }

    // Busca o registro de conclusão a remover
    let completion;
    if (occurrenceDate) {
      completion = await ctx.db
        .query("taskCompletions")
        .withIndex("by_task_date", (q) =>
          q.eq("taskId", id).eq("completionDate", occurrenceDate)
        )
        .first();
    } else {
      completion = await ctx.db
        .query("taskCompletions")
        .withIndex("by_task", (q) => q.eq("taskId", id))
        .order("desc")
        .first();
    }

    if (completion) {
      await reverseXpForTask(ctx, userId, completion.xpAwarded);
      await ctx.db.delete(completion._id);
    }
  },
});

export const search = query({
  args: {
    text: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, { text, projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const trimmed = text?.trim() ?? "";
    let results: Doc<"tasks">[] = [];

    if (trimmed) {
      // Busca full-text por título via search index
      const byTitle = await ctx.db
        .query("tasks")
        .withSearchIndex("search_title", (q) =>
          q.search("title", trimmed).eq("userId", userId)
        )
        .collect();
      const titleIds = new Set(byTitle.map((t) => t._id));
      const filtered = byTitle.filter((t) => !t.deleted);

      // Complementa com busca em descrição (in-memory)
      const allTasks = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const lower = trimmed.toLowerCase();
      const byDesc = allTasks.filter(
        (t) =>
          !t.deleted &&
          !titleIds.has(t._id) &&
          t.description?.toLowerCase().includes(lower)
      );

      results = [...filtered, ...byDesc];
    } else {
      results = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      results = results.filter((t) => !t.deleted);
    }

    if (projectId) {
      results = results.filter((t) => t.projectId === projectId);
    }

    return results;
  },
});
