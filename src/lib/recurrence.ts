export type RecurrenceRule = {
  type: "daily" | "weekly" | "monthly";
  weekdays?: number[];
  monthDay?: number;
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
    case "weekly":
      return (rule.weekdays ?? []).includes(dayOfWeek);
    case "monthly": {
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const target = Math.min(rule.monthDay ?? 1, lastDay);
      return dayOfMonth === target;
    }
  }
}
