// São Paulo usa UTC-3 permanentemente (sem horário de verão desde 2019)
const SP_OFFSET_MS = -3 * 60 * 60 * 1000;

function nowInSP(): Date {
  return new Date(Date.now() + SP_OFFSET_MS);
}

export function todayInSP(): string {
  return nowInSP().toISOString().slice(0, 10);
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
