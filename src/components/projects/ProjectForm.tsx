"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Dialog } from "@/components/ui/Dialog";

const PROJECT_COLORS = [
  "#7C5CFC",
  "#2DD4BF",
  "#4ADE80",
  "#F5A623",
  "#F2555A",
  "#60A5FA",
];

interface ProjectFormProps {
  onClose: () => void;
}

export function ProjectForm({ onClose }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const create = useMutation(api.projects.create);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await create({ name: name.trim(), color });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onClose={onClose} title="Novo projeto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-on-surface-variant mb-1">
            Nome
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do projeto"
            className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-on-surface-variant mb-2">
            Cor
          </label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c
                    ? "ring-2 ring-offset-2 ring-offset-surface-raised ring-primary scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
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
            disabled={!name.trim() || loading}
            className="px-4 py-2 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Criando..." : "Criar projeto"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
