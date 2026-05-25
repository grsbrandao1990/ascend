"use client";
import { useEffect } from "react";

export type CelebrationVariant = "daily" | "weekly" | "monthly" | "levelup";

interface CelebrationModalProps {
  variant: CelebrationVariant;
  level?: number;
  onDismiss: () => void;
}

const DURATION = 4500;

const CONTENT: Record<
  CelebrationVariant,
  { icon: string; title: string; lines: string[] }
> = {
  daily: {
    icon: "🎯",
    title: "Parabéns!",
    lines: ["Meta Diária atingida!", "Mantenha o foco na produtividade!"],
  },
  weekly: {
    icon: "🏆",
    title: "Parabéns pela semana!",
    lines: ["Continue assim!"],
  },
  monthly: {
    icon: "🏆",
    title: "Parabéns pelo mês!",
    lines: ["Resultado incrível!", "Continue assim!"],
  },
  levelup: {
    icon: "⚡",
    title: "Lvl UP!",
    lines: [
      "Cada vez mais produtivo!",
      "Parabéns por subir de nível!",
      "Continue assim!",
    ],
  },
};

export function CelebrationModal({
  variant,
  level,
  onDismiss,
}: CelebrationModalProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, DURATION);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const { icon, title, lines } = CONTENT[variant];
  const isLevelUp = variant === "levelup";
  const glowRgb = isLevelUp ? "45,212,191" : "124,92,252";
  const accentColor = isLevelUp ? "#2DD4BF" : "#7C5CFC";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        background: "rgba(0,0,0,0.55)",
      }}
      onClick={onDismiss}
    >
      <div
        className="celebration-enter flex flex-col items-center gap-5 px-10 py-9 rounded-2xl max-w-sm w-full mx-6"
        style={{
          background: `rgba(${glowRgb},0.10)`,
          border: `1px solid rgba(${glowRgb},0.35)`,
          boxShadow: `0 0 80px 24px rgba(${glowRgb},0.18), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: `rgba(${glowRgb},0.15)`,
            boxShadow: `0 0 32px 10px rgba(${glowRgb},0.28)`,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-2xl font-bold text-on-surface">{title}</p>

          {isLevelUp && level != null && (
            <p
              className="text-5xl font-extrabold tabular-nums leading-none"
              style={{ color: accentColor }}
            >
              {level}
            </p>
          )}

          {lines.map((line, i) => (
            <p
              key={i}
              className={`text-sm ${
                i === 0 ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: accentColor,
              animation: `celebration-progress ${DURATION}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
