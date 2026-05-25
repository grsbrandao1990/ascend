"use client";

interface ProjectSegment {
  projectId: string | null;
  projectName: string;
  color: string;
  count: number;
}

interface WeekData {
  label: string;
  weekStart: string;
  total: number;
  byProject: ProjectSegment[];
}

interface WeeklyChartProps {
  weeks: WeekData[];
  maxTotal: number;
}

const BAR_MAX_H = 120;

export function WeeklyChart({ weeks, maxTotal }: WeeklyChartProps) {
  return (
    <div className="flex items-end gap-2">
      {weeks.map((week) => {
        const barH =
          week.total > 0
            ? Math.max(4, Math.round((week.total / maxTotal) * BAR_MAX_H))
            : 0;

        return (
          <div
            key={week.weekStart}
            className="flex-1 flex flex-col items-center gap-1.5"
          >
            {/* Bar container */}
            <div
              className="relative group w-full flex flex-col justify-end"
              style={{ height: `${BAR_MAX_H}px` }}
            >
              {week.total === 0 ? (
                <div className="w-full h-0.5 rounded-full bg-border opacity-40" />
              ) : (
                <div
                  className="w-full rounded-t-sm overflow-hidden flex flex-col"
                  style={{ height: `${barH}px` }}
                >
                  {week.byProject.map((seg) => (
                    <div
                      key={seg.projectId ?? "none"}
                      className="w-full"
                      style={{
                        flex: seg.count,
                        backgroundColor: seg.color,
                        minHeight: "2px",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Tooltip */}
              {week.total > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                  <div className="bg-surface-raised border border-border rounded-lg p-2.5 shadow-lg text-xs whitespace-nowrap">
                    <p className="font-medium text-on-surface mb-1.5">
                      {week.total} tarefa{week.total !== 1 ? "s" : ""}
                    </p>
                    {week.byProject.map((seg) => (
                      <div
                        key={seg.projectId ?? "none"}
                        className="flex items-center gap-1.5 text-on-surface-variant"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        {seg.projectName}: {seg.count}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Week start label */}
            <span className="text-xs text-on-surface-variant leading-none">
              {week.label}
            </span>
            <span className="text-xs font-medium text-on-surface leading-none tabular-nums">
              {week.total > 0 ? week.total : "–"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
