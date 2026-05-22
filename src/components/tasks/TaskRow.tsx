"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { isOverdue, isToday } from "@/lib/dates";

interface TaskRowProps {
  task: Doc<"tasks">;
  showProject?: boolean;
}

export function TaskRow({ task, showProject = true }: TaskRowProps) {
  const complete = useMutation(api.tasks.complete);
  const uncomplete = useMutation(api.tasks.uncomplete);
  const project = useQuery(
    api.projects.getById,
    showProject && task.projectId ? { id: task.projectId } : "skip"
  );

  const overdue =
    task.dueDate != null && !task.completed && isOverdue(task.dueDate);

  function handleToggle() {
    if (task.completed) {
      void uncomplete({ id: task._id });
    } else {
      void complete({ id: task._id });
    }
  }

  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-surface-raised group ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      <button
        onClick={handleToggle}
        className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed
            ? "bg-primary border-primary"
            : "border-border hover:border-primary"
        }`}
        aria-label={task.completed ? "Desmarcar tarefa" : "Concluir tarefa"}
      >
        {task.completed && (
          <svg
            className="w-2.5 h-2.5 text-on-primary"
            fill="none"
            viewBox="0 0 10 8"
          >
            <path
              d="M1 4l2.5 2.5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            task.completed
              ? "text-on-surface-variant line-through"
              : "text-on-surface"
          }`}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {showProject && project && (
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`text-xs ${
                overdue
                  ? "text-warning"
                  : task.completed
                    ? "text-on-surface-variant"
                    : isToday(task.dueDate)
                      ? "text-on-surface"
                      : "text-on-surface-variant"
              }`}
            >
              {task.dueDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
