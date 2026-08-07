"use client";

import { Card } from "@/components/ui/Card";
import { moodLabel, MOODS } from "@/components/ui/MoodPicker";
import { ActivityIcon, FlameIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { lastNDays, todayKey, narrowDayLabel } from "@/utils/dates";
import { journalStreak } from "@/utils/streaks";

/** Weekly mood bars + monthly insights, derived from journal entries. */
export function MoodPanel() {
  const { state } = useApp();
  const today = todayKey();
  const byDate = new Map(state.journal.map((e) => [e.date, e.mood]));
  const days = lastNDays(7);
  const streak = journalStreak(state.journal);

  const month = today.slice(0, 7);
  const [prevYear, prevMonth] = month.split("-").map(Number);
  const prev = new Date(prevYear, prevMonth - 2, 1);
  const prevMonthKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const thisMonth = state.journal.filter((e) => e.date.startsWith(month)).map((e) => e.mood);
  const lastMonth = state.journal.filter((e) => e.date.startsWith(prevMonthKey)).map((e) => e.mood);
  const avg = (list: number[]) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);
  const thisAvg = avg(thisMonth);
  const lastAvg = avg(lastMonth);
  const delta = thisAvg !== null && lastAvg !== null ? thisAvg - lastAvg : null;
  const mostCommon =
    thisMonth.length > 0
      ? [...new Set(thisMonth)].sort((a, b) =>
          thisMonth.filter((m) => m === b).length - thisMonth.filter((m) => m === a).length
        )[0]
      : null;

  return (
    <Card tone="sky" size="featured" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-info/15 text-info">
            <ActivityIcon size={20} />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink">Mood tracker</h2>
            <p className="text-xs text-ink-soft">Logged with every check-in</p>
          </div>
        </div>
        {streak > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warn/15 px-3 py-1.5 text-xs font-bold text-warn">
            <FlameIcon size={13} />
            {streak}-day check-in streak
          </span>
        ) : null}
      </div>

      {/* Last 7 days */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
          Last 7 days
        </p>
        <div className="flex items-end justify-between gap-2 sm:gap-3" aria-hidden="true">
          {days.map((key) => {
            const mood = byDate.get(key);
            const color = MOODS.find((m) => m.value === mood)?.color ?? "#94a3b8";
            const height = mood ? (mood / 5) * 72 : 8;
            const isToday = key === today;
            return (
              <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-ink-soft">
                  {mood ? `${mood}/5` : "—"}
                </span>
                <div className="flex h-[72px] w-full items-end justify-center">
                  <div
                    className="w-full max-w-7 rounded-lg transition-colors"
                    style={{
                      height: `${height}%`,
                      backgroundColor: mood ? `${color}cc` : "transparent",
                      border: mood ? "none" : "1px dashed var(--t-line)",
                    }}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold ${isToday ? "text-brand" : "text-ink-soft/70"}`}
                >
                  {narrowDayLabel(key)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="sr-only">
          {days
            .map((k) => `${narrowDayLabel(k)}: ${byDate.get(k) ? `mood ${byDate.get(k)}` : "no entry"}`)
            .join(". ")}
        </p>
      </div>

      {/* Monthly insights */}
      <div className="grid grid-cols-3 gap-3 border-t border-line pt-5 dark:border-white/[0.06]">
        <div className="rounded-xl bg-surface/60 px-3 py-3 text-center">
          <p className="font-mono text-xl font-bold tabular-nums text-ink">
            {thisAvg !== null ? thisAvg.toFixed(1) : "—"}
          </p>
          <p className="text-[11px] font-semibold text-ink-soft">This month&apos;s mood</p>
        </div>
        <div className="rounded-xl bg-surface/60 px-3 py-3 text-center">
          <p className="font-mono text-xl font-bold tabular-nums text-ink">
            {delta === null ? "—" : delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
          </p>
          <p className="text-[11px] font-semibold text-ink-soft">vs last month</p>
        </div>
        <div className="rounded-xl bg-surface/60 px-3 py-3 text-center">
          <p className="text-sm font-bold text-ink">{mostCommon ? moodLabel(mostCommon) : "—"}</p>
          <p className="text-[11px] font-semibold text-ink-soft">Most common</p>
        </div>
      </div>
    </Card>
  );
}
