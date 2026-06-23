"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { AssigneeFilter } from "@/components/tasks/AssigneeFilter";
import { todayString } from "@/lib/dates";
import { priorityRank } from "@/lib/nlpPriority";

type SortMode = "date" | "project";

function matchesAssignee(
  task: { userId: string; assigneeId?: string },
  userId: string
): boolean {
  return task.assigneeId === userId || (!task.assigneeId && task.userId === userId);
}

export default function TasksPage() {
  const tasks = useQuery(api.tasks.listAll);
  const projects = useQuery(api.projects.list);
  const members = useQuery(api.userProfiles.listMembers);
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<SortMode>("date");
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  const today = todayString();
  const projectMap = new Map(projects?.map((p) => [p._id, p]) ?? []);

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

  function byPriority<T extends { priority?: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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

      <AssigneeFilter
        members={members ?? []}
        selected={assigneeFilter}
        onChange={setAssigneeFilter}
      />

      {sort === "date" ? (
        <>
          {filtered && filtered.filter((t) => t.dueDate && t.dueDate < today).length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-medium text-warning uppercase tracking-wider mb-2 px-3">
                Vencidas ({filtered.filter((t) => t.dueDate && t.dueDate < today).length})
              </p>
              <TaskList tasks={byPriority(filtered.filter((t) => t.dueDate && t.dueDate < today))} />
            </section>
          )}

          <section className="mb-8">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
              {(() => {
                const count = filtered?.filter((t) => t.dueDate && t.dueDate >= today).length;
                return `Próximas${count != null ? ` (${count})` : ""}`;
              })()}
            </p>
            <TaskList
              tasks={filtered ? byPriority(filtered.filter((t) => t.dueDate && t.dueDate >= today)) : undefined}
              emptyMessage="Nenhuma tarefa com data futura."
            />
          </section>

          {filtered && filtered.filter((t) => !t.dueDate).length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
                Sem data ({filtered.filter((t) => !t.dueDate).length})
              </p>
              <TaskList tasks={byPriority(filtered.filter((t) => !t.dueDate))} />
            </section>
          )}
        </>
      ) : (
        <>
          {(() => {
            if (!filtered) return null;

            const withProject = filtered.filter((t) => t.projectId);
            const withoutProject = filtered.filter((t) => !t.projectId);

            const grouped = new Map<string, typeof filtered>();
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
                      <TaskList tasks={byPriority(projectTasks)} showProject={false} />
                    </section>
                  );
                })}

                {withoutProject.length > 0 && (
                  <section className="mb-8">
                    <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 px-3">
                      Sem projeto ({withoutProject.length})
                    </p>
                    <TaskList tasks={byPriority(withoutProject)} showProject={false} />
                  </section>
                )}

                {filtered.length === 0 && (
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
