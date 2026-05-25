"use client";
import { useEffect } from "react";

interface XpToastProps {
  xpAwarded: number;
  onDismiss: () => void;
}

export function XpToast({ xpAwarded, onDismiss }: XpToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-40 pointer-events-none"
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
    </div>
  );
}
