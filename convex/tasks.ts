import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { todayInSP } from "./lib/dates";
import { Id } from "./_generated/dataModel";
import { awardXpForCompletion, reverseXpForTask } from "./gamification";
import { XP_PER_TASK } from "./gameConfig";

export const create = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, title, description, dueDate }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("tasks", {
      userId,
      projectId,
      title,
      description,
      dueDate,
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
  },
  handler: async (ctx, { id, title, description, dueDate, projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    const patch: {
      title?: string;
      description?: string;
      dueDate?: string;
      projectId?: Id<"projects">;
    } = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (dueDate !== undefined) patch.dueDate = dueDate;
    if (projectId !== undefined) patch.projectId = projectId;
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
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return tasks.filter(
      (t) =>
        !t.deleted &&
        ((!t.completed && t.dueDate != null && t.dueDate <= today) ||
          (t.completed && t.completedAt != null && t.completedAt >= todayStartMs))
    );
  },
});

export const complete = mutation({
  args: { id: v.id("tasks") },
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
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const now = Date.now();
    const completionDate = todayInSP();
    await ctx.db.patch(id, { completed: true, completedAt: now });

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
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { completed: false, completedAt: undefined });

    const latest = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task", (q) => q.eq("taskId", id))
      .order("desc")
      .first();

    if (latest) {
      await reverseXpForTask(ctx, userId, latest.xpAwarded);
      await ctx.db.delete(latest._id);
    }
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

export const search = query({
  args: {
    text: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, { text, projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return tasks.filter((t) => {
      if (t.deleted) return false;
      if (projectId && t.projectId !== projectId) return false;
      if (text) {
        const lower = text.toLowerCase();
        return (
          t.title.toLowerCase().includes(lower) ||
          (t.description?.toLowerCase().includes(lower) ?? false)
        );
      }
      return true;
    });
  },
});
