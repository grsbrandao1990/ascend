import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { todayInSP } from "./lib/dates";
import { Doc, Id } from "./_generated/dataModel";
import { awardXpForCompletion, reverseXpForTask } from "./gamification";
import { XP_PER_TASK } from "./gameConfig";
import { recurrenceValidator, occursOnDate } from "./recurrence";

const priorityValidator = v.optional(v.union(v.literal("p1"), v.literal("p2"), v.literal("p3")));

async function getVisibleTasks(
  ctx: { db: { query: Function } },
  userId: Id<"users">
): Promise<Doc<"tasks">[]> {
  const myProfile = await (ctx.db as any)
    .query("userProfiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  const isMaster = myProfile?.role === "master";
  const managedUserIds: Id<"users">[] = myProfile?.managedUserIds ?? [];
  const visibleUserIds = [userId, ...managedUserIds];

  if (isMaster) {
    return (ctx.db as any).query("tasks").collect();
  }

  const seen = new Set<string>();
  const tasks: Doc<"tasks">[] = [];

  // Tasks created by visible users
  for (const uid of visibleUserIds) {
    const rows: Doc<"tasks">[] = await (ctx.db as any)
      .query("tasks")
      .withIndex("by_user", (q: any) => q.eq("userId", uid))
      .collect();
    for (const t of rows) {
      if (!seen.has(t._id as string)) {
        seen.add(t._id as string);
        tasks.push(t);
      }
    }
  }

  // Tasks assigned to visible users (may be created outside visible set)
  for (const uid of visibleUserIds) {
    const rows: Doc<"tasks">[] = await (ctx.db as any)
      .query("tasks")
      .withIndex("by_assignee", (q: any) => q.eq("assigneeId", uid))
      .collect();
    for (const t of rows) {
      if (!seen.has(t._id as string)) {
        seen.add(t._id as string);
        tasks.push(t);
      }
    }
  }

  return tasks;
}

export const create = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.id("users")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: priorityValidator,
    recurrence: v.optional(recurrenceValidator),
  },
  handler: async (ctx, { projectId, assigneeId, title, description, dueDate, priority, recurrence }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("tasks", {
      userId,
      projectId,
      assigneeId,
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
    assigneeId: v.optional(v.id("users")),
    clearAssignee: v.optional(v.boolean()),
    priority: priorityValidator,
    clearPriority: v.optional(v.boolean()),
    recurrence: v.optional(recurrenceValidator),
    clearRecurrence: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, title, description, dueDate, projectId, assigneeId, clearAssignee, priority, clearPriority, recurrence, clearRecurrence }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = (await ctx.db.get(id)) as Doc<"tasks"> | null;
    if (!task || task.userId !== userId) throw new Error("Not found");
    const patch: Record<string, unknown> = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (dueDate !== undefined) patch.dueDate = dueDate;
    if (projectId !== undefined) patch.projectId = projectId;
    if (assigneeId !== undefined) patch.assigneeId = assigneeId;
    if (clearAssignee) patch.assigneeId = undefined;
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
      assigneeId: task.assigneeId,
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

    const allTasks = await getVisibleTasks(ctx, userId);

    const results: (Doc<"tasks"> & { completedToday: boolean })[] = [];

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
    const tasks = await getVisibleTasks(ctx, userId);
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
    if (!task) throw new Error("Not found");

    // Who gets the XP — assignee if set, otherwise creator
    const beneficiaryId = (task.assigneeId ?? task.userId) as Id<"users">;

    // Authorization: actor must be the beneficiary, manage them, or be master
    if (beneficiaryId !== userId) {
      const myProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      const isMaster = myProfile?.role === "master";
      const manages =
        myProfile?.managedUserIds?.some((id) => id === beneficiaryId) ?? false;
      if (!isMaster && !manages) throw new Error("Not authorized");
    }

    const completionDate = occurrenceDate ?? todayInSP();
    const now = Date.now();

    const existing = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task_date", (q) =>
        q.eq("taskId", id).eq("completionDate", completionDate)
      )
      .first();
    if (existing) {
      const stats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", beneficiaryId))
        .first();
      return {
        xpAwarded: 0,
        goalBonuses: [],
        leveledUp: false,
        newLevel: stats?.level ?? 1,
        totalXp: stats?.totalXp ?? 0,
      };
    }

    if (!task.recurrence) {
      await ctx.db.patch(id, { completed: true, completedAt: now });
    }

    // XP goes to the beneficiary (assignee ?? creator), not necessarily the actor
    const result = await awardXpForCompletion(ctx, beneficiaryId);

    await ctx.db.insert("taskCompletions", {
      taskId: id,
      userId: beneficiaryId,
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
    if (!task) throw new Error("Not found");

    if (!task.recurrence) {
      await ctx.db.patch(id, { completed: false, completedAt: undefined });
    }

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
      // Reverse XP from whoever originally received it
      await reverseXpForTask(ctx, completion.userId, completion.xpAwarded);
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
      const byTitle = await ctx.db
        .query("tasks")
        .withSearchIndex("search_title", (q) =>
          q.search("title", trimmed).eq("userId", userId)
        )
        .collect();
      const titleIds = new Set(byTitle.map((t) => t._id));
      const filtered = byTitle.filter((t) => !t.deleted);

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
