"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function TodayPage() {
  const tasks = useQuery(api.tasks.listToday);
  const [showForm, setShowForm] = useState(false);

  const pending = tasks?.filter((t) => !t.completed);
  const completedToday = tasks?.filter((t) => t.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-on-surface">Hoje</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova tarefa
        </button>
      </div>

      <TaskList
        tasks={pending}
        emptyMessage="Lista de hoje limpa."
        emptyDescription="Ou você é uma máquina, ou esqueceu de cadastrar tarefas."
      />

      {completedToday && completedToday.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
            Concluídas hoje ({completedToday.length})
          </p>
          <TaskList tasks={completedToday} showProject />
        </div>
      )}

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
