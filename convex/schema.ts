import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

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
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    deleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_completed", ["userId", "completed"]),

  taskCompletions: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    completedAt: v.number(),
    dateKey: v.string(),
  })
    .index("by_task", ["taskId"])
    .index("by_user_date", ["userId", "dateKey"]),
});
