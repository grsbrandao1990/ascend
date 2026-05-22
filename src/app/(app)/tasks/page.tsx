"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { todayString } from "@/lib/dates";

export default function TasksPage() {
  const tasks = useQuery(api.tasks.listAll);
  const [showForm, setShowForm] = useState(false);

  const today = todayString();

  const noDate = tasks?.filter((t) => !t.dueDate);
  const overdue = tasks?.filter((t) => t.dueDate && t.dueDate < today);
  const upcoming = tasks?.filter((t) => t.dueDate && t.dueDate >= today);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-on-surface">Todas as tarefas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova tarefa
        </button>
      </div>

      {overdue && overdue.length > 0 && (
        <section className="mb-8">
          <p className="text-xs font-medium text-warning uppercase tracking-wider mb-2 px-3">
            Vencidas ({overdue.length})
          </p>
          <TaskList tasks={overdue} />
        </section>
      )}

      <section className="mb-8">
        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
          Próximas{upcoming ? ` (${upcoming.length})` : ""}
        </p>
        <TaskList
          tasks={upcoming}
          emptyMessage="Nenhuma tarefa com data futura."
        />
      </section>

      {noDate && noDate.length > 0 && (
        <section className="mb-8">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
            Sem data ({noDate.length})
          </p>
          <TaskList tasks={noDate} />
        </section>
      )}

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
