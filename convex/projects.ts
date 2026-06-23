import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

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

// Projects from all users the current user can see (respects hierarchy)
export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isMaster = myProfile?.role === "master";
    const managedUserIds: Id<"users">[] = myProfile?.managedUserIds ?? [];
    const visibleUserIds = [userId, ...managedUserIds];

    let projects: Doc<"projects">[];

    if (isMaster) {
      projects = await ctx.db.query("projects").collect();
    } else {
      const results: Doc<"projects">[] = [];
      for (const uid of visibleUserIds) {
        const rows = await ctx.db
          .query("projects")
          .withIndex("by_user_archived", (q) => q.eq("userId", uid).eq("archived", false))
          .collect();
        results.push(...rows);
      }
      projects = results;
    }

    return projects.filter((p) => !p.archived);
  },
});

// Projects for a specific user — only if the requester can see that user
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return [];

    if (authId !== targetId) {
      const myProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", authId))
        .first();
      const isMaster = myProfile?.role === "master";
      const manages = myProfile?.managedUserIds?.some((id) => id === targetId) ?? false;
      if (!isMaster && !manages) return [];
    }

    return ctx.db
      .query("projects")
      .withIndex("by_user_archived", (q) => q.eq("userId", targetId).eq("archived", false))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(id);
    if (!project) return null;
    if (project.userId === userId) return project;

    // Allow if the requester can see the project owner
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const isMaster = myProfile?.role === "master";
    const manages = myProfile?.managedUserIds?.some((id) => id === project.userId) ?? false;
    if (isMaster || manages) return project;
    return null;
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
