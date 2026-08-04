export type RecurrenceRule = {
  type: "daily" | "weekly" | "monthly";
  weekdays?: number[];
  monthDay?: number;
  interval?: number;
  startDate?: string;
};

export function occursOnDate(rule: RecurrenceRule, dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00.000Z");
  const dayOfWeek = d.getUTCDay();
  const dayOfMonth = d.getUTCDate();
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;

  switch (rule.type) {
    case "daily":
      return true;
    case "weekly": {
      const dayMatch = (rule.weekdays ?? []).includes(dayOfWeek);
      if (!dayMatch) return false;
      const interval = rule.interval ?? 1;
      if (interval <= 1) return true;
      const start = rule.startDate ?? dateStr;
      const startD = new Date(start + "T12:00:00.000Z");
      const targetD = new Date(dateStr + "T12:00:00.000Z");
      const weekDiff = Math.round(
        (targetD.getTime() - startD.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      return weekDiff >= 0 && weekDiff % interval === 0;
    }
    case "monthly": {
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const target = Math.min(rule.monthDay ?? 1, lastDay);
      return dayOfMonth === target;
    }
  }
}
