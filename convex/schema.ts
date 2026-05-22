import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { recurrenceValidator } from "./recurrence";

export default defineSchema({
  ...authTables,

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    archived: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_archived", ["userId", "archived"]),

  tasks: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    recurrence: v.optional(recurrenceValidator),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    deleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_completed", ["userId", "completed"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["userId"] }),

  taskCompletions: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    completedAt: v.number(),
    completionDate: v.string(),
    xpAwarded: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_task_date", ["taskId", "completionDate"])
    .index("by_user_date", ["userId", "completionDate"]),

  userStats: defineTable({
    userId: v.id("users"),
    totalXp: v.number(),
    level: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastCompletionDate: v.optional(v.string()),
    tasksCompleted: v.number(),
  }).index("by_user", ["userId"]),

  goalAwards: defineTable({
    userId: v.id("users"),
    goalType: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    periodKey: v.string(),
    xpAwarded: v.number(),
    awardedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_goal_period", ["userId", "goalType", "periodKey"]),
});
