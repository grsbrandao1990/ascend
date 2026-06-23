"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { ProjectForm } from "./ProjectForm";
import { getUserColor } from "@/lib/userColor";

export function ProjectList() {
  const pathname = usePathname();
  const projects = useQuery(api.projects.listVisible);
  const members = useQuery(api.userProfiles.listMembers);
  const myProfile = useQuery(api.userProfiles.getMyProfile);
  const [showForm, setShowForm] = useState(false);

  const myUserId = myProfile?.userId as string | undefined;

  // Build display name map from profiles
  const nameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members ?? []) map.set(m.userId as string, m.displayName);
    return map;
  }, [members]);

  // Group projects by userId; own group first, others sorted by name
  const groups = useMemo(() => {
    if (!projects) return null;

    const map = new Map<string, typeof projects>();
    for (const p of projects) {
      const uid = p.userId as string;
      if (!map.has(uid)) map.set(uid, []);
      map.get(uid)!.push(p);
    }

    // Sort each group alphabetically
    for (const [, list] of map) {
      list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    }

    // Own group first
    const entries = [...map.entries()];
    entries.sort(([a], [b]) => {
      if (a === myUserId) return -1;
      if (b === myUserId) return 1;
      const nameA = nameMap.get(a) ?? a;
      const nameB = nameMap.get(b) ?? b;
      return nameA.localeCompare(nameB, "pt-BR");
    });

    return entries;
  }, [projects, myUserId, nameMap]);

  // Collapsed state — other users' groups start collapsed
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleGroup(uid: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  const isMultiUser = (groups?.length ?? 0) > 1;

  return (
    <div className="pt-4 mt-2 border-t border-border">
      <div className="flex items-center justify-between px-3 py-1">
        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
          Projetos
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="p-0.5 rounded hover:bg-surface-raised text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Novo projeto"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {projects === undefined && (
        <div className="px-3 py-2 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-md bg-surface-raised animate-pulse" />
          ))}
        </div>
      )}

      {projects?.length === 0 && (
        <p className="px-3 py-2 text-sm text-on-surface-variant italic">
          Nenhum projeto ainda.
        </p>
      )}

      {groups?.map(([uid, groupProjects]) => {
        const isOwn = uid === myUserId;
        const label = isOwn
          ? (myProfile?.displayName ?? "Meus projetos")
          : (nameMap.get(uid) ?? "Equipe");
        const color = getUserColor(uid);
        const isCollapsed = collapsed.has(uid);

        return (
          <div key={uid}>
            {isMultiUser && (
              <button
                onClick={() => toggleGroup(uid)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-surface-raised transition-colors group"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-on-surface-variant flex-1 text-left truncate">
                  {label}
                </span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/50 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-on-surface-variant/50 flex-shrink-0" />
                )}
              </button>
            )}

            {!isCollapsed &&
              groupProjects.map((project) => {
                const isActive =
                  pathname === `/projects/${project._id}` ||
                  pathname.startsWith(`/projects/${project._id}/`);
                return (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                      isMultiUser ? "pl-6" : ""
                    } ${
                      isActive
                        ? "bg-primary text-on-primary font-medium"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-raised"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              })}
          </div>
        );
      })}

      {showForm && <ProjectForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
