"use client";
import { useEffect } from "react";

interface XpToastProps {
  xpAwarded: number;
  goalBonuses: Array<{ goalType: "daily" | "weekly" | "monthly"; xp: number }>;
  onDismiss: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  daily: "Meta diária",
  weekly: "Meta semanal",
  monthly: "Meta mensal",
};

export function XpToast({ xpAwarded, goalBonuses, onDismiss }: XpToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end pointer-events-none"
    >
      <div
        className="toast-enter flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
        style={{
          background: "rgba(45,212,191,0.12)",
          border: "1px solid rgba(45,212,191,0.35)",
          color: "#2DD4BF",
          boxShadow: "0 0 16px 2px rgba(45,212,191,0.2)",
        }}
      >
        +{xpAwarded} XP
      </div>
      {goalBonuses.map((b) => (
        <div
          key={b.goalType}
          className="toast-enter flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
          style={{
            background: "rgba(45,212,191,0.08)",
            border: "1px solid rgba(45,212,191,0.25)",
            color: "#2DD4BF",
          }}
        >
          🎯 {GOAL_LABELS[b.goalType]} +{b.xp} XP
        </div>
      ))}
    </div>
  );
}
