"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

type UserRow = {
  userId: Id<"users">;
  email: string;
  profile: {
    _id: Id<"userProfiles">;
    displayName: string;
    role: string;
    managedUserIds: Id<"users">[];
  } | null;
};

function UserCard({
  user,
  allUsers,
  onSaved,
}: {
  user: UserRow;
  allUsers: UserRow[];
  onSaved: () => void;
}) {
  const upsert = useMutation(api.userProfiles.upsert);
  const [displayName, setDisplayName] = useState(user.profile?.displayName ?? "");
  const [role, setRole] = useState(user.profile?.role ?? "analyst");
  const [managedIds, setManagedIds] = useState<Id<"users">[]>(
    user.profile?.managedUserIds ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleManaged(uid: Id<"users">) {
    setManagedIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  }

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await upsert({
        targetUserId: user.userId,
        displayName: displayName.trim(),
        role,
        managedUserIds: managedIds,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const others = allUsers.filter((u) => u.userId !== user.userId);

  return (
    <div className="bg-surface rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
        </div>
        {user.profile && (
          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-surface-raised text-on-surface-variant">
            {user.profile.role}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-on-surface-variant mb-1">Nome de exibição</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ex: Marcella"
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-on-surface-variant mb-1">Papel</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="master">Master</option>
            <option value="specialist">Especialista</option>
            <option value="analyst">Analista</option>
          </select>
        </div>
      </div>

      {others.length > 0 && (
        <div>
          <label className="block text-xs text-on-surface-variant mb-2">
            Vê as tarefas de
          </label>
          <div className="flex flex-wrap gap-2">
            {others.map((u) => {
              const selected = managedIds.includes(u.userId);
              return (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => toggleManaged(u.userId)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {u.profile?.displayName ?? u.email}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="px-4 py-1.5 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function BootstrapMasterForm() {
  const bootstrap = useMutation(api.userProfiles.bootstrapMaster);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await bootstrap({ displayName: name.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao configurar master");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface mb-6">Equipe</h1>
      <div className="bg-surface rounded-xl p-5 max-w-sm space-y-4">
        <div>
          <p className="text-sm font-medium text-on-surface mb-1">Configurar conta master</p>
          <p className="text-xs text-on-surface-variant">
            Nenhum master existe ainda. Configure seu perfil para ter acesso total.
          </p>
        </div>
        <form onSubmit={handleBootstrap} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome de exibição"
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full px-4 py-2 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Configurando..." : "Tornar-me master"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const users = useQuery(api.userProfiles.listAll);
  const myProfile = useQuery(api.userProfiles.getMyProfile);
  const [, setRefresh] = useState(0);

  if (myProfile === undefined || users === undefined) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-on-surface mb-6">Equipe</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-surface rounded-xl" />
          <div className="h-40 bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return <BootstrapMasterForm />;
  }

  if (myProfile.role !== "master") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-on-surface mb-6">Equipe</h1>
        <p className="text-sm text-on-surface-variant">
          Acesso restrito ao master.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-on-surface">Equipe</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Configure nome, papel e visibilidade de cada membro.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          Nenhum usuário cadastrado ainda. Peça para os membros criarem conta e atualize esta página.
        </p>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <UserCard
              key={u.userId}
              user={u as UserRow}
              allUsers={users as UserRow[]}
              onSaved={() => setRefresh((n) => n + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
