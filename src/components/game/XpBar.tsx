"use client";

interface XpBarProps {
  xpInLevel: number;
  xpNeeded: number;
}

export function XpBar({ xpInLevel, xpNeeded }: XpBarProps) {
  const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{
            width: `${pct}%`,
            boxShadow: "0 0 6px 1px rgba(45,212,191,0.5)",
          }}
        />
      </div>
      <span className="text-xs text-on-surface-variant tabular-nums whitespace-nowrap">
        {xpInLevel}/{xpNeeded} XP
      </span>
    </div>
  );
}
