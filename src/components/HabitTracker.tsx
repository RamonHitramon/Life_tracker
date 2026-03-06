"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DayData,
  createEmptyDay,
  calculateSleep,
  getSleepColor,
  getScoreColor,
  getScoreBg,
  getScoreTrack,
  getThumbColor,
  formatDate,
  getDaysInMonth,
  isToday,
  getMonthName,
} from "@/lib/types";
import { loadDay, saveDay } from "@/lib/storage";

// ─── Save indicator ───
function SaveIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="save-indicator fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-400 border border-emerald-500/30">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      Saved
    </div>
  );
}

// ─── Toggle ───
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 min-h-[44px] cursor-pointer select-none group"
      aria-label={label}
    >
      <div
        className={`w-10 h-6 rounded-full transition-all duration-200 flex items-center ${
          checked
            ? "bg-accent justify-end"
            : "bg-border justify-start"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full mx-0.5 transition-all duration-200 ${
            checked ? "bg-white shadow-lg" : "bg-muted"
          }`}
        />
      </div>
      <span className="text-sm text-foreground/80">{label}</span>
    </button>
  );
}

// ─── Slider ───
function Slider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-foreground/60">{label}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div
          className="absolute my-auto h-2 rounded-full"
          style={{
            left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
            background: "linear-gradient(to right, #f87171, #fbbf24, #34d399)",
            opacity: 0.2,
          }}
        />
        <div
          className="absolute left-0 my-auto h-2 rounded-l-full transition-all"
          style={{
            width: `${value}%`, top: "50%", transform: "translateY(-50%)",
            background: `linear-gradient(to right, #f87171, #fbbf24 50%, #34d399)`,
            backgroundSize: `${10000 / Math.max(value, 1)}% 100%`,
            borderRadius: value >= 99 ? "9999px" : "9999px 0 0 9999px",
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 w-full h-6 bg-transparent cursor-pointer color-slider"
          style={{ background: "transparent", "--thumb-color": getThumbColor(value) } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

// ─── Pushup inputs ───
function PushupInputs({
  values,
  onChange,
}: {
  values: [number, number, number, number];
  onChange: (v: [number, number, number, number]) => void;
}) {
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-foreground/60">Push-ups</span>
        <span className="text-sm font-mono font-medium text-accent-light">
          {total > 0 ? `${total} total` : "—"}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {values.map((v, i) => (
          <div key={i} className="relative">
            <label className="text-[10px] text-muted absolute -top-0.5 left-1.5 bg-surface px-0.5 z-10">
              S{i + 1}
            </label>
            <input
              type="number"
              min={0}
              max={999}
              value={v || ""}
              placeholder="0"
              onChange={(e) => {
                const next = [...values] as [number, number, number, number];
                next[i] = Math.max(0, Math.min(999, Number(e.target.value) || 0));
                onChange(next);
              }}
              className="w-full h-11 bg-surface-light border border-border rounded-lg text-center font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors pt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sleep inputs ───
function SleepInputs({
  bedtime,
  waketime,
  prevBedtime,
  onBedtimeChange,
  onWaketimeChange,
}: {
  bedtime: string;
  waketime: string;
  prevBedtime: string;
  onBedtimeChange: (v: string) => void;
  onWaketimeChange: (v: string) => void;
}) {
  const hours = calculateSleep(prevBedtime, waketime);
  const color = getSleepColor(hours);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-foreground/60">Sleep</span>
        <span className={`text-sm font-mono font-medium ${color}`}>
          {hours !== null ? `${hours.toFixed(1)}h` : "—"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <label className="text-[10px] text-muted absolute -top-0.5 left-1.5 bg-surface px-0.5 z-10">
            Bed
          </label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => onBedtimeChange(e.target.value)}
            className="w-full h-11 bg-surface-light border border-border rounded-lg text-center font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors pt-1"
          />
        </div>
        <div className="relative">
          <label className="text-[10px] text-muted absolute -top-0.5 left-1.5 bg-surface px-0.5 z-10">
            Wake
          </label>
          <input
            type="time"
            value={waketime}
            onChange={(e) => onWaketimeChange(e.target.value)}
            className="w-full h-11 bg-surface-light border border-border rounded-lg text-center font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors pt-1"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Day card (mobile) ───
function DayCard({
  data,
  prevBedtime,
  isOpen,
  onToggle,
  onUpdate,
}: {
  data: DayData;
  prevBedtime: string;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (d: DayData) => void;
}) {
  const today = isToday(data.date);
  const sleep = calculateSleep(prevBedtime, data.waketime);
  const totalPushups = data.pushups.reduce((a, b) => a + b, 0);

  const dots = [
    totalPushups > 0,
    data.meditation,
    data.affirmations,
    data.food > 0,
    sleep !== null,
    data.mood > 0,
    data.work > 0,
  ];
  const filledCount = dots.filter(Boolean).length;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        today
          ? "today-glow border-accent/50 bg-surface"
          : "border-border/50 bg-surface"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 min-h-[52px] cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-sm font-medium ${
              today ? "text-accent-light" : "text-foreground"
            }`}
          >
            {formatDate(data.date)}
          </span>
          {today && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {dots.map((filled, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  filled ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted font-mono">{filledCount}/7</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-muted transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      <div className={`accordion-content ${isOpen ? "open" : ""}`}>
        <div className="accordion-inner">
          <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-3">
            <PushupInputs
              values={data.pushups}
              onChange={(pushups) => onUpdate({ ...data, pushups })}
            />

            <div className="flex gap-6">
              <Toggle
                checked={data.meditation}
                onChange={(meditation) => onUpdate({ ...data, meditation })}
                label="Meditation"
              />
              <Toggle
                checked={data.affirmations}
                onChange={(affirmations) => onUpdate({ ...data, affirmations })}
                label="Affirmations"
              />
            </div>

            <Slider
              value={data.food}
              onChange={(food) => onUpdate({ ...data, food })}
              label="Food"
            />

            <SleepInputs
              bedtime={data.bedtime}
              waketime={data.waketime}
              prevBedtime={prevBedtime}
              onBedtimeChange={(bedtime) => onUpdate({ ...data, bedtime })}
              onWaketimeChange={(waketime) => onUpdate({ ...data, waketime })}
            />

            <Slider
              value={data.mood}
              onChange={(mood) => onUpdate({ ...data, mood })}
              label="Mood"
            />

            <Slider
              value={data.work}
              onChange={(work) => onUpdate({ ...data, work })}
              label="Work"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Gradient slider (desktop) ───
function GradientSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative min-w-[120px] h-6 flex items-center">
      <div
        className="absolute my-auto h-2 rounded-full"
        style={{
          left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
          background: "linear-gradient(to right, #f87171, #fbbf24, #34d399)",
          opacity: 0.2,
        }}
      />
      <div
        className="absolute left-0 my-auto h-2 rounded-l-full transition-all"
        style={{
          width: `${value}%`, top: "50%", transform: "translateY(-50%)",
          background: `linear-gradient(to right, #f87171, #fbbf24 50%, #34d399)`,
          backgroundSize: `${10000 / Math.max(value, 1)}% 100%`,
          borderRadius: value >= 99 ? "9999px" : "9999px 0 0 9999px",
        }}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="relative z-10 w-full h-6 cursor-pointer color-slider"
        style={{ background: "transparent", "--thumb-color": getThumbColor(value) } as React.CSSProperties}
      />
    </div>
  );
}

// ─── Desktop table row ───
function DayRow({
  data,
  prevBedtime,
  onUpdate,
}: {
  data: DayData;
  prevBedtime: string;
  onUpdate: (d: DayData) => void;
}) {
  const today = isToday(data.date);
  const sleep = calculateSleep(prevBedtime, data.waketime);
  const sleepColor = getSleepColor(sleep);
  const totalPushups = data.pushups.reduce((a, b) => a + b, 0);

  return (
    <tr
      className={`border-b border-border/30 transition-colors ${
        today ? "bg-accent/5" : "hover:bg-surface-light/50"
      }`}
    >
      {/* Date */}
      <td className="sticky left-0 z-10 bg-surface px-3 py-2 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-sm ${
              today ? "text-accent-light font-semibold" : "text-foreground"
            }`}
          >
            {formatDate(data.date)}
          </span>
          {today && (
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          )}
        </div>
      </td>

      {/* Pushups */}
      {data.pushups.map((v, i) => (
        <td key={i} className="px-1 py-2">
          <input
            type="number"
            min={0}
            max={999}
            value={v || ""}
            placeholder="0"
            onChange={(e) => {
              const next = [...data.pushups] as [number, number, number, number];
              next[i] = Math.max(0, Math.min(999, Number(e.target.value) || 0));
              onUpdate({ ...data, pushups: next });
            }}
            className="w-14 h-9 bg-surface-light border border-border rounded text-center font-mono text-xs text-foreground focus:border-accent focus:outline-none transition-colors"
          />
        </td>
      ))}
      <td className="px-2 py-2 font-mono text-xs text-accent-light">
        {totalPushups || "—"}
      </td>

      {/* Meditation */}
      <td className="px-3 py-2 text-center">
        <button
          type="button"
          onClick={() => onUpdate({ ...data, meditation: !data.meditation })}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
            data.meditation
              ? "bg-accent border-accent text-white"
              : "border-border text-transparent hover:border-muted"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </button>
      </td>

      {/* Affirmations */}
      <td className="px-3 py-2 text-center">
        <button
          type="button"
          onClick={() => onUpdate({ ...data, affirmations: !data.affirmations })}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
            data.affirmations
              ? "bg-accent border-accent text-white"
              : "border-border text-transparent hover:border-muted"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </button>
      </td>

      {/* Sleep */}
      <td className="px-1 py-2">
        <input
          type="time"
          value={data.bedtime}
          onChange={(e) => onUpdate({ ...data, bedtime: e.target.value })}
          className="w-[72px] h-8 bg-surface-light border border-border rounded text-center font-mono text-[11px] text-foreground focus:border-accent focus:outline-none"
        />
      </td>
      <td className="px-1 py-2">
        <input
          type="time"
          value={data.waketime}
          onChange={(e) => onUpdate({ ...data, waketime: e.target.value })}
          className="w-[72px] h-8 bg-surface-light border border-border rounded text-center font-mono text-[11px] text-foreground focus:border-accent focus:outline-none"
        />
      </td>
      <td className={`px-2 py-2 font-mono text-xs ${sleepColor}`}>
        {sleep !== null ? `${sleep.toFixed(1)}h` : "—"}
      </td>

      {/* Food */}
      <td className="px-2 py-2">
        <GradientSlider value={data.food} onChange={(food) => onUpdate({ ...data, food })} />
      </td>

      {/* Mood */}
      <td className="px-2 py-2">
        <GradientSlider value={data.mood} onChange={(mood) => onUpdate({ ...data, mood })} />
      </td>

      {/* Work */}
      <td className="px-2 py-2">
        <GradientSlider value={data.work} onChange={(work) => onUpdate({ ...data, work })} />
      </td>
    </tr>
  );
}

// ─── Month summary ───
function MonthSummary({ days, prevMonthBedtime }: { days: DayData[]; prevMonthBedtime: string }) {
  const totalPushups = days.reduce(
    (sum, d) => sum + d.pushups.reduce((a, b) => a + b, 0),
    0
  );

  // Calculate streaks
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  let meditationStreak = 0;
  const sortedDays = [...days].sort((a, b) => b.date.localeCompare(a.date));
  for (const d of sortedDays) {
    if (d.date > todayStr) continue;
    if (d.meditation) meditationStreak++;
    else break;
  }

  let affirmationStreak = 0;
  for (const d of sortedDays) {
    if (d.date > todayStr) continue;
    if (d.affirmations) affirmationStreak++;
    else break;
  }

  const sleepDays: number[] = [];
  for (let i = 0; i < days.length; i++) {
    const prevBed = i === 0 ? prevMonthBedtime : days[i - 1].bedtime;
    const curWake = days[i].waketime;
    if (prevBed && curWake) {
      const h = calculateSleep(prevBed, curWake);
      if (h !== null) sleepDays.push(h);
    }
  }
  const avgSleep = sleepDays.length > 0
    ? sleepDays.reduce((a, b) => a + b, 0) / sleepDays.length
    : null;

  const activeDays = days.filter((d) => d.date <= todayStr);
  const avgMood = activeDays.length > 0
    ? activeDays.reduce((s, d) => s + d.mood, 0) / activeDays.length
    : 0;
  const avgFood = activeDays.length > 0
    ? activeDays.reduce((s, d) => s + d.food, 0) / activeDays.length
    : 0;
  const avgWork = activeDays.length > 0
    ? activeDays.reduce((s, d) => s + d.work, 0) / activeDays.length
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard label="Push-ups" value={String(totalPushups)} sub="total reps" />
      <StatCard
        label="Meditation"
        value={String(meditationStreak)}
        sub="day streak"
      />
      <StatCard
        label="Affirmations"
        value={String(affirmationStreak)}
        sub="day streak"
      />
      <StatCard
        label="Avg Sleep"
        value={avgSleep !== null ? `${avgSleep.toFixed(1)}h` : "—"}
        sub={avgSleep !== null ? "per night" : "no data"}
        color={getSleepColor(avgSleep)}
      />
      <BarCard label="Avg Mood" value={Math.round(avgMood)} />
      <BarCard label="Avg Food" value={Math.round(avgFood)} />
      <BarCard label="Avg Work" value={Math.round(avgWork)} />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div className="bg-surface border border-border/50 rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
        {label}
      </div>
      <div className={`text-xl font-mono font-semibold ${color || "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted">{sub}</div>
    </div>
  );
}

function BarCard({ label, value }: { label: string; value: number }) {
  const color = getScoreBg(value);
  const track = getScoreTrack(value);
  const textColor = getScoreColor(value);

  return (
    <div className="bg-surface border border-border/50 rounded-xl p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted">
          {label}
        </span>
        <span className={`text-sm font-mono font-medium ${textColor}`}>
          {value}%
        </span>
      </div>
      <div className={`h-1.5 rounded-full ${track}`}>
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main tracker ───
export default function HabitTracker() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [data, setData] = useState<Map<string, DayData>>(new Map());
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout>();
  const savedTimerRef = useRef<NodeJS.Timeout>();

  // Load data on mount and month change
  useEffect(() => {
    setMounted(true);
    const days = getDaysInMonth(year, month);
    const map = new Map<string, DayData>();
    days.forEach((date) => {
      map.set(date, loadDay(date));
    });
    // Load last day of previous month for sleep calculation on day 1
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthNum = month === 0 ? 11 : month - 1;
    const lastDayPrev = new Date(prevMonthYear, prevMonthNum + 1, 0).getDate();
    const prevMonthStr = String(prevMonthNum + 1).padStart(2, "0");
    const lastDayStr = `${prevMonthYear}-${prevMonthStr}-${String(lastDayPrev).padStart(2, "0")}`;
    map.set(lastDayStr, loadDay(lastDayStr));
    setData(map);

    // Open today's card by default
    const todayKey = days.find(isToday);
    if (todayKey) {
      setOpenCards(new Set([todayKey]));
    } else {
      setOpenCards(new Set());
    }
  }, [year, month]);

  const updateDay = useCallback(
    (dayData: DayData) => {
      setData((prev) => {
        const next = new Map(prev);
        next.set(dayData.date, dayData);
        return next;
      });

      // Debounced save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveDay(dayData);
        setShowSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setShowSaved(false), 1500);
      }, 500);
    },
    []
  );

  const toggleCard = useCallback((date: string) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }, []);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const saveAll = useCallback(() => {
    data.forEach((dayData) => {
      saveDay(dayData);
    });
    setShowSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setShowSaved(false), 1500);
  }, [data]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const days = getDaysInMonth(year, month);
  const dayDataList = days.map((d) => data.get(d) || createEmptyDay(d));

  // Get previous month's last day key for sleep calc
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthNum = month === 0 ? 11 : month - 1;
  const lastDayPrev = new Date(prevMonthYear, prevMonthNum + 1, 0).getDate();
  const prevMonthLastDayKey = `${prevMonthYear}-${String(prevMonthNum + 1).padStart(2, "0")}-${String(lastDayPrev).padStart(2, "0")}`;

  const getPrevBedtime = (idx: number): string => {
    if (idx > 0) {
      const prevDay = data.get(days[idx - 1]) || createEmptyDay(days[idx - 1]);
      return prevDay.bedtime;
    }
    // First day of month — use last day of previous month
    const prevMonthDay = data.get(prevMonthLastDayKey);
    return prevMonthDay?.bedtime || "";
  };

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  return (
    <div className="min-h-screen bg-background">
      <SaveIndicator visible={showSaved} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">
              <span className="text-accent">Life</span> Tracker
            </h1>
            <button
              onClick={saveAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-xs font-medium cursor-pointer border border-accent/30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={goToToday}
              className="font-mono text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-surface-light transition-colors cursor-pointer min-w-[140px] text-center"
            >
              {getMonthName(month)} {year}
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Summary */}
        <MonthSummary days={dayDataList} prevMonthBedtime={data.get(prevMonthLastDayKey)?.bedtime || ""} />

        {/* Mobile: Card layout */}
        <div className="md:hidden space-y-2">
          {days.map((date, idx) => {
            const dayData = data.get(date) || createEmptyDay(date);
            return (
              <DayCard
                key={date}
                data={dayData}
                prevBedtime={getPrevBedtime(idx)}
                isOpen={openCards.has(date)}
                onToggle={() => toggleCard(date)}
                onUpdate={updateDay}
              />
            );
          })}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-surface">
                <th className="sticky left-0 z-10 bg-surface px-3 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Date
                </th>
                <th className="px-1 py-2 text-[10px] uppercase tracking-wider text-muted font-medium" colSpan={4}>
                  Push-ups
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Tot
                </th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted font-medium text-center">
                  Med
                </th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted font-medium text-center">
                  Aff
                </th>
                <th className="px-1 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Bed
                </th>
                <th className="px-1 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Wake
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Sleep
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Food
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Mood
                </th>
                <th className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted font-medium">
                  Work
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((date, idx) => {
                const dayData = data.get(date) || createEmptyDay(date);
                return (
                  <DayRow
                    key={date}
                    data={dayData}
                    prevBedtime={getPrevBedtime(idx)}
                    onUpdate={updateDay}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {!isCurrentMonth && (
          <div className="mt-4 text-center">
            <button
              onClick={goToToday}
              className="text-sm text-accent hover:text-accent-light transition-colors cursor-pointer"
            >
              Back to current month
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
