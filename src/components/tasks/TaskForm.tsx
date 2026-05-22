"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { Dialog } from "@/components/ui/Dialog";

interface TaskFormProps {
  task?: Doc<"tasks">;
  projectId?: Id<"projects">;
  onClose: () => void;
}

export function TaskForm({ task, projectId, onClose }: TaskFormProps) {
  const isEditing = task != null;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | undefined
  >(task?.projectId ?? projectId);
  const [loading, setLoading] = useState(false);
  const create = useMutation(api.tasks.create);
  const update = useMutation(api.tasks.update);
  const projects = useQuery(api.projects.list);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (isEditing) {
        await update({
          id: task._id,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          projectId: selectedProjectId,
        });
      } else {
        await create({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          projectId: selectedProjectId,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onClose={onClose} title={isEditing ? "Editar tarefa" : "Nova tarefa"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-on-surface-variant mb-1">
            Título
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-on-surface-variant mb-1">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes opcionais..."
            rows={2}
            className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">
              Data
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-on-surface-variant mb-1">
              Projeto
            </label>
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) =>
                setSelectedProjectId(
                  e.target.value
                    ? (e.target.value as Id<"projects">)
                    : undefined
                )
              }
              className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">Sem projeto</option>
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="px-4 py-2 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Salvando..." : isEditing ? "Salvar" : "Criar tarefa"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
