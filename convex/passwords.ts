import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getAuthAccount = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("provider"), "password")
        )
      )
      .first();
  },
});

export const updatePasswordHash = internalMutation({
  args: { accountId: v.id("authAccounts"), newHash: v.string() },
  handler: async (ctx, { accountId, newHash }) => {
    await ctx.db.patch(accountId, { secret: newHash });
  },
});
