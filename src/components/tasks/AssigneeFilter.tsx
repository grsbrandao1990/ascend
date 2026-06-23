"use client";
import { getUserColor } from "@/lib/userColor";

interface Member {
  userId: string;
  displayName: string;
}

interface AssigneeFilterProps {
  members: Member[];
  selected: string | null;
  onChange: (userId: string | null) => void;
}

export function AssigneeFilter({ members, selected, onChange }: AssigneeFilterProps) {
  if (members.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-4">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          selected === null
            ? "bg-primary text-on-primary"
            : "bg-surface-raised text-on-surface-variant hover:text-on-surface"
        }`}
      >
        Todos
      </button>
      {members.map((m) => {
        const color = getUserColor(m.userId);
        const isSelected = selected === m.userId;
        return (
          <button
            key={m.userId}
            onClick={() => onChange(isSelected ? null : m.userId)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border"
            style={
              isSelected
                ? { backgroundColor: `${color}22`, borderColor: color, color }
                : { borderColor: "var(--border)", color: "var(--on-surface-variant)" }
            }
          >
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold flex-shrink-0"
              style={{ backgroundColor: color, color: "#fff" }}
            >
              {m.displayName.charAt(0).toUpperCase()}
            </span>
            {m.displayName}
          </button>
        );
      })}
    </div>
  );
}
