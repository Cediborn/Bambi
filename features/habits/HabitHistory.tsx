"use client";

import type { AppState, Habit } from "@/types";
import { Card } from "@/components/ui/Card";
import { FlameIcon, HabitGlyph } from "@/components/icons";
import { fullDate } from "@/utils/dates";
import { habitColor } from "@/utils/habitMeta";
import { frozenSetFor, habitStreak } from "@/utils/streaks";

export interface HistoryItem {
  habit: Habit;
  /** Completed dates (YYYY-MM-DD), sorted ascending. */
  dates: string[];
}

/**
 * Habit history — every habit that has at least one completion, with how
 * many times it's been completed, its current streak, and its last
 * completion date. Completed days never silently disappear.
 */
export function HabitHistory({
  items,
  completions,
  freezeUsed,
}: {
  items: HistoryItem[];
  completions: AppState["completions"];
  freezeUsed: AppState["freezeUsed"];
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-ink">Habit history</h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          Every completed day stays recorded — nothing disappears.
        </p>
      </div>
      <div className="space-y-3">
        {items.map(({ habit, dates }) => {
          const color = habitColor(habit.color);
          const streak = habitStreak(habit, completions, frozenSetFor(habit.id, freezeUsed));
          const last = dates[dates.length - 1];
          return (
            <div key={habit.id} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}1A`, color }}
              >
                <HabitGlyph name={habit.icon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{habit.name}</p>
                <p className="text-xs text-ink-soft">
                  Completed {dates.length}× · Last: {fullDate(last)}
                </p>
              </div>
              {streak > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tangerine/15 px-2.5 py-1 text-xs font-bold text-tangerine">
                  <FlameIcon size={13} />
                  {streak}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}