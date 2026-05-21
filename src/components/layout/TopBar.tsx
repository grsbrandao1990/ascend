// HUD de XP é preenchido na Fase 2 (TASK-036). Esta barra reserva o espaço.
export function TopBar() {
  return (
    <header className="h-12 flex-shrink-0 border-b border-border bg-surface flex items-center px-4 gap-4">
      <div className="flex-1" />
      <div className="text-xs text-muted px-2 py-1 rounded border border-border">
        XP HUD — Fase 2
      </div>
    </header>
  );
}
