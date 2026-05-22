"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Search } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";

export default function SearchPage() {
  const [text, setText] = useState("");
  const [projectId, setProjectId] = useState<Id<"projects"> | undefined>();
  const projects = useQuery(api.projects.list);
  const results = useQuery(api.tasks.search, {
    text: text || undefined,
    projectId,
  });

  const hasFilter = text.length > 0 || projectId != null;

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface mb-6">Busca</h1>

      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buscar tarefas..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={projectId ?? ""}
          onChange={(e) =>
            setProjectId(
              e.target.value ? (e.target.value as Id<"projects">) : undefined
            )
          }
          className="px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="">Todos os projetos</option>
          {projects?.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {hasFilter ? (
        <TaskList
          tasks={results}
          emptyMessage="Nenhuma tarefa encontrada."
          emptyDescription="Tenta buscar com outros termos."
        />
      ) : (
        <p className="text-sm text-on-surface-variant text-center py-8">
          Digite algo para buscar tarefas.
        </p>
      )}
    </div>
  );
}
