"use client";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { occursOnDate } from "@/lib/recurrence";
import { PRIORITY_CONFIG } from "@/lib/nlpPriority";
import { matchesAssignee } from "@/lib/taskFilters";
import { TaskForm } from "@/components/tasks/TaskForm";
import { AssigneeFilter } from "@/components/tasks/AssigneeFilter";
import type { TodayTask } from "@/components/tasks/TaskList";

type ViewMode = "day" | "week" | "month";

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const WEEKDAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const WEEKDAY_FULL = [
  "Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado",
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeekDate(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = first.getDay();

  const cells: Array<{ date: string; isCurrentPeriod: boolean }> = [];

  for (let i = startWeekday; i > 0; i--) {
    cells.push({ date: toDateStr(new Date(year, month - 1, 1 - i)), isCurrentPeriod: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toDateStr(new Date(year, month - 1, d)), isCurrentPeriod: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: toDateStr(new Date(year, month, i)), isCurrentPeriod: false });
  }

  return cells;
}

function buildWeekGrid(anchor: Date) {
  const start = startOfWeekDate(anchor);
  const cells: Array<{ date: string; isCurrentPeriod: boolean }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: toDateStr(d), isCurrentPeriod: true });
  }
  return cells;
}

function headerTitle(view: ViewMode, anchor: Date): string {
  if (view === "month") return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;
  if (view === "day") {
    return `${WEEKDAY_FULL[anchor.getDay()]}, ${anchor.getDate()} de ${MONTH_NAMES[anchor.getMonth()]} de ${anchor.getFullYear()}`;
  }
  const start = startOfWeekDate(anchor);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  return sameMonth
    ? `${start.getDate()} – ${end.getDate()} de ${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`
    : `${start.getDate()} de ${MONTH_NAMES[start.getMonth()]} – ${end.getDate()} de ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
}

export default function CalendarPage() {
  const now = new Date();
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState(now);
  const [editing, setEditing] = useState<TodayTask | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  const allTasks = useQuery(api.tasks.listForCalendar);
  const projects = useQuery(api.projects.listVisible);
  const members = useQuery(api.userProfiles.listMembers);
  const todayStr = toDateStr(now);

  const tasks = useMemo(() => {
    if (!allTasks) return allTasks;
    return assigneeFilter ? allTasks.filter((t) => matchesAssignee(t, assigneeFilter)) : allTasks;
  }, [allTasks, assigneeFilter]);

  const projectColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects ?? []) map.set(p._id, p.color);
    return map;
  }, [projects]);

  const grid = useMemo(() => {
    if (view === "month") return buildMonthGrid(anchor.getFullYear(), anchor.getMonth() + 1);
    if (view === "week") return buildWeekGrid(anchor);
    return [{ date: toDateStr(anchor), isCurrentPeriod: true }];
  }, [view, anchor]);

  const maxVisible = view === "day" ? Infinity : view === "week" ? 8 : 3;

  const tasksByDate = useMemo(() => {
    const map = new Map<string, NonNullable<typeof tasks>>();
    if (!tasks) return map;
    for (const cell of grid) {
      const dayTasks = tasks.filter((t) =>
        t.recurrence ? occursOnDate(t.recurrence, cell.date) : t.dueDate === cell.date
      );
      if (dayTasks.length > 0) map.set(cell.date, dayTasks);
    }
    return map;
  }, [tasks, grid]);

  function shift(delta: number) {
    setAnchor((prev) => {
      const next = new Date(prev);
      if (view === "day") next.setDate(next.getDate() + delta);
      else if (view === "week") next.setDate(next.getDate() + delta * 7);
      else next.setMonth(next.getMonth() + delta);
      return next;
    });
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-3 flex-wrap">
        <h1 className="text-xl font-semibold text-on-surface">Calendário</h1>

        <div className="flex items-center gap-3">
          <div className="flex rounded-md border border-border text-xs overflow-hidden">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`px-3 py-1.5 transition-colors ${
                  view === mode
                    ? "bg-primary text-on-primary font-medium"
                    : "text-on-surface-variant hover:text-on-surface"
                } ${mode !== "day" ? "border-l border-border" : ""}`}
              >
                {mode === "day" ? "Dia" : mode === "week" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => shift(-1)}
              className="p-1.5 rounded-md hover:bg-surface-raised text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAnchor(new Date())}
              className="px-2 py-1 rounded-md text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-raised transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => shift(1)}
              className="p-1.5 rounded-md hover:bg-surface-raised text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm font-medium text-on-surface mb-3 flex-shrink-0">
        {headerTitle(view, anchor)}
      </p>

      <AssigneeFilter members={members ?? []} selected={assigneeFilter} onChange={setAssigneeFilter} />

      {/* Weekday labels (day view has none) */}
      {view !== "day" && (
        <div
          className="grid border-t border-l border-border flex-shrink-0"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        >
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="border-b border-r border-border text-center text-xs font-medium text-on-surface-variant py-2 bg-surface"
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div
        className={`grid border-l border-border flex-1 overflow-y-auto ${view === "day" ? "border-t" : ""}`}
        style={{ gridTemplateColumns: view === "day" ? "1fr" : "repeat(7, minmax(0, 1fr))" }}
      >
        {grid.map(({ date, isCurrentPeriod }) => {
          const dayTasks = tasksByDate.get(date) ?? [];
          const dayNum = parseInt(date.split("-")[2]);
          const isToday = date === todayStr;
          const visible = maxVisible === Infinity ? dayTasks : dayTasks.slice(0, maxVisible);
          const overflow = dayTasks.length - visible.length;

          return (
            <div
              key={date}
              className={`border-b border-r border-border p-1.5 ${
                isCurrentPeriod ? "bg-background" : "bg-surface/30"
              }`}
              style={{ minHeight: view === "day" ? "120px" : "90px" }}
            >
              <div
                className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full leading-none ${
                  isToday
                    ? "bg-primary text-on-primary"
                    : isCurrentPeriod
                    ? "text-on-surface"
                    : "text-on-surface-variant/30"
                }`}
              >
                {dayNum}
              </div>

              <div className="space-y-0.5">
                {visible.map((task) => {
                  const color = task.projectId
                    ? projectColorMap.get(task.projectId)
                    : undefined;
                  return (
                    <button
                      key={task._id}
                      onClick={() =>
                        setEditing({ ...task, completedToday: task.completed } as TodayTask)
                      }
                      className={`w-full text-left text-[10px] leading-snug px-1 py-0.5 rounded flex items-center gap-1 hover:brightness-110 transition-all ${
                        task.completed ? "opacity-40" : ""
                      }`}
                      style={{
                        backgroundColor: color ? `${color}20` : "var(--surface-raised)",
                        borderLeft: `2px solid ${color ?? "var(--border)"}`,
                      }}
                    >
                      {task.priority && (
                        <Flag
                          className="w-2 h-2 flex-shrink-0"
                          style={{ color: PRIORITY_CONFIG[task.priority].color }}
                        />
                      )}
                      <span
                        className={`truncate text-on-surface ${task.completed ? "line-through" : ""}`}
                      >
                        {task.title}
                      </span>
                    </button>
                  );
                })}

                {overflow > 0 && (
                  <p className="text-[10px] text-on-surface-variant px-1">
                    +{overflow} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && <TaskForm task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
