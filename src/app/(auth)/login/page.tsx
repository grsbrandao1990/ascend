import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Entrar — Ascend",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Ascend
          </h1>
          <p className="text-sm text-muted">
            Sua produtividade, com a progressão de um RPG.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
