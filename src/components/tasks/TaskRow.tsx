"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Pencil, Repeat2 } from "lucide-react";
import { isOverdue, isToday, todayString } from "@/lib/dates";
import { TaskForm } from "./TaskForm";
import { XpToast } from "@/components/game/XpToast";
import { LevelUpOverlay } from "@/components/game/LevelUpOverlay";
import type { TodayTask } from "./TaskList";

interface TaskRowProps {
  task: TodayTask;
  showProject?: boolean;
}

interface GamificationResult {
  xpAwarded: number;
  goalBonuses: Array<{ goalType: "daily" | "weekly" | "monthly"; xp: number }>;
  leveledUp: boolean;
  newLevel: number;
  totalXp: number;
}

export function TaskRow({ task, showProject = true }: TaskRowProps) {
  const complete = useMutation(api.tasks.complete);
  const uncomplete = useMutation(api.tasks.uncomplete);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<GamificationResult | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const project = useQuery(
    api.projects.getById,
    showProject && task.projectId ? { id: task.projectId } : "skip"
  );

  // Para tarefas recorrentes, o estado "concluída" vem do campo sintético completedToday
  const isCompleted = task.completedToday ?? task.completed;
  const overdue = task.dueDate != null && !isCompleted && isOverdue(task.dueDate);
  const occurrenceDate = task.recurrence ? todayString() : undefined;

  async function handleToggle() {
    setToggleError(null);
    try {
      if (isCompleted) {
        await uncomplete({ id: task._id, occurrenceDate });
      } else {
        const result = await complete({ id: task._id, occurrenceDate });
        if (result.xpAwarded > 0) {
          setToast(result);
          if (result.leveledUp) setShowLevelUp(true);
        }
      }
    } catch {
      setToggleError("Não consegui atualizar. Tenta de novo.");
    }
  }

  return (
    <>
      <div className="flex items-start gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-surface-raised group">
        <button
          onClick={handleToggle}
          className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
            isCompleted
              ? "bg-success border-success"
              : "border-border hover:border-primary"
          }`}
          aria-label={isCompleted ? "Desmarcar tarefa" : "Concluir tarefa"}
        >
          {isCompleted && (
            <svg
              className="w-2.5 h-2.5 text-background"
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
              isCompleted
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

            {task.recurrence && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Repeat2 className="w-3 h-3" />
                {task.recurrence.type === "daily"
                  ? "Diária"
                  : task.recurrence.type === "weekly"
                    ? "Semanal"
                    : "Mensal"}
              </span>
            )}

            {task.dueDate && (
              <span
                className={`text-xs ${
                  overdue
                    ? "text-warning"
                    : isCompleted
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

        {!isCompleted && (
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface text-on-surface-variant hover:text-on-surface transition-all flex-shrink-0"
            aria-label="Editar tarefa"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {toggleError && (
        <p className="px-3 py-1 text-xs text-error">{toggleError}</p>
      )}

      {editing && <TaskForm task={task} onClose={() => setEditing(false)} />}

      {toast && (
        <XpToast
          xpAwarded={toast.xpAwarded}
          goalBonuses={toast.goalBonuses}
          onDismiss={() => setToast(null)}
        />
      )}

      {showLevelUp && toast && (
        <LevelUpOverlay
          newLevel={toast.newLevel}
          onDismiss={() => setShowLevelUp(false)}
        />
      )}
    </>
  );
}
