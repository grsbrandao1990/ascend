export type TaskStatus = "todo" | "doing" | "done";

// Raw hex (not CSS vars) so callers can append an alpha suffix, e.g. `${color}22`,
// the same trick nlpPriority.ts and AssigneeFilter use for tinted backgrounds.
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "A Fazer", color: "#A0A0B8" },
  doing: { label: "Fazendo", color: "#5B9DF9" },
  done: { label: "Concluído", color: "#4ADE80" },
};

export const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

/** Which Kanban column a task currently belongs to. `completed` always wins over the stored status. */
export function taskColumn(task: { completed: boolean; status?: string }): TaskStatus {
  if (task.completed) return "done";
  return (task.status as TaskStatus | undefined) ?? "todo";
}
