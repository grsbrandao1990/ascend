import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId).eq("archived", false)
      )
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

export const create = mutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, { name, color }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("projects", {
      userId,
      name,
      color,
      archived: false,
      createdAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: { id: v.id("projects"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { name });
  },
});

export const setColor = mutation({
  args: { id: v.id("projects"), color: v.string() },
  handler: async (ctx, { id, color }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { color });
  },
});

export const archive = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { archived: true });
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
