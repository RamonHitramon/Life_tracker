import { DayData, createEmptyDay } from "./types";

const STORAGE_PREFIX = "habits_";

function getKey(date: string): string {
  return STORAGE_PREFIX + date.replace(/-/g, "_");
}

export function loadDay(date: string): DayData {
  if (typeof window === "undefined") return createEmptyDay(date);
  try {
    const raw = localStorage.getItem(getKey(date));
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...createEmptyDay(date), ...parsed, date };
    }
  } catch {}
  return createEmptyDay(date);
}

export function saveDay(data: DayData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getKey(data.date), JSON.stringify(data));
  } catch {}
}

export function loadMonth(year: number, month: number): Map<string, DayData> {
  const map = new Map<string, DayData>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const date = `${year}-${mm}-${dd}`;
    map.set(date, loadDay(date));
  }
  return map;
}
