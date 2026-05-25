export type Priority = "p1" | "p2" | "p3";

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  p1: { label: "Urgente", color: "#F2555A" },
  p2: { label: "Importante", color: "#F5A623" },
  p3: { label: "Resolver", color: "#5B9DF9" },
};

export const PRIORITY_ORDER: Record<Priority, number> = { p1: 0, p2: 1, p3: 2 };

export function priorityRank(p?: string | null): number {
  if (p === "p1") return 0;
  if (p === "p2") return 1;
  if (p === "p3") return 2;
  return 3;
}

const PRIORITY_PATTERN = /(?<!\S)(p[123])(?!\S)/i;

export interface NlpPriorityResult {
  cleanTitle: string;
  priority: Priority | null;
}

export function parsePriority(title: string): NlpPriorityResult {
  const match = title.match(PRIORITY_PATTERN);
  if (!match) return { cleanTitle: title, priority: null };
  const priority = match[1].toLowerCase() as Priority;
  const cleanTitle = title
    .replace(PRIORITY_PATTERN, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { cleanTitle, priority };
}
