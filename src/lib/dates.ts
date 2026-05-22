import { toZonedTime, format } from "date-fns-tz";
import { getWeek, getYear } from "date-fns";

const TZ = "America/Sao_Paulo";

/** Retorna a data de hoje em São Paulo no formato YYYY-MM-DD */
export function todayString(): string {
  const zoned = toZonedTime(new Date(), TZ);
  return format(zoned, "yyyy-MM-dd", { timeZone: TZ });
}

/** Retorna a chave de semana ISO no formato YYYY-Www (ex.: 2026-W21) */
export function weekKey(date?: Date): string {
  const d = toZonedTime(date ?? new Date(), TZ);
  const year = getYear(d);
  const week = getWeek(d, { weekStartsOn: 1 });
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Retorna a chave de mês no formato YYYY-MM (ex.: 2026-05) */
export function monthKey(date?: Date): string {
  const d = toZonedTime(date ?? new Date(), TZ);
  return format(d, "yyyy-MM", { timeZone: TZ });
}

/** Converte um timestamp Unix (ms) para data YYYY-MM-DD no fuso de SP */
export function toSPDate(timestamp: number): string {
  const zoned = toZonedTime(new Date(timestamp), TZ);
  return format(zoned, "yyyy-MM-dd", { timeZone: TZ });
}

export function isOverdue(dueDate: string): boolean {
  return dueDate < todayString();
}

export function isToday(dueDate: string): boolean {
  return dueDate === todayString();
}
