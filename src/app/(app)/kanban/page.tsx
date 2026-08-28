"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Plus } from "lucide-react";
import { matchesAssignee } from "@/lib/taskFilters";
import { STATUS_CONFIG, STATUSES, taskColumn, type TaskStatus } from "@/lib/taskStatus";
import { AssigneeFilter } from "@/components/tasks/AssigneeFilter";
import { KanbanCard } from "@/components/tasks/KanbanCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGamification } from "@/contexts/GamificationContext";
import type { TodayTask } from "@/components/tasks/TaskList";

type Status = TaskStatus;

const COLUMNS: Array<{ status: Status; label: string }> = STATUSES.map((status) => ({
  status,
  label: STATUS_CONFIG[status].label,
}));

// Keep the "Concluído" column from growing forever — only show recent history.
const DONE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const columnOf = taskColumn;

export default function KanbanPage() {
  const allTasks = useQuery(api.tasks.listForKanban);
  const projects = useQuery(api.projects.listVisible);
  const members = useQuery(api.userProfiles.listMembers);
  const setStatus = useMutation(api.tasks.setStatus);
  const { handleTaskCompleted } = useGamification();

  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<TodayTask | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const p of projects ?? []) map.set(p._id, { name: p.name, color: p.color });
    return map;
  }, [projects]);

  const tasks = useMemo(() => {
    if (!allTasks) return allTasks;
    const cutoff = Date.now() - DONE_WINDOW_MS;
    return allTasks
      .filter((t) => !assigneeFilter || matchesAssignee(t, assigneeFilter))
      .filter((t) => !t.completed || (t.completedAt ?? 0) >= cutoff);
  }, [allTasks, assigneeFilter]);

  const grouped = useMemo(() => {
    const map: Record<Status, TodayTask[]> = { todo: [], doing: [], waiting: [], done: [] };
    for (const t of tasks ?? []) map[columnOf(t)].push(t);
    return map;
  }, [tasks]);

  async function moveTask(taskId: string, from: Status, to: Status) {
    if (from === to) return;
    const result = await setStatus({ id: taskId as Id<"tasks">, status: to });
    if (result) handleTaskCompleted(result);
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-xl font-semibold text-on-surface">Kanban</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova tarefa
        </button>
      </div>

      <AssigneeFilter members={members ?? []} selected={assigneeFilter} onChange={setAssigneeFilter} />

      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {COLUMNS.map(({ status, label }) => {
          const columnTasks = grouped[status];
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(status);
              }}
              onDragLeave={() => setDragOverColumn((c) => (c === status ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverColumn(null);
                const taskId = e.dataTransfer.getData("text/plain");
                const from = e.dataTransfer.getData("application/x-status") as Status;
                if (taskId) moveTask(taskId, from, status);
              }}
              className={`flex flex-col min-h-0 rounded-lg border transition-colors ${
                dragOverColumn === status ? "border-primary bg-primary/5" : "border-border bg-surface/50"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0 border-b border-border">
                <span className="text-sm font-medium text-on-surface">{label}</span>
                <span className="text-xs text-on-surface-variant bg-surface-raised px-1.5 py-0.5 rounded-full">
                  {tasks === undefined ? "…" : columnTasks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {tasks === undefined ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-md bg-surface-raised animate-pulse" />
                  ))
                ) : columnTasks.length === 0 ? (
                  <EmptyState message="Sem tarefas aqui." />
                ) : (
                  columnTasks.map((task) => (
                    <KanbanCard
                      key={task._id}
                      task={task}
                      projectColor={task.projectId ? projectMap.get(task.projectId)?.color : undefined}
                      projectName={task.projectId ? projectMap.get(task.projectId)?.name : undefined}
                      onOpen={() => setEditing(task)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", task._id);
                        e.dataTransfer.setData("application/x-status", status);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && <TaskForm task={editing} onClose={() => setEditing(null)} />}
      {creating && <TaskForm onClose={() => setCreating(false)} />}
    </div>
  );
}
