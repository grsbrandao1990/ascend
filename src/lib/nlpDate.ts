import { toZonedTime, format } from "date-fns-tz";

const TZ = "America/Sao_Paulo";

function spDate(d: Date): string {
  return format(toZonedTime(d, TZ), "yyyy-MM-dd", { timeZone: TZ });
}

function todayInSP(): Date {
  return toZonedTime(new Date(), TZ);
}

// (?<!\S) = not preceded by non-whitespace = preceded by whitespace or start-of-string
// (?!\S)  = not followed by non-whitespace = followed by whitespace or end-of-string
// This pair is Unicode-safe unlike \b, which breaks on ã, ç, etc.
function w(pattern: string): RegExp {
  return new RegExp(`(?<!\\S)${pattern}(?!\\S)`, "i");
}

function nextWeekday(targetDay: number): string {
  const today = todayInSP();
  const currentDay = today.getUTCDay(); // toZonedTime stores SP local as UTC fields
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  const result = new Date(today);
  result.setUTCDate(today.getUTCDate() + diff);
  return spDate(result);
}

type NlpToken = { pattern: RegExp; resolve: () => string };

const TOKENS: NlpToken[] = [
  {
    pattern: w("depois\\s+de\\s+amanh[aã]"),
    resolve: () => {
      const d = todayInSP();
      d.setUTCDate(d.getUTCDate() + 2);
      return spDate(d);
    },
  },
  {
    pattern: w("amanh[aã]"),
    resolve: () => {
      const d = todayInSP();
      d.setUTCDate(d.getUTCDate() + 1);
      return spDate(d);
    },
  },
  { pattern: w("hoje"), resolve: () => spDate(todayInSP()) },
  { pattern: w("segunda(?:-feira)?"), resolve: () => nextWeekday(1) },
  { pattern: w("ter[cç]a(?:-feira)?"), resolve: () => nextWeekday(2) },
  { pattern: w("quarta(?:-feira)?"), resolve: () => nextWeekday(3) },
  { pattern: w("quinta(?:-feira)?"), resolve: () => nextWeekday(4) },
  { pattern: w("sexta(?:-feira)?"), resolve: () => nextWeekday(5) },
  { pattern: w("s[aá]bado"), resolve: () => nextWeekday(6) },
  { pattern: w("domingo"), resolve: () => nextWeekday(0) },
  {
    pattern: w("semana\\s+que\\s+vem|pr[oó]xima\\s+semana"),
    resolve: () => nextWeekday(1),
  },
];

export interface NlpDateResult {
  cleanTitle: string;
  date: string | null;
}

export function parseNlpDate(title: string): NlpDateResult {
  for (const token of TOKENS) {
    if (token.pattern.test(title)) {
      const date = token.resolve();
      const cleanTitle = title
        .replace(token.pattern, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      return { cleanTitle, date };
    }
  }
  return { cleanTitle: title, date: null };
}
