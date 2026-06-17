"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";

function ChangePasswordForm() {
  const changePassword = useAction(api.passwordActions.changePassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next !== confirm) {
      setError("As senhas novas não coincidem");
      return;
    }
    if (next.length < 8) {
      setError("A nova senha deve ter ao menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao trocar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface rounded-xl p-5">
      <h2 className="text-sm font-medium text-on-surface mb-4">Trocar senha</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-on-surface-variant mb-1">Senha atual</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-on-surface-variant mb-1">Nova senha</label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-on-surface-variant mb-1">Confirmar nova senha</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
        {success && <p className="text-xs text-accent">Senha alterada com sucesso!</p>}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading || !current || !next || !confirm}
            className="px-4 py-2 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const { signOut } = useAuthActions();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface mb-6">
        Configurações
      </h1>

      <div className="max-w-sm space-y-4">
        <ChangePasswordForm />

        <div className="bg-surface rounded-xl p-5">
          <h2 className="text-sm font-medium text-on-surface mb-4">Conta</h2>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-4 py-2 text-sm bg-surface-raised text-on-surface rounded-md hover:bg-border transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {loading ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </div>
    </div>
  );
}
