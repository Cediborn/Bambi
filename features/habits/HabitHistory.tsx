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
    <Card className="p-4 sm:p-5 overflow-visible">
      <div className="mb-3">
        <h2 className="font-display text-sm font-bold text-ink">Habit history</h2>
        <p className="mt-0.5 text-[10px] text-ink-soft">
          Every completed day stays recorded — nothing disappears.
        </p>
      </div>
      <div className="space-y-2">
        {items.map(({ habit, dates }) => {
          const color = habitColor(habit.color);
          const streak = habitStreak(habit, completions, frozenSetFor(habit.id, freezeUsed));
          const last = dates[dates.length - 1];
          return (
            <div key={habit.id} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}1A`, color }}
              >
                <HabitGlyph name={habit.icon} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{habit.name}</p>
                <p className="text-[10px] text-ink-soft">
                  Completed {dates.length}× · Last: {fullDate(last)}
                </p>
              </div>
              {streak > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tangerine/15 px-1.5 py-0.5 text-[10px] font-bold text-tangerine">
                  <FlameIcon size={11} />
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