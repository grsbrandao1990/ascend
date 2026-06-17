import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return null;
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// All profiles — for assignee dropdowns and task display
export const listMembers = query({
  args: {},
  handler: async (ctx) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return [];
    return await ctx.db.query("userProfiles").collect();
  },
});

// All registered users with profile data — master only
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return [];

    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", authId))
      .first();
    if (!myProfile || myProfile.role !== "master") return [];

    const accounts = await ctx.db.query("authAccounts").collect();
    const profiles = await ctx.db.query("userProfiles").collect();
    const profileByUserId = new Map(profiles.map((p) => [p.userId as string, p]));

    return accounts
      .filter((a) => a.provider === "password")
      .map((a) => ({
        userId: a.userId as Id<"users">,
        email: a.providerAccountId,
        profile: profileByUserId.get(a.userId as string) ?? null,
      }));
  },
});

// Bootstrap: any authenticated user can become master if no master exists yet
export const bootstrapMaster = mutation({
  args: { displayName: v.string() },
  handler: async (ctx, { displayName }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) throw new Error("Not authenticated");

    const allProfiles = await ctx.db.query("userProfiles").collect();
    const hasMaster = allProfiles.some((p) => p.role === "master");
    if (hasMaster) throw new Error("Master já existe");

    const existing = allProfiles.find((p) => p.userId === authId);
    if (existing) {
      await ctx.db.patch(existing._id, { role: "master", displayName, managedUserIds: [] });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: authId,
        displayName,
        role: "master",
        managedUserIds: [],
      });
    }
  },
});

export const upsert = mutation({
  args: {
    targetUserId: v.optional(v.id("users")),
    displayName: v.string(),
    role: v.string(),
    managedUserIds: v.array(v.id("users")),
  },
  handler: async (ctx, { targetUserId, displayName, role, managedUserIds }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) throw new Error("Not authenticated");

    const targetId = targetUserId ?? authId;

    if (targetId !== authId) {
      const myProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", authId))
        .first();
      if (!myProfile || myProfile.role !== "master") {
        throw new Error("Not authorized");
      }
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", targetId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { displayName, role, managedUserIds });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: targetId,
        displayName,
        role,
        managedUserIds,
      });
    }
  },
});
