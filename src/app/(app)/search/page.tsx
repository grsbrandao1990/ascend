"use client";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Search, X } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { getUserColor } from "@/lib/userColor";

export default function SearchPage() {
  const [text, setText] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());

  const projects = useQuery(api.projects.listVisible);
  const myProfile = useQuery(api.userProfiles.getMyProfile);
  const members = useQuery(api.userProfiles.listMembers);

  const projectIds = selectedProjectIds.size > 0
    ? ([...selectedProjectIds] as Id<"projects">[])
    : undefined;

  const results = useQuery(api.tasks.search, {
    text: text || undefined,
    projectIds,
  });

  const hasFilter = text.length > 0 || selectedProjectIds.size > 0;

  const nameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members ?? []) map.set(m.userId as string, m.displayName);
    return map;
  }, [members]);

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    const myId = myProfile?.userId as string | undefined;
    return [...projects].sort((a, b) => {
      const aOwn = (a.userId as string) === myId ? 0 : 1;
      const bOwn = (b.userId as string) === myId ? 0 : 1;
      if (aOwn !== bOwn) return aOwn - bOwn;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [projects, myProfile]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface mb-6">Busca</h1>

      <div className="space-y-3 mb-6">
        {/* Text search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buscar tarefas..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>

        {/* Project pills */}
        {sortedProjects.length > 0 && (
          <div className="flex flex-wrap gap-2 items-start">
            {selectedProjectIds.size > 0 && (
              <button
                onClick={() => setSelectedProjectIds(new Set())}
                className="flex items-center gap-1 px-2.5 py-1.5 self-center rounded-lg text-xs text-on-surface-variant hover:text-on-surface border border-border hover:border-primary/50 transition-colors"
              >
                <X className="w-3 h-3" />
                Limpar
              </button>
            )}
            {sortedProjects.map((p) => {
              const ownerId = p.userId as string;
              const ownerColor = getUserColor(ownerId);
              const ownerName = nameMap.get(ownerId) ?? "—";
              const selected = selectedProjectIds.has(p._id);
              return (
                <button
                  key={p._id}
                  onClick={() => toggleProject(p._id)}
                  className="flex flex-col items-start px-3 pt-1.5 pb-2 rounded-lg border transition-all text-left"
                  style={
                    selected
                      ? {
                          borderColor: p.color,
                          backgroundColor: `${p.color}18`,
                        }
                      : {
                          borderColor: "var(--border)",
                        }
                  }
                >
                  {/* Owner line */}
                  <span
                    className="flex items-center gap-1 leading-none mb-0.5"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ownerColor }}
                    />
                    <span style={{ color: ownerColor }}>{ownerName}</span>
                  </span>
                  {/* Project name line */}
                  <span
                    className="text-xs font-medium leading-none"
                    style={{
                      color: selected ? "var(--on-surface)" : "var(--on-surface-variant)",
                    }}
                  >
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {hasFilter ? (
        <TaskList
          tasks={results}
          emptyMessage="Nenhuma tarefa encontrada."
          emptyDescription="Tenta buscar com outros termos."
        />
      ) : (
        <p className="text-sm text-on-surface-variant text-center py-8">
          Digite algo ou selecione um projeto para buscar.
        </p>
      )}
    </div>
  );
}
