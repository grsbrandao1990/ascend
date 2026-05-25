"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { priorityRank } from "@/lib/nlpPriority";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function TodayPage() {
  const tasks = useQuery(api.tasks.listToday);
  const [showForm, setShowForm] = useState(false);
  const [doneExpanded, setDoneExpanded] = useState(true);

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

  const pending = tasks
    ?.filter((t) => !(t.completedToday ?? t.completed))
    .slice()
    .sort((a, b) => {
      // Agrupar por projeto
      if (a.projectId !== b.projectId) {
        if (!a.projectId) return 1;
        if (!b.projectId) return -1;
        return a.projectId < b.projectId ? -1 : 1;
      }
      // Dentro do projeto, ordenar por prioridade
      return priorityRank(a.priority) - priorityRank(b.priority);
    });
  const completedToday = tasks?.filter((t) => t.completedToday ?? t.completed);

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
