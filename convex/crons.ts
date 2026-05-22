import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 03:00 UTC = 00:00 America/São_Paulo (UTC-3, sem DST desde 2019)
crons.daily(
  "ensure-today-recurrences",
  { hourUTC: 3, minuteUTC: 0 },
  internal.recurrence.ensureTodayOccurrences
);

export default crons;
