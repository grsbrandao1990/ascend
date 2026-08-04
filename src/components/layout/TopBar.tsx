"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Bell } from "lucide-react";
import { XpBar } from "@/components/game/XpBar";
import { LevelBadge } from "@/components/game/LevelBadge";
import { NotificationPanel } from "./NotificationPanel";

export function TopBar() {
  const stats = useQuery(api.stats.get, {});
  const unreadCount = useQuery(api.notifications.unreadCount);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-12 flex-shrink-0 border-b border-border bg-surface flex items-center px-4 gap-3">
      <div className="flex-1" />

      {stats != null && (
        <>
          <XpBar xpInLevel={stats.xpInLevel} xpNeeded={stats.xpNeeded} />
          <LevelBadge level={stats.level} />
        </>
      )}

      {/* Notification bell */}
      <div ref={bellRef} className="relative">
        <button
          onClick={() => setShowNotifications((v) => !v)}
          className="relative p-1.5 rounded-md hover:bg-surface-raised text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        )}
      </div>
    </header>
  );
}
