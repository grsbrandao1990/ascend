"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { getUserColor } from "@/lib/userColor";
import { AtSign, UserCheck } from "lucide-react";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = useQuery(api.notifications.listMine);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  async function handleClick(id: Id<"notifications">, read: boolean) {
    if (!read) await markRead({ id });
    onClose();
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-raised border border-border rounded-lg shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-on-surface">Notificações</span>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications === undefined && (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-md bg-surface animate-pulse" />
            ))}
          </div>
        )}

        {notifications?.length === 0 && (
          <p className="text-sm text-on-surface-variant text-center py-8">
            Nenhuma notificação.
          </p>
        )}

        {notifications?.map((n) => {
          const color = getUserColor(n.fromUserId as string);
          const message =
            n.type === "mention"
              ? `mencionou você em`
              : `atribuiu uma tarefa a você`;

          return (
            <button
              key={n._id}
              onClick={() => handleClick(n._id, n.read)}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors text-left border-b border-border/50 last:border-0 ${
                n.read ? "opacity-50" : ""
              }`}
            >
              {/* Unread indicator */}
              {!n.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
              {n.read && <span className="w-1.5 flex-shrink-0" />}

              {/* Type icon */}
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                {n.type === "mention" ? (
                  <AtSign className="w-3.5 h-3.5" style={{ color }} />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" style={{ color }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface leading-snug">
                  <span className="font-medium">{n.fromName}</span>{" "}
                  {message}
                </p>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">
                  {n.taskTitle}
                </p>
              </div>

              <span className="text-[10px] text-on-surface-variant flex-shrink-0 mt-0.5">
                {relativeTime(n.createdAt)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
