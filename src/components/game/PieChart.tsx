"use client";
import { useState } from "react";

interface Slice {
  projectId: string | null;
  name: string;
  color: string;
  count: number;
  pct: number;
}

interface PieChartProps {
  slices: Slice[];
  total: number;
}

const CX = 90;
const CY = 90;
const OUTER_R = 78;
const INNER_R = 48;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(startAngle: number, endAngle: number) {
  const s = polarToCartesian(CX, CY, OUTER_R, startAngle);
  const e = polarToCartesian(CX, CY, OUTER_R, endAngle);
  const si = polarToCartesian(CX, CY, INNER_R, endAngle);
  const ei = polarToCartesian(CX, CY, INNER_R, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s.x.toFixed(2)} ${s.y.toFixed(2)}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`,
    `L ${si.x.toFixed(2)} ${si.y.toFixed(2)}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${ei.x.toFixed(2)} ${ei.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export function PieChart({ slices, total }: PieChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Build segments with start/end angles
  const segments: Array<Slice & { startAngle: number; endAngle: number }> = [];
  let current = 0;
  for (const slice of slices) {
    const angle = (slice.count / total) * 360;
    segments.push({ ...slice, startAngle: current, endAngle: current + angle });
    current += angle;
  }

  const hoveredSlice = segments.find(
    (s) => (s.projectId ?? "none") === hovered
  );

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      {/* Donut */}
      <div className="relative flex-shrink-0 w-[180px] h-[180px] mx-auto sm:mx-0">
        <svg viewBox="0 0 180 180" width="180" height="180">
          {segments.map((seg) => {
            const key = seg.projectId ?? "none";
            const isHovered = hovered === key;
            return (
              <path
                key={key}
                d={slicePath(seg.startAngle, seg.endAngle)}
                fill={seg.color}
                opacity={hovered && !isHovered ? 0.35 : 1}
                style={{ transition: "opacity 0.15s" }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
          {/* Center label */}
          <text
            x={CX}
            y={CY - 6}
            textAnchor="middle"
            className="text-xs"
            style={{ fill: "var(--on-surface)", fontSize: "20px", fontWeight: 700 }}
          >
            {hoveredSlice ? hoveredSlice.count : total}
          </text>
          <text
            x={CX}
            y={CY + 12}
            textAnchor="middle"
            style={{ fill: "var(--on-surface-variant)", fontSize: "9px" }}
          >
            {hoveredSlice ? hoveredSlice.pct + "%" : "tarefas"}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {segments.map((seg) => {
          const key = seg.projectId ?? "none";
          const isHovered = hovered === key;
          return (
            <div
              key={key}
              className="flex items-center gap-2 cursor-default"
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: hovered && !isHovered ? 0.4 : 1, transition: "opacity 0.15s" }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-sm text-on-surface truncate flex-1">{seg.name}</span>
              <span className="text-xs text-on-surface-variant tabular-nums flex-shrink-0">
                {seg.count} · {seg.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
