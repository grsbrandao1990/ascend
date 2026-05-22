import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { recurrenceValidator, occursOnDate } from "./recurrence";
import { todayInSP } from "./lib/dates";
import { awardXpForCompletion } from "./gamification";
import { XP_PER_TASK } from "./gameConfig";

export const getOwnerId = internalQuery({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    return user?._id ?? null;
  },
});

export const createTask = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    recurrence: v.optional(recurrenceValidator),
  },
  handler: async (ctx, { userId, title, description, dueDate, projectId, recurrence }) => {
    return await ctx.db.insert("tasks", {
      userId,
      title,
      description,
      dueDate: recurrence ? undefined : dueDate,
      projectId,
      recurrence,
      completed: false,
      deleted: false,
      createdAt: Date.now(),
    });
  },
});

export const completeTask = internalMutation({
  args: {
    userId: v.id("users"),
    taskId: v.id("tasks"),
    occurrenceDate: v.optional(v.string()),
  },
  handler: async (ctx, { userId, taskId, occurrenceDate }) => {
    const task = await ctx.db.get(taskId);
    if (!task || task.userId !== userId) throw new Error("Task not found");

    const completionDate = occurrenceDate ?? todayInSP();
    const now = Date.now();

    const existing = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task_date", (q) =>
        q.eq("taskId", taskId).eq("completionDate", completionDate)
      )
      .first();
    if (existing) return { xpAwarded: 0, leveledUp: false, newLevel: 0 };

    if (!task.recurrence) {
      await ctx.db.patch(taskId, { completed: true, completedAt: now });
    }

    const result = await awardXpForCompletion(ctx, userId);
    await ctx.db.insert("taskCompletions", {
      taskId,
      userId,
      completedAt: now,
      completionDate,
      xpAwarded: XP_PER_TASK,
    });

    return { xpAwarded: result.xpAwarded, leveledUp: result.leveledUp, newLevel: result.newLevel };
  },
});

export const listToday = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = todayInSP();
    const todayStartMs = Date.parse(today + "T03:00:00.000Z");

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const results: Array<(typeof allTasks)[number] & { completedToday: boolean }> = [];

    for (const t of allTasks) {
      if (t.deleted) continue;
      if (t.recurrence) {
        if (!occursOnDate(t.recurrence, today)) continue;
        const completion = await ctx.db
          .query("taskCompletions")
          .withIndex("by_task_date", (q) =>
            q.eq("taskId", t._id).eq("completionDate", today)
          )
          .first();
        results.push({ ...t, completedToday: completion != null });
      } else {
        const pendingToday = !t.completed && t.dueDate != null && t.dueDate <= today;
        const doneToday =
          t.completed && t.completedAt != null && t.completedAt >= todayStartMs;
        if (!pendingToday && !doneToday) continue;
        results.push({ ...t, completedToday: t.completed });
      }
    }

    return results;
  },
});

export const listAll = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return tasks.filter((t) => !t.deleted && !t.completed);
  },
});

export const searchTasks = internalQuery({
  args: { userId: v.id("users"), text: v.string() },
  handler: async (ctx, { userId, text }) => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const results = await ctx.db
      .query("tasks")
      .withSearchIndex("search_title", (q) =>
        q.search("title", trimmed).eq("userId", userId)
      )
      .collect();
    return results.filter((t) => !t.deleted);
  },
});

export const listProjects = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId).eq("archived", false)
      )
      .collect();
  },
});
