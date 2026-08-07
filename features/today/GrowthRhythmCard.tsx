"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { FlameIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import type { AppState } from "@/types";
import { shiftKey, todayKey, weekKeyOf } from "@/utils/dates";

/**
 * GrowthRhythmCard — a GitHub-style consistency heatmap.
 *
 * The last 15 weeks as day-dots: every day you showed up (completed a
 * goal, quest, journal, focus session, challenge check-in, or watered
 * the tree) glows a little greener. The story is "small things, done
 * daily" — this card makes the rhythm visible at a glance.
 *
 * Nothing here stores state: it is a pure read-only view of the store.
 */

const WEEKS = 15;
const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Count "showed up" signals for each day in the window. */
function signalsByDay(state: AppState): Map<string, number> {
  const map = new Map<string, number>();

  const bump = (key: string, amount = 1) => {
    map.set(key, (map.get(key) ?? 0) + amount);
  };

  // Goals completed that day.
  for (const dates of Object.values(state.completions)) {
    for (const d of dates) bump(d);
  }
  // Daily quest, journal, tending — one signal each per day.
  for (const d of state.questsDone) bump(d);
  for (const e of state.journal) bump(e.date);
  for (const d of state.tendedDates) bump(d);
  // Focus: any session that day counts as one signal (deduped per day).
  for (const d of new Set(state.focus.map((s) => s.date))) bump(d);
  // Challenge check-ins count as one signal per day (not per challenge).
  const challengeDays = new Set(state.challenges.flatMap((c) => c.doneDates));
  for (const d of challengeDays) bump(d);

  return map;
}

/** 0..4 intensity for a day's signal count. */
function levelFor(signals: number): number {
  if (signals <= 0) return 0;
  if (signals <= 1) return 1;
  if (signals <= 3) return 2;
  if (signals <= 5) return 3;
  return 4;
}

const CELL_CLASSES = [
  "bg-line/70 dark:bg-white/[0.07]",
  "bg-mint/25 dark:bg-mint/20",
  "bg-mint/55 dark:bg-mint/40",
  "bg-good/75 dark:bg-good/60",
  "bg-good dark:bg-mint",
];

export function GrowthRhythmCard() {
  const { state } = useApp();
  const today = todayKey();

  const { weeks, activeDays, weekLabels } = useMemo(() => {
    const signals = signalsByDay(state);
    const firstMonday = shiftKey(weekKeyOf(today), -(WEEKS - 1) * 7);

    const weeks: { key: string; month: string | null; days: { key: string; level: number; isToday: boolean }[] }[] = [];
    let activeDays = 0;
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const monday = shiftKey(firstMonday, w * 7);
      const first = new Date(monday + "T00:00:00").getMonth();
      weeks.push({
        key: monday,
        month: first !== lastMonth ? MONTHS[first] : null,
        days: [],
      });
      lastMonth = first;
      for (let d = 0; d < 7; d++) {
        const key = shiftKey(monday, d);
        const level = levelFor(signals.get(key) ?? 0);
        if (level > 0) activeDays += 1;
        weeks[w].days.push({ key, level, isToday: key === today });
      }
    }

    const weekLabels = weeks.map((w) => w.month ?? "");
    return { weeks, activeDays, weekLabels };
  }, [state, today]);

  return (
    <Card tone="emerald" size="featured">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-good/80">
            Your rhythm
          </p>
          <h2 className="font-display mt-1 text-lg font-extrabold tracking-tight text-ink">
            Consistency, day by day
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-good/10 px-3 py-1.5">
          <FlameIcon size={15} className="text-good" />
          <span className="font-mono text-sm font-bold tabular-nums text-good">
            {activeDays}
          </span>
          <span className="text-xs font-semibold text-ink-soft">
            active days · {WEEKS} weeks
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1" role="img" aria-label={`Consistency heatmap: ${activeDays} active days in the last ${WEEKS} weeks`}>
        <div className="flex gap-2" style={{ minWidth: WEEKS * 18 + 40 }}>
          {/* Weekday labels */}
          <div className="grid grid-rows-7 gap-[5px] pr-1 text-right">
            {WEEKDAY_LABELS.map((l, i) => (
              <span key={i} className="h-[13px] text-[10px] font-semibold leading-[13px] text-ink-soft">
                {l}
              </span>
            ))}
          </div>

          {/* Month labels + dots */}
          <div className="flex-1">
            <div className="grid grid-rows-[13px_1fr] gap-[5px]">
              <div className="grid grid-flow-col grid-rows-1 gap-[5px]">
                {weekLabels.map((m, i) => (
                  <span
                    key={i}
                    className="h-[13px] truncate text-[10px] font-semibold text-ink-soft"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-[5px]">
                {weeks.flatMap((w) =>
                  w.days.map((d) => (
                    <span
                      key={d.key}
                      title={`${d.key} · ${d.level === 0 ? "rest" : `${d.level} step${d.level === 1 ? "" : "s"} toward growth`}`}
                      className={[
                        "size-[13px] rounded-[4px] transition-transform duration-150",
                        CELL_CLASSES[d.level],
                        d.isToday ? "ring-2 ring-brand ring-offset-1 ring-offset-transparent" : "",
                      ].join(" ")}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-ink-soft">
        <span>Less</span>
        {CELL_CLASSES.map((cls, i) => (
          <span key={i} aria-hidden="true" className={`size-2.5 rounded-[3px] ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </Card>
  );
}
