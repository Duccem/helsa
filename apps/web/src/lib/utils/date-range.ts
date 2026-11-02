import { addDays } from "./zoned-time";

/*
 * Calendar ranges ("2026-11-01" … "2026-11-30", both inclusive) picked from a
 * preset or typed by hand. Pure day arithmetic: time zones are applied by the
 * caller when it turns days into instants.
 */

export const rangePresets = [
  "this_month",
  "last_month",
  "last_30",
  "this_quarter",
  "this_year",
  "custom",
] as const;
export type RangePreset = (typeof rangePresets)[number];

export type DateRange = {
  preset: RangePreset;
  from: string;
  to: string;
  days: number;
};

const MAX_DAYS = 731;
const DAY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function isDay(value: unknown): value is string {
  if (typeof value !== "string" || !DAY_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;
}

function monthStart(day: string, shift = 0) {
  const [year = 0, month = 1] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + shift, 1)).toISOString().slice(0, 10);
}

function build(preset: RangePreset, from: string, to: string): DateRange {
  return { preset, from, to, days: daysBetween(from, to) };
}

/** Resolves what the URL asked for; anything malformed falls back to this month. */
export function resolveRange(
  input: { preset?: string; from?: string; to?: string },
  today: string,
): DateRange {
  const preset = rangePresets.includes(input.preset as RangePreset)
    ? (input.preset as RangePreset)
    : input.from || input.to
      ? "custom"
      : "this_month";

  switch (preset) {
    case "last_month":
      return build(preset, monthStart(today, -1), addDays(monthStart(today), -1));
    case "last_30":
      return build(preset, addDays(today, -29), today);
    case "this_quarter": {
      const [year = 0, month = 1] = today.split("-").map(Number);
      const first = new Date(Date.UTC(year, Math.floor((month - 1) / 3) * 3, 1));
      return build(preset, first.toISOString().slice(0, 10), addDays(monthStart(first.toISOString(), 3), -1));
    }
    case "this_year":
      return build(preset, `${today.slice(0, 4)}-01-01`, `${today.slice(0, 4)}-12-31`);
    case "custom": {
      if (!isDay(input.from) || !isDay(input.to)) break;
      const [from, to] = input.from <= input.to ? [input.from, input.to] : [input.to, input.from];
      if (daysBetween(from, to) > MAX_DAYS) return build(preset, addDays(to, -(MAX_DAYS - 1)), to);
      return build(preset, from, to);
    }
  }

  return build("this_month", monthStart(today), addDays(monthStart(today, 1), -1));
}

/**
 * The range to compare against: the previous calendar month, quarter or year
 * for those presets, otherwise the same number of days right before.
 */
export function previousRange(range: DateRange): DateRange {
  const months = { this_month: 1, last_month: 1, this_quarter: 3 } as const;
  if (range.preset in months) {
    const shift = months[range.preset as keyof typeof months];
    return build("custom", monthStart(range.from, -shift), addDays(range.from, -1));
  }
  if (range.preset === "this_year") {
    const year = Number(range.from.slice(0, 4)) - 1;
    return build("custom", `${year}-01-01`, `${year}-12-31`);
  }
  const to = addDays(range.from, -1);
  return build("custom", addDays(to, -(range.days - 1)), to);
}
