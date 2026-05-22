"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";

interface ProjectHeaderProps {
  project: Doc<"projects"> | null | undefined;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const rename = useMutation(api.projects.rename);
  const archive = useMutation(api.projects.archive);
  const remove = useMutation(api.projects.remove);
  const router = useRouter();

  if (!project) {
    return <div className="h-8 w-48 bg-surface-raised animate-pulse rounded" />;
  }

  async function handleRename() {
    if (!name.trim() || name === project!.name) {
      setEditing(false);
      return;
    }
    await rename({ id: project!._id, name: name.trim() });
    setEditing(false);
  }

  async function handleArchive() {
    await archive({ id: project!._id });
    router.push("/today");
  }

  async function handleDelete() {
    await remove({ id: project!._id });
    router.push("/today");
  }

  return (
    <div className="flex items-center gap-3 relative">
      <span
        className="w-4 h-4 rounded-full flex-shrink-0"
        style={{ backgroundColor: project.color }}
      />

      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") {
              setName(project.name);
              setEditing(false);
            }
          }}
          className="text-xl font-semibold bg-transparent border-b border-primary text-on-surface focus:outline-none"
        />
      ) : (
        <h1
          className="text-xl font-semibold text-on-surface cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setEditing(true)}
        >
          {project.name}
        </h1>
      )}

      <div className="relative ml-auto">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded hover:bg-surface-raised text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Opções do projeto"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-8 z-20 w-44 bg-surface-raised border border-border rounded-lg shadow-xl py-1">
              <button
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-on-surface hover:bg-surface transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Renomear
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleArchive();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-on-surface hover:bg-surface transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
                Arquivar
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleDelete();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-surface transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir projeto
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
