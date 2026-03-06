export interface DayData {
  date: string; // YYYY-MM-DD
  pushups: [number, number, number, number];
  meditation: boolean;
  affirmations: boolean;
  food: number; // 0-100
  bedtime: string; // HH:MM
  waketime: string; // HH:MM
  mood: number; // 0-100
  work: number; // 0-100
}

export function createEmptyDay(date: string): DayData {
  return {
    date,
    pushups: [0, 0, 0, 0],
    meditation: false,
    affirmations: false,
    food: 50,
    bedtime: "",
    waketime: "",
    mood: 50,
    work: 50,
  };
}

/** True if day is still default (no user changes) */
export function isDayUnchanged(d: DayData): boolean {
  return (
    d.pushups[0] === 0 &&
    d.pushups[1] === 0 &&
    d.pushups[2] === 0 &&
    d.pushups[3] === 0 &&
    !d.meditation &&
    !d.affirmations &&
    d.food === 50 &&
    d.bedtime === "" &&
    d.waketime === "" &&
    d.mood === 50 &&
    d.work === 50
  );
}

export function calculateSleep(bedtime: string, waketime: string): number | null {
  if (!bedtime || !waketime) return null;
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = waketime.split(":").map(Number);
  const bedMinutes = bh * 60 + bm;
  let wakeMinutes = wh * 60 + wm;
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }
  return (wakeMinutes - bedMinutes) / 60;
}

export function getSleepColor(hours: number | null): string {
  if (hours === null) return "text-muted";
  if (hours < 6) return "text-red-400";
  if (hours < 7) return "text-amber-400";
  if (hours <= 9) return "text-emerald-400";
  return "text-blue-400";
}

export function getThumbColor(value: number): string {
  return getScoreColorHex(value);
}

/** 0% red, 50% yellow, 100% green (hex) */
export function getScoreColorHex(value: number): string {
  const t = Math.max(0, Math.min(100, value)) / 100;
  const stops: [number, number, number][] = [
    [239, 68, 68],   // 0   red
    [234, 179, 8],   // 50  yellow
    [34, 197, 94],   // 100 green
  ];
  let i0: number;
  let i1: number;
  let u: number;
  if (t <= 0.5) {
    i0 = 0;
    i1 = 1;
    u = t * 2;
  } else {
    i0 = 1;
    i1 = 2;
    u = (t - 0.5) * 2;
  }
  const r = Math.round(stops[i0][0] + (stops[i1][0] - stops[i0][0]) * u);
  const g = Math.round(stops[i0][1] + (stops[i1][1] - stops[i0][1]) * u);
  const b = Math.round(stops[i0][2] + (stops[i1][2] - stops[i0][2]) * u);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function getScoreColor(value: number): string {
  void value; // kept for API compatibility
  return "text-foreground"; // text color now via inline style or keep for fallback
}

export function getScoreBg(value: number): string {
  if (value <= 40) return "bg-red-400";
  if (value <= 70) return "bg-amber-400";
  return "bg-emerald-400";
}

export function getScoreTrack(value: number): string {
  void value; // kept for API compatibility
  return "bg-muted/40"; // pale track
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[d.getDay()]} ${d.getDate()}`;
}

export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    days.push(`${year}-${mm}-${dd}`);
  }
  return days;
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return dateStr === `${y}-${m}-${d}`;
}

export function getMonthName(month: number): string {
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return names[month];
}
