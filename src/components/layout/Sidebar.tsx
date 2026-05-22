"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, List, Search, User, Settings } from "lucide-react";
import { ProjectList } from "@/components/projects/ProjectList";

const navItems = [
  { href: "/today", icon: CalendarDays, label: "Hoje" },
  { href: "/tasks", icon: List, label: "Todas" },
  { href: "/search", icon: Search, label: "Busca" },
  { href: "/profile", icon: User, label: "Perfil" },
  { href: "/settings", icon: Settings, label: "Config." },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 border-r border-border bg-surface flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-sm font-bold tracking-widest text-on-surface">
          ASCEND
        </span>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-primary text-on-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-raised"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        <ProjectList />
      </nav>
    </aside>
  );
}
