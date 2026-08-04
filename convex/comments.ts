import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

async function canAccessTask(
  db: QueryCtx["db"],
  authId: Id<"users">,
  taskId: Id<"tasks">
): Promise<boolean> {
  const task = await db.get(taskId);
  if (!task || task.deleted) return false;
  if (task.userId === authId || task.assigneeId === authId) return true;

  const myProfile = await db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", authId))
    .first();

  if (myProfile?.role === "master") return true;
  return myProfile?.managedUserIds?.some((id) => id === task.userId) ?? false;
}

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return [];

    const hasAccess = await canAccessTask(ctx.db, authId, taskId);
    if (!hasAccess) return [];

    return ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", taskId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    text: v.string(),
    parentCommentId: v.optional(v.id("taskComments")),
  },
  handler: async (ctx, { taskId, text, parentCommentId }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) throw new Error("Not authenticated");

    const hasAccess = await canAccessTask(ctx.db, authId, taskId);
    if (!hasAccess) throw new Error("Sem acesso");

    const commentId = await ctx.db.insert("taskComments", {
      taskId,
      userId: authId,
      text: text.trim(),
      parentCommentId,
      createdAt: Date.now(),
    });

    // Create notifications for @mentions
    const mentionRegex = /@\[([^:]+):[^\]]+\]/g;
    let match;
    const notified = new Set<string>();
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedId = match[1] as Id<"users">;
      if (mentionedId !== authId && !notified.has(mentionedId)) {
        notified.add(mentionedId);
        await ctx.db.insert("notifications", {
          userId: mentionedId,
          type: "mention" as const,
          taskId,
          commentId,
          fromUserId: authId,
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    return commentId;
  },
});

export const remove = mutation({
  args: { id: v.id("taskComments") },
  handler: async (ctx, { id }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(id);
    if (!comment) throw new Error("Not found");
    if (comment.userId !== authId) throw new Error("Sem permissão");

    await ctx.db.delete(id);
  },
});
