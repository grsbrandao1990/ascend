"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Copy, Flag, Pencil, Repeat2, Trash2 } from "lucide-react";
import { isOverdue, isToday, todayString } from "@/lib/dates";
import { PRIORITY_CONFIG } from "@/lib/nlpPriority";
import { TaskForm } from "./TaskForm";
import { XpToast } from "@/components/game/XpToast";
import { CelebrationModal, type CelebrationVariant } from "@/components/game/CelebrationModal";
import type { TodayTask } from "./TaskList";

interface TaskRowProps {
  task: TodayTask;
  showProject?: boolean;
}


export function TaskRow({ task, showProject = true }: TaskRowProps) {
  const complete = useMutation(api.tasks.complete);
  const uncomplete = useMutation(api.tasks.uncomplete);
  const remove = useMutation(api.tasks.remove);
  const duplicate = useMutation(api.tasks.duplicate);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<
    Array<{ variant: CelebrationVariant; level?: number }>
  >([]);
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
          setXpToast(result.xpAwarded);
          const queue: Array<{ variant: CelebrationVariant; level?: number }> = [];
          for (const b of result.goalBonuses) {
            if (b.goalType === "daily") queue.push({ variant: "daily" });
            else if (b.goalType === "weekly") queue.push({ variant: "weekly" });
            else if (b.goalType === "monthly") queue.push({ variant: "monthly" });
          }
          if (result.leveledUp) queue.push({ variant: "levelup", level: result.newLevel });
          if (queue.length > 0) setCelebrationQueue(queue);
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
          <div className="flex items-center gap-1.5">
            {task.priority && (
              <Flag
                className="w-3 h-3 flex-shrink-0"
                style={{ color: PRIORITY_CONFIG[task.priority].color }}
              />
            )}
            <p
              className={`text-sm ${
                isCompleted
                  ? "text-on-surface-variant line-through"
                  : "text-on-surface"
              }`}
            >
              {task.title}
            </p>
          </div>

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

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all flex-shrink-0">
          {!isCompleted && (
            <button
              onClick={() => setEditing(true)}
              className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Editar tarefa"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => duplicate({ id: task._id })}
            className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Duplicar tarefa"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {confirmDelete ? (
            <button
              onClick={() => remove({ id: task._id })}
              className="p-1 rounded bg-error/10 text-error hover:bg-error/20 transition-colors text-xs font-medium px-2"
              aria-label="Confirmar exclusão"
            >
              Excluir?
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              onBlur={() => setConfirmDelete(false)}
              className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-error transition-colors"
              aria-label="Excluir tarefa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {toggleError && (
        <p className="px-3 py-1 text-xs text-error">{toggleError}</p>
      )}

      {editing && <TaskForm task={task} onClose={() => setEditing(false)} />}

      {xpToast != null && (
        <XpToast xpAwarded={xpToast} onDismiss={() => setXpToast(null)} />
      )}

      {celebrationQueue.length > 0 && (
        <CelebrationModal
          variant={celebrationQueue[0].variant}
          level={celebrationQueue[0].level}
          onDismiss={() => setCelebrationQueue((q) => q.slice(1))}
        />
      )}
    </>
  );
}
