"use client";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { occursOnDate } from "@/lib/recurrence";
import { PRIORITY_CONFIG } from "@/lib/nlpPriority";
import { TaskForm } from "@/components/tasks/TaskForm";
import type { TodayTask } from "@/components/tasks/TaskList";

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const WEEKDAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = first.getDay();

  const cells: Array<{ date: string; isCurrentMonth: boolean }> = [];

  for (let i = startWeekday; i > 0; i--) {
    cells.push({ date: toDateStr(new Date(year, month - 1, 1 - i)), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toDateStr(new Date(year, month - 1, d)), isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: toDateStr(new Date(year, month, i)), isCurrentMonth: false });
  }

  return cells;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [editing, setEditing] = useState<TodayTask | null>(null);

  const tasks = useQuery(api.tasks.listForCalendar);
  const projects = useQuery(api.projects.listVisible);
  const todayStr = toDateStr(now);

  const projectColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects ?? []) map.set(p._id, p.color);
    return map;
  }, [projects]);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

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

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-xl font-semibold text-on-surface">Calendário</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-surface-raised text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-on-surface w-36 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-surface-raised text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-t border-l border-border flex-shrink-0">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-b border-r border-border text-center text-xs font-medium text-on-surface-variant py-2 bg-surface"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-l border-border flex-1 overflow-y-auto">
        {grid.map(({ date, isCurrentMonth }) => {
          const dayTasks = tasksByDate.get(date) ?? [];
          const dayNum = parseInt(date.split("-")[2]);
          const isToday = date === todayStr;
          const visible = dayTasks.slice(0, 3);
          const overflow = dayTasks.length - 3;

          return (
            <div
              key={date}
              className={`border-b border-r border-border p-1.5 ${
                isCurrentMonth ? "bg-background" : "bg-surface/30"
              }`}
              style={{ minHeight: "90px" }}
            >
              <div
                className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full leading-none ${
                  isToday
                    ? "bg-primary text-on-primary"
                    : isCurrentMonth
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
