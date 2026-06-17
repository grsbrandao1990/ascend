"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Scrypt } from "lucia";

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { currentPassword, newPassword }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Não autenticado");

    const account = await ctx.runQuery(internal.passwords.getAuthAccount, { userId });
    if (!account || !account.secret) throw new Error("Conta não encontrada");

    const scrypt = new Scrypt();
    const valid = await scrypt.verify(account.secret, currentPassword);
    if (!valid) throw new Error("Senha atual incorreta");

    if (newPassword.length < 8) throw new Error("A nova senha deve ter ao menos 8 caracteres");

    const newHash = await scrypt.hash(newPassword);
    await ctx.runMutation(internal.passwords.updatePasswordHash, {
      accountId: account._id,
      newHash,
    });
  },
});
