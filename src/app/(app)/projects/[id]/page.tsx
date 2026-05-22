"use client";
import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Plus } from "lucide-react";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = id as Id<"projects">;
  const project = useQuery(api.projects.getById, { id: projectId });
  const tasks = useQuery(api.tasks.listByProject, { projectId });
  const [showForm, setShowForm] = useState(false);

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <p className="text-sm text-on-surface">Projeto não encontrado.</p>
        <p className="text-xs text-on-surface-variant">
          Pode ter sido arquivado ou excluído.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ProjectHeader project={project} />

      <div className="mt-6 flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
          Tarefas
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova tarefa
        </button>
      </div>

      <TaskList
        tasks={tasks}
        showProject={false}
        emptyMessage="Nenhuma tarefa nesse projeto."
        emptyDescription="Crie a primeira tarefa para começar."
      />

      {showForm && (
        <TaskForm projectId={projectId} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
