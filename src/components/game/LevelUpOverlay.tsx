"use client";
import { useEffect } from "react";

interface LevelUpOverlayProps {
  newLevel: number;
  onDismiss: () => void;
}

export function LevelUpOverlay({ newLevel, onDismiss }: LevelUpOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        className="flex flex-col items-center gap-4 p-10 rounded-2xl"
        style={{
          background: "rgba(45,212,191,0.08)",
          boxShadow: "0 0 60px 20px rgba(45,212,191,0.25)",
          border: "1px solid rgba(45,212,191,0.3)",
        }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold tabular-nums"
          style={{
            background: "rgba(45,212,191,0.15)",
            color: "#2DD4BF",
            boxShadow: "0 0 30px 8px rgba(45,212,191,0.3)",
          }}
        >
          {newLevel}
        </div>
        <p className="text-2xl font-semibold text-on-surface">Level Up!</p>
        <p className="text-sm text-on-surface-variant">
          Você alcançou o nível {newLevel}
        </p>
      </div>
    </div>
  );
}
