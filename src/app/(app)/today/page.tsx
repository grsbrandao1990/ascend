"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { priorityRank } from "@/lib/nlpPriority";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { AssigneeFilter } from "@/components/tasks/AssigneeFilter";

function matchesAssignee(
  task: { userId: string; assigneeId?: string },
  userId: string
): boolean {
  return task.assigneeId === userId || (!task.assigneeId && task.userId === userId);
}

export default function TodayPage() {
  const tasks = useQuery(api.tasks.listToday);
  const members = useQuery(api.userProfiles.listMembers);
  const [showForm, setShowForm] = useState(false);
  const [doneExpanded, setDoneExpanded] = useState(true);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code !== "Space" || showForm) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      setShowForm(true);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showForm]);

  const filtered = assigneeFilter
    ? tasks?.filter((t) => matchesAssignee(t, assigneeFilter))
    : tasks;

  const pending = filtered
    ?.filter((t) => !(t.completedToday ?? t.completed))
    .slice()
    .sort((a, b) => {
      if (a.projectId !== b.projectId) {
        if (!a.projectId) return 1;
        if (!b.projectId) return -1;
        return a.projectId < b.projectId ? -1 : 1;
      }
      return priorityRank(a.priority) - priorityRank(b.priority);
    });
  const completedToday = filtered?.filter((t) => t.completedToday ?? t.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-on-surface">Hoje</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova tarefa
        </button>
      </div>

      <AssigneeFilter
        members={members ?? []}
        selected={assigneeFilter}
        onChange={setAssigneeFilter}
      />

      <TaskList
        tasks={pending}
        emptyMessage="Lista de hoje limpa."
        emptyDescription="Ou você é uma máquina, ou esqueceu de cadastrar tarefas."
      />

      {completedToday && completedToday.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setDoneExpanded((v) => !v)}
            className="flex items-center gap-1.5 px-3 mb-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-colors"
          >
            {doneExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            Concluídas hoje ({completedToday.length})
          </button>
          {doneExpanded && <TaskList tasks={completedToday} showProject />}
        </div>
      )}

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
