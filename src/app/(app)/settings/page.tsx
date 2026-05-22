"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

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
