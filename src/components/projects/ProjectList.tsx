"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ProjectForm } from "./ProjectForm";

export function ProjectList() {
  const pathname = usePathname();
  const projects = useQuery(api.projects.list);
  const [showForm, setShowForm] = useState(false);

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
            <div
              key={i}
              className="h-8 rounded-md bg-surface-raised animate-pulse"
            />
          ))}
        </div>
      )}

      {projects?.length === 0 && (
        <p className="px-3 py-2 text-sm text-on-surface-variant italic">
          Nenhum projeto ainda.
        </p>
      )}

      {projects?.map((project) => {
        const isActive =
          pathname === `/projects/${project._id}` ||
          pathname.startsWith(`/projects/${project._id}/`);
        return (
          <Link
            key={project._id}
            href={`/projects/${project._id}`}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
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

      {showForm && <ProjectForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
