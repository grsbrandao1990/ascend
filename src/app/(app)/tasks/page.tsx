"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { todayString } from "@/lib/dates";

type SortMode = "date" | "project";

export default function TasksPage() {
  const tasks = useQuery(api.tasks.listAll);
  const projects = useQuery(api.projects.list);
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<SortMode>("date");

  const today = todayString();

  const projectMap = new Map(projects?.map((p) => [p._id, p]) ?? []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-on-surface">Todas as tarefas</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border text-xs overflow-hidden">
            <button
              onClick={() => setSort("date")}
              className={`px-3 py-1.5 transition-colors ${
                sort === "date"
                  ? "bg-primary text-on-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Por data
            </button>
            <button
              onClick={() => setSort("project")}
              className={`px-3 py-1.5 transition-colors border-l border-border ${
                sort === "project"
                  ? "bg-primary text-on-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Por projeto
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-md text-sm hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova tarefa
          </button>
        </div>
      </div>

      {sort === "date" ? (
        <>
          {tasks && tasks.filter((t) => t.dueDate && t.dueDate < today).length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-medium text-warning uppercase tracking-wider mb-2 px-3">
                Vencidas ({tasks.filter((t) => t.dueDate && t.dueDate < today).length})
              </p>
              <TaskList tasks={tasks.filter((t) => t.dueDate && t.dueDate < today)} />
            </section>
          )}

          <section className="mb-8">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
              {(() => {
                const count = tasks?.filter((t) => t.dueDate && t.dueDate >= today).length;
                return `Próximas${count != null ? ` (${count})` : ""}`;
              })()}
            </p>
            <TaskList
              tasks={tasks?.filter((t) => t.dueDate && t.dueDate >= today)}
              emptyMessage="Nenhuma tarefa com data futura."
            />
          </section>

          {tasks && tasks.filter((t) => !t.dueDate).length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
                Sem data ({tasks.filter((t) => !t.dueDate).length})
              </p>
              <TaskList tasks={tasks.filter((t) => !t.dueDate)} />
            </section>
          )}
        </>
      ) : (
        <>
          {(() => {
            if (!tasks) return null;

            const withProject = tasks.filter((t) => t.projectId);
            const withoutProject = tasks.filter((t) => !t.projectId);

            const grouped = new Map<string, typeof tasks>();
            for (const t of withProject) {
              const key = t.projectId!;
              if (!grouped.has(key)) grouped.set(key, []);
              grouped.get(key)!.push(t);
            }

            return (
              <>
                {[...grouped.entries()].map(([projectId, projectTasks]) => {
                  const project = projectMap.get(projectId as never);
                  return (
                    <section key={projectId} className="mb-8">
                      <div className="flex items-center gap-2 px-3 mb-2">
                        {project && (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                        )}
                        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                          {project?.name ?? "Projeto desconhecido"} ({projectTasks.length})
                        </p>
                      </div>
                      <TaskList tasks={projectTasks} showProject={false} />
                    </section>
                  );
                })}

                {withoutProject.length > 0 && (
                  <section className="mb-8">
                    <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
                      Sem projeto ({withoutProject.length})
                    </p>
                    <TaskList tasks={withoutProject} showProject={false} />
                  </section>
                )}

                {tasks.length === 0 && (
                  <TaskList tasks={[]} emptyMessage="Nenhuma tarefa pendente." />
                )}
              </>
            );
          })()}
        </>
      )}

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
