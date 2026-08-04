"use client";
import { createContext, useContext, useState } from "react";
import { Id } from "@convex/_generated/dataModel";

interface TaskOpenContextValue {
  pendingTaskId: Id<"tasks"> | null;
  openTask: (id: Id<"tasks">) => void;
  clearTask: () => void;
}

const TaskOpenContext = createContext<TaskOpenContextValue>({
  pendingTaskId: null,
  openTask: () => {},
  clearTask: () => {},
});

export function TaskOpenProvider({ children }: { children: React.ReactNode }) {
  const [pendingTaskId, setPendingTaskId] = useState<Id<"tasks"> | null>(null);
  return (
    <TaskOpenContext.Provider
      value={{
        pendingTaskId,
        openTask: (id) => setPendingTaskId(id),
        clearTask: () => setPendingTaskId(null),
      }}
    >
      {children}
    </TaskOpenContext.Provider>
  );
}

export const useTaskOpen = () => useContext(TaskOpenContext);
