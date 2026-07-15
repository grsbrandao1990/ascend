"use client";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import Image from "next/image";
import { XpBar } from "@/components/game/XpBar";
import { LevelBadge } from "@/components/game/LevelBadge";
import { WeeklyChart } from "@/components/game/WeeklyChart";
import { getBadgeForLevel } from "@/lib/levelBadge";
import { PieChart } from "@/components/game/PieChart";
import { getUserColor } from "@/lib/userColor";

interface GoalCardProps {
  label: string;
  count: number;
  target: number;
}

function GoalCard({ label, count, target }: GoalCardProps) {
  const pct = Math.min(100, Math.round((count / target) * 100));
  const done = count >= target;

  return (
    <div className="bg-surface rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-on-surface-variant">{label}</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            done ? "text-accent" : "text-on-surface-variant"
          }`}
          style={done ? { background: "rgba(45,212,191,0.12)" } : {}}
        >
          {done ? "Concluída" : `${count}/${target}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{
            width: `${pct}%`,
            boxShadow: done ? "0 0 6px 1px rgba(45,212,191,0.5)" : undefined,
          }}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl p-4 flex flex-col gap-1">
      <span className="text-2xl font-bold text-on-surface tabular-nums">{value}</span>
      <span className="text-xs text-on-surface-variant">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const myProfile = useQuery(api.userProfiles.getMyProfile);
  const members = useQuery(api.userProfiles.listMembers);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Members the current user can see (master sees all, specialist sees managed + self)
  const visibleMembers = useMemo(() => {
    if (!members || !myProfile) return [];
    if (myProfile.role === "master") return members;
    const allowed = new Set<string>([
      myProfile.userId as string,
      ...(myProfile.managedUserIds?.map((id) => id as string) ?? []),
    ]);
    return members.filter((m) => allowed.has(m.userId as string));
  }, [members, myProfile]);

  const myUserId = myProfile?.userId as string | undefined;
  const effectiveUserId = selectedUserId ?? myUserId ?? null;

  const targetId =
    effectiveUserId && effectiveUserId !== myUserId
      ? (effectiveUserId as Id<"users">)
      : undefined;

  const viewedMember = visibleMembers.find(
    (m) => (m.userId as string) === effectiveUserId
  );

  const stats = useQuery(api.stats.get, { targetUserId: targetId });
  const weekly = useQuery(api.stats.weeklyBreakdown, { targetUserId: targetId });
  const breakdown = useQuery(api.stats.projectBreakdown, { targetUserId: targetId });

  const isMultiUser = visibleMembers.length > 1;

  if (stats === undefined) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-on-surface mb-6">Perfil</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-surface rounded-xl" />
          <div className="h-32 bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  if (stats === null) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-on-surface mb-6">Perfil</h1>
        <p className="text-sm text-on-surface-variant">
          Conclua sua primeira tarefa para começar a ganhar XP.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-8">
      {/* Header + member selector */}
      <div>
        <h1 className="text-xl font-semibold text-on-surface mb-4">Perfil</h1>

        {isMultiUser && (
          <div className="flex flex-wrap gap-2">
            {visibleMembers.map((m) => {
              const uid = m.userId as string;
              const color = getUserColor(uid);
              const isSelected = uid === effectiveUserId;
              return (
                <button
                  key={uid}
                  onClick={() => setSelectedUserId(uid)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
                  style={
                    isSelected
                      ? {
                          borderColor: color,
                          backgroundColor: `${color}18`,
                          color: "var(--on-surface)",
                        }
                      : {
                          borderColor: "var(--border)",
                          color: "var(--on-surface-variant)",
                        }
                  }
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {m.displayName}
                </button>
              );
            })}
          </div>
        )}

        {isMultiUser && viewedMember && (
          <p className="mt-3 text-xs text-on-surface-variant">
            Visualizando:{" "}
            <span className="font-medium text-on-surface">{viewedMember.displayName}</span>
          </p>
        )}
      </div>

      {/* Level + XP */}
      {(() => {
        const badge = getBadgeForLevel(stats.level);
        return (
          <>
            <div className="bg-surface rounded-xl p-5 flex items-center gap-4">
              <LevelBadge level={stats.level} />
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm text-on-surface-variant">
                  Nível {stats.level}{" "}
                  <span className="text-on-surface font-medium">· {badge.name}</span>
                </p>
                <XpBar xpInLevel={stats.xpInLevel} xpNeeded={stats.xpNeeded} />
              </div>
              <Image
                src={badge.file}
                alt={badge.name}
                width={64}
                height={64}
                className="flex-shrink-0"
              />
            </div>

            <div className="bg-surface rounded-xl p-5 flex items-center gap-5">
              <Image
                src={badge.file}
                alt={badge.name}
                width={100}
                height={100}
                className="flex-shrink-0"
              />
              <div className="space-y-1">
                <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  Rank atual
                </p>
                <p className="text-lg font-bold text-on-surface">{badge.name}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {badge.description}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Níveis {badge.minLevel}–{badge.maxLevel}
                </p>
              </div>
            </div>
          </>
        );
      })()}

      {/* Goals */}
      <div>
        <h2 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-3">
          Metas
        </h2>
        <div className="space-y-3">
          <GoalCard
            label="Diária"
            count={stats.goals.daily.count}
            target={stats.goals.daily.target}
          />
          <GoalCard
            label="Semanal"
            count={stats.goals.weekly.count}
            target={stats.goals.weekly.target}
          />
          <GoalCard
            label="Mensal"
            count={stats.goals.monthly.count}
            target={stats.goals.monthly.target}
          />
        </div>
      </div>

      {/* Weekly performance chart */}
      {weekly && (
        <div>
          <h2 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">
            Performance — últimas 6 semanas
          </h2>
          <div className="bg-surface rounded-xl p-4">
            <WeeklyChart weeks={weekly.weeks} maxTotal={weekly.maxTotal} />
          </div>
        </div>
      )}

      {/* Project breakdown pie chart */}
      {breakdown && (
        <div>
          <h2 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">
            Por projeto — últimas 6 semanas
          </h2>
          <div className="bg-surface rounded-xl p-5">
            <PieChart slices={breakdown.slices} total={breakdown.total} />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-3">
          Estatísticas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total de XP" value={stats.totalXp} />
          <StatCard label="Tarefas concluídas" value={stats.tasksCompleted} />
          <StatCard label="Sequência atual" value={`${stats.currentStreak}d`} />
          <StatCard label="Recorde de sequência" value={`${stats.longestStreak}d`} />
        </div>
      </div>
    </div>
  );
}
