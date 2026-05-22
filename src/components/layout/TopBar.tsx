"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { XpBar } from "@/components/game/XpBar";
import { LevelBadge } from "@/components/game/LevelBadge";

export function TopBar() {
  const stats = useQuery(api.stats.get);

  return (
    <header className="h-12 flex-shrink-0 border-b border-border bg-surface flex items-center px-4 gap-3">
      <div className="flex-1" />
      {stats != null && (
        <>
          <XpBar xpInLevel={stats.xpInLevel} xpNeeded={stats.xpNeeded} />
          <LevelBadge level={stats.level} />
        </>
      )}
    </header>
  );
}
