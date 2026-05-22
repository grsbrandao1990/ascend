"use client";

interface LevelBadgeProps {
  level: number;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
      <span
        className="text-xs font-bold tabular-nums leading-none"
        style={{ color: "#08231F" }}
      >
        {level}
      </span>
    </div>
  );
}
