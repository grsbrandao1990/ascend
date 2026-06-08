"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { XpToast } from "@/components/game/XpToast";
import { CelebrationModal, type CelebrationVariant } from "@/components/game/CelebrationModal";

interface TaskCompletedResult {
  xpAwarded: number;
  goalBonuses: Array<{ goalType: "daily" | "weekly" | "monthly" }>;
  leveledUp: boolean;
  newLevel: number;
}

interface GamificationContextValue {
  handleTaskCompleted: (result: TaskCompletedResult) => void;
}

const GamificationContext = createContext<GamificationContextValue>({
  handleTaskCompleted: () => {},
});

export function useGamification() {
  return useContext(GamificationContext);
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<
    Array<{ variant: CelebrationVariant; level?: number }>
  >([]);

  const handleTaskCompleted = useCallback((result: TaskCompletedResult) => {
    if (result.xpAwarded > 0) {
      setXpToast(result.xpAwarded);
    }
    const queue: Array<{ variant: CelebrationVariant; level?: number }> = [];
    for (const b of result.goalBonuses) {
      if (b.goalType === "daily") queue.push({ variant: "daily" });
      else if (b.goalType === "weekly") queue.push({ variant: "weekly" });
      else if (b.goalType === "monthly") queue.push({ variant: "monthly" });
    }
    if (result.leveledUp) queue.push({ variant: "levelup", level: result.newLevel });
    if (queue.length > 0) setCelebrationQueue((q) => [...q, ...queue]);
  }, []);

  return (
    <GamificationContext.Provider value={{ handleTaskCompleted }}>
      {children}
      {xpToast != null && (
        <XpToast xpAwarded={xpToast} onDismiss={() => setXpToast(null)} />
      )}
      {celebrationQueue.length > 0 && (
        <CelebrationModal
          variant={celebrationQueue[0].variant}
          level={celebrationQueue[0].level}
          onDismiss={() => setCelebrationQueue((q) => q.slice(1))}
        />
      )}
    </GamificationContext.Provider>
  );
}
