export const metadata = {
  title: "Hoje — Ascend",
};

export default function TodayPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">Hoje</h1>
      <p className="text-sm text-muted">
        Lista de hoje limpa. Ou você é uma máquina, ou esqueceu de cadastrar tarefas.
      </p>
    </div>
  );
}
