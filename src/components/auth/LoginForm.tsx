"use client";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn("password", {
        email,
        password,
        flow: isSignUp ? "signUp" : "signIn",
      });
      router.push("/today");
    } catch {
      setError(
        isSignUp
          ? "Não consegui criar a conta. Tenta de novo."
          : "E-mail ou senha errados. Tenta de novo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-border bg-surface text-on-surface placeholder:text-on-surface-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-on-surface mb-1"
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputClass}
          placeholder="voce@exemplo.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-on-surface mb-1"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className={inputClass}
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="w-full py-2 px-4 rounded-md bg-primary text-on-primary text-sm font-medium disabled:opacity-50 hover:bg-primary-hover transition-colors cursor-pointer"
      >
        {isLoading ? "Aguarda..." : isSignUp ? "Criar conta" : "Entrar"}
      </button>

      <button
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
        }}
        className="w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        {isSignUp ? "Já tem conta? Entrar" : "Primeira vez? Criar conta"}
      </button>
    </form>
  );
}
