"use client";
import { Doc } from "@convex/_generated/dataModel";
import { TaskRow } from "./TaskRow";
import { EmptyState } from "@/components/ui/EmptyState";

export type TodayTask = Doc<"tasks"> & { completedToday?: boolean };

interface TaskListProps {
  tasks: TodayTask[] | undefined;
  showProject?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function TaskList({
  tasks,
  showProject = true,
  emptyMessage = "Nenhuma tarefa.",
  emptyDescription,
}: TaskListProps) {
  if (tasks === undefined) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 rounded-md bg-surface-raised animate-pulse" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState message={emptyMessage} description={emptyDescription} />;
  }

  return (
    <div className="space-y-0.5">
      {tasks.map((task) => (
        <TaskRow key={task._id} task={task} showProject={showProject} />
      ))}
    </div>
  );
}
