"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Flag } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { parseNlpDate } from "@/lib/nlpDate";
import { parsePriority, PRIORITY_CONFIG, type Priority } from "@/lib/nlpPriority";
import { STATUS_CONFIG, STATUSES, taskColumn, type TaskStatus } from "@/lib/taskStatus";
import { useGamification } from "@/contexts/GamificationContext";
import type { TodayTask } from "./TaskList";
import { TaskComments } from "./TaskComments";

interface TaskFormProps {
  task?: TodayTask;
  projectId?: Id<"projects">;
  onClose: () => void;
}

type RecurrenceType = "daily" | "weekly" | "monthly";

const WEEKDAYS = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
];

const PRIORITIES: Priority[] = ["p1", "p2", "p3"];

export function TaskForm({ task, projectId, onClose }: TaskFormProps) {
  const isEditing = task != null;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority | null>(task?.priority ?? null);
  const [assigneeId, setAssigneeId] = useState<Id<"users"> | undefined>(
    task?.assigneeId ?? undefined
  );
  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | undefined
  >(task?.projectId ?? projectId);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Estágio — muda na hora (fora do submit do form), igual ao drag-and-drop do Kanban
  const [stage, setStage] = useState<TaskStatus>(task ? taskColumn(task) : "todo");
  const [stageLoading, setStageLoading] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  // Recorrência
  const [recurring, setRecurring] = useState(task?.recurrence != null);
  const [recType, setRecType] = useState<RecurrenceType>(
    task?.recurrence?.type ?? "daily"
  );
  const [weekdays, setWeekdays] = useState<number[]>(
    task?.recurrence?.weekdays ?? []
  );
  const [monthDay, setMonthDay] = useState<number>(
    task?.recurrence?.monthDay ?? 1
  );
  const [weekInterval, setWeekInterval] = useState<number>(
    task?.recurrence?.interval ?? 1
  );

  const create = useMutation(api.tasks.create);
  const update = useMutation(api.tasks.update);
  const setTaskStatus = useMutation(api.tasks.setStatus);
  const { handleTaskCompleted } = useGamification();
  const ownProjects = useQuery(api.projects.list);
  const assigneeProjects = useQuery(
    api.projects.listByUser,
    assigneeId ? { userId: assigneeId } : "skip"
  );
  const projects = assigneeId ? (assigneeProjects ?? []) : (ownProjects ?? []);
  const members = useQuery(api.userProfiles.listMembers);

  function handleAssigneeChange(newId: Id<"users"> | undefined) {
    setAssigneeId(newId);
    setSelectedProjectId(undefined);
  }

  async function handleStageChange(next: TaskStatus) {
    if (!task || next === stage) return;
    const previous = stage;
    setStage(next);
    setStageLoading(true);
    setStageError(null);
    try {
      const result = await setTaskStatus({ id: task._id, status: next });
      if (result) handleTaskCompleted(result);
    } catch {
      setStage(previous);
      setStageError("Não consegui mudar o estágio. Tenta de novo.");
    } finally {
      setStageLoading(false);
    }
  }

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function applyNlp(currentTitle: string, currentDate: string) {
    if (recurring) return;
    let working = currentTitle;

    const { cleanTitle: afterPriority, priority: detected } = parsePriority(working);
    if (detected && !priority) {
      setPriority(detected);
      working = afterPriority;
    }

    if (!currentDate) {
      const { cleanTitle, date } = parseNlpDate(working);
      if (date) {
        setTitle(cleanTitle);
        setDueDate(date);
        return;
      }
    }

    if (working !== currentTitle) setTitle(working);
  }

  function buildRecurrence() {
    if (!recurring) return undefined;
    if (recType === "daily") return { type: "daily" as const };
    if (recType === "weekly") {
      const interval = weekInterval > 1 ? weekInterval : undefined;
      const startDate = interval
        ? (task?.recurrence?.startDate ?? new Date().toISOString().slice(0, 10))
        : undefined;
      return { type: "weekly" as const, weekdays, interval, startDate };
    }
    return { type: "monthly" as const, monthDay };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    let finalTitle = title.trim();
    let finalDate = dueDate;
    let finalPriority = priority;

    if (!recurring) {
      const { cleanTitle: t2, priority: detected } = parsePriority(finalTitle);
      if (detected && !finalPriority) {
        finalPriority = detected;
        finalTitle = t2;
      }
      if (!finalDate) {
        const { cleanTitle, date } = parseNlpDate(finalTitle);
        if (date) {
          finalTitle = cleanTitle;
          finalDate = date;
        }
      }
    }

    setLoading(true);
    setSubmitError(null);
    const recurrence = buildRecurrence();
    try {
      if (isEditing) {
        await update({
          id: task._id,
          title: finalTitle,
          description: description.trim() || undefined,
          dueDate: recurrence ? undefined : finalDate || undefined,
          projectId: selectedProjectId,
          assigneeId: assigneeId ?? undefined,
          clearAssignee: assigneeId === undefined && task.assigneeId != null ? true : undefined,
          priority: finalPriority ?? undefined,
          clearPriority: finalPriority === null && task.priority != null ? true : undefined,
          recurrence,
          clearRecurrence: !recurring && task.recurrence != null ? true : undefined,
        });
      } else {
        await create({
          title: finalTitle,
          description: description.trim() || undefined,
          dueDate: recurrence ? undefined : finalDate || undefined,
          projectId: selectedProjectId,
          assigneeId: assigneeId ?? undefined,
          priority: finalPriority ?? undefined,
          recurrence,
        });
      }
      onClose();
    } catch {
      setSubmitError("Não consegui salvar. Tenta de novo em um instante.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onClose={onClose} title={isEditing ? "Editar tarefa" : "Nova tarefa"} size={isEditing ? "lg" : "md"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label htmlFor="task-title" className="block text-sm text-on-surface-variant mb-1">
            Título
          </label>
          <input
            id="task-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => applyNlp(title, dueDate)}
            placeholder="O que precisa ser feito? (ex.: hoje p1 FUP cliente)"
            className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm text-on-surface-variant mb-1.5">
            Prioridade
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => {
              const { label, color } = PRIORITY_CONFIG[p];
              const selected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(selected ? null : p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border"
                  style={
                    selected
                      ? { color, borderColor: color, backgroundColor: `${color}18` }
                      : { borderColor: "var(--border)", color: "var(--on-surface-variant)" }
                  }
                >
                  <Flag className="w-3 h-3" style={{ color: selected ? color : undefined }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Estágio — só em tarefas existentes e não recorrentes (não aparecem no Kanban) */}
        {isEditing && !task.recurrence && (
          <div>
            <label className="block text-sm text-on-surface-variant mb-1.5">
              Estágio
            </label>
            <div className="flex gap-2">
              {STATUSES.map((s) => {
                const { label, color } = STATUS_CONFIG[s];
                const selected = stage === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={stageLoading}
                    onClick={() => handleStageChange(s)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors border disabled:opacity-50"
                    style={
                      selected
                        ? { color, borderColor: color, backgroundColor: `${color}18` }
                        : { borderColor: "var(--border)", color: "var(--on-surface-variant)" }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {stageError && <p className="text-xs text-error mt-1">{stageError}</p>}
          </div>
        )}

        {/* Responsável — só aparece se há membros cadastrados */}
        {members && members.length > 0 && (
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">
              Responsável
            </label>
            <select
              value={assigneeId ?? ""}
              onChange={(e) =>
                handleAssigneeChange(
                  e.target.value ? (e.target.value as Id<"users">) : undefined
                )
              }
              className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">Sem responsável</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Descrição */}
        <div>
          <label htmlFor="task-description" className="block text-sm text-on-surface-variant mb-1">
            Descrição
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes opcionais..."
            rows={2}
            className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary resize-y min-h-[60px]"
          />
        </div>

        {/* Data ou Recorrência */}
        <div className="space-y-3">
          {/* Toggle recorrência */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setRecurring((r) => !r)}
              className={`w-8 h-4 rounded-full transition-colors ${
                recurring ? "bg-primary" : "bg-border"
              } relative flex-shrink-0`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  recurring ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-on-surface-variant">Repetir</span>
          </label>

          {recurring ? (
            <div className="space-y-3 pl-1">
              {/* Tipo de recorrência */}
              <select
                value={recType}
                onChange={(e) => setRecType(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>

              {recType === "weekly" && (
                <div className="space-y-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {WEEKDAYS.map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleWeekday(value)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          weekdays.includes(value)
                            ? "bg-primary text-on-primary"
                            : "bg-surface-raised text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-on-surface-variant">A cada</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={weekInterval}
                      onChange={(e) =>
                        setWeekInterval(Math.min(12, Math.max(1, Number(e.target.value))))
                      }
                      className="w-16 px-3 py-1.5 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary text-center"
                    />
                    <span className="text-sm text-on-surface-variant">
                      {weekInterval === 1 ? "semana" : "semanas"}
                    </span>
                  </div>
                </div>
              )}

              {recType === "monthly" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-on-surface-variant">Dia</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={monthDay}
                    onChange={(e) =>
                      setMonthDay(Math.min(31, Math.max(1, Number(e.target.value))))
                    }
                    className="w-20 px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <span className="text-sm text-on-surface-variant">de cada mês</span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-on-surface-variant mb-1">
                  Projeto
                </label>
                <select
                  value={selectedProjectId ?? ""}
                  onChange={(e) =>
                    setSelectedProjectId(
                      e.target.value
                        ? (e.target.value as Id<"projects">)
                        : undefined
                    )
                  }
                  className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">Sem projeto</option>
                  {projects?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Projeto quando recorrência ativa */}
          {recurring && (
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">
                Projeto
              </label>
              <select
                value={selectedProjectId ?? ""}
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value
                      ? (e.target.value as Id<"projects">)
                      : undefined
                  )
                }
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">Sem projeto</option>
                {projects?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {submitError && (
          <p className="text-xs text-error">{submitError}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              !title.trim() ||
              loading ||
              (recurring && recType === "weekly" && weekdays.length === 0)
            }
            className="px-4 py-2 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Salvando..." : isEditing ? "Salvar" : "Criar tarefa"}
          </button>
        </div>
      </form>

      {isEditing && task?._id && (
        <>
          <hr className="border-border my-5" />
          <TaskComments taskId={task._id} />
        </>
      )}
    </Dialog>
  );
}
