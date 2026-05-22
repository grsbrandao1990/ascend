// São Paulo usa UTC-3 permanentemente (sem horário de verão desde 2019)
const SP_OFFSET_MS = -3 * 60 * 60 * 1000;

function nowInSP(): Date {
  return new Date(Date.now() + SP_OFFSET_MS);
}

export function todayInSP(): string {
  return nowInSP().toISOString().slice(0, 10);
}

export function yesterdayInSP(): string {
  const d = nowInSP();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function weekStartInSP(): string {
  const d = nowInSP();
  const day = d.getUTCDay(); // 0=Sun
  const monday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - monday);
  return d.toISOString().slice(0, 10);
}

export function weekEndInSP(): string {
  const d = nowInSP();
  const day = d.getUTCDay();
  const daysToSunday = day === 0 ? 0 : 7 - day;
  d.setUTCDate(d.getUTCDate() + daysToSunday);
  return d.toISOString().slice(0, 10);
}

export function monthStartInSP(): string {
  const d = nowInSP();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function weekKeyInSP(): string {
  const d = nowInSP();
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  const weekNum = Math.ceil((dayOfYear + jan1.getUTCDay() + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function monthKeyInSP(): string {
  const d = nowInSP();
  const month = d.getUTCMonth() + 1;
  return `${d.getUTCFullYear()}-${String(month).padStart(2, "0")}`;
}
