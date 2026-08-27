"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Flag } from "lucide-react";
import { isOverdue, isToday } from "@/lib/dates";
import { PRIORITY_CONFIG } from "@/lib/nlpPriority";
import { getUserColor } from "@/lib/userColor";
import type { TodayTask } from "./TaskList";

interface KanbanCardProps {
  task: TodayTask;
  projectColor?: string;
  projectName?: string;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export function KanbanCard({ task, projectColor, projectName, onOpen, onDragStart }: KanbanCardProps) {
  const [dragging, setDragging] = useState(false);
  const assigneeProfile = useQuery(
    api.userProfiles.getById,
    task.assigneeId ? { userId: task.assigneeId } : "skip"
  );
  const overdue = task.dueDate != null && !task.completed && isOverdue(task.dueDate);

  return (
    <button
      draggable
      onDragStart={(e) => {
        setDragging(true);
        onDragStart(e);
      }}
      onDragEnd={() => setDragging(false)}
      onClick={onOpen}
      className={`w-full text-left p-2.5 rounded-md border border-border bg-background hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
      style={{ borderLeft: `3px solid ${projectColor ?? "var(--border)"}` }}
    >
      <div className="flex items-start gap-1.5">
        {task.priority && (
          <Flag
            className="w-3 h-3 flex-shrink-0 mt-0.5"
            style={{ color: PRIORITY_CONFIG[task.priority].color }}
          />
        )}
        <span className="text-sm text-on-surface leading-snug">{task.title}</span>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {projectName && (
          <span className="flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projectColor }} />
            {projectName}
          </span>
        )}

        {task.dueDate && (
          <span
            className={`text-xs ${
              overdue ? "text-warning" : isToday(task.dueDate) ? "text-on-surface" : "text-on-surface-variant"
            }`}
          >
            {task.dueDate}
          </span>
        )}

        {assigneeProfile && task.assigneeId && (
          <span
            className="ml-auto flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold flex-shrink-0"
            style={{ background: getUserColor(task.assigneeId), color: "#fff" }}
            title={assigneeProfile.displayName}
          >
            {assigneeProfile.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </button>
  );
}
