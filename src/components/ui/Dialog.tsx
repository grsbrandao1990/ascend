"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DialogProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ title, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "dialog-title";

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    // Move focus to dialog on open
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md bg-surface-raised border border-border rounded-lg shadow-xl p-6 focus:outline-none"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-base font-semibold text-on-surface">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
