"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTaskOpen } from "@/contexts/TaskOpenContext";
import { TaskForm } from "@/components/tasks/TaskForm";
import type { TodayTask } from "@/components/tasks/TaskList";

export function TaskOpenModal() {
  const { pendingTaskId, clearTask } = useTaskOpen();
  const task = useQuery(
    api.tasks.get,
    pendingTaskId ? { id: pendingTaskId } : "skip"
  );

  if (!pendingTaskId || !task) return null;

  const todayTask: TodayTask = {
    ...task,
    completedToday: task.completed,
  };

  return <TaskForm task={todayTask} onClose={clearTask} />;
}
