"use client";

import { useState } from "react";
import type { Habit } from "@/types";
import { Card } from "@/components/ui/Card";
import { CheckIcon, FlameIcon, HabitGlyph, PencilIcon, SnowflakeIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { todayKey } from "@/utils/dates";
import { habitColor, habitIconLabel } from "@/utils/habitMeta";
import { freezableDay, freezesAvailable, frozenSetFor, habitStreak, isScheduledOn, scheduleLabel } from "@/utils/streaks";
import { HabitForm } from "./HabitForm";

export function HabitCard({ habit }: { habit: Habit }) {
  const { state, api } = useApp();
  const sounds = useSounds();
  const [editing, setEditing] = useState(false);
  const today = todayKey();
  const done = (state.completions[habit.id] ?? []).includes(today);
  const scheduledToday = isScheduledOn(habit, today);
  const streak = habitStreak(habit, state.completions, frozenSetFor(habit.id, state.freezeUsed));
  const color = habitColor(habit.color);

  // A streak the freeze can save — only offered when one is actually available.
  const freezable = freezableDay(habit, state.completions, state.freezeUsed);
  const canFreeze = freezable !== null && freezesAvailable(state) > 0;

  const applyFreeze = () => {
    if (!freezable) return;
    api.useFreeze(habit.id, freezable.day);
    sounds.checkin();
  };

  if (editing) {
    return (
      <Card className="p-5">
        <HabitForm
          habit={habit}
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card size="compact" className="group flex items-center gap-4">
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <HabitGlyph name={habit.icon} size={24} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display truncate font-bold text-ink">{habit.name}</h3>
          <span className="hidden rounded-full bg-line/50 px-2 py-0.5 text-[11px] font-semibold text-ink-soft sm:inline-block">
            {habitIconLabel(habit.icon)}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          {scheduleLabel(habit)}
          <span aria-hidden="true">·</span>
          {streak > 0 ? (
            <span className="inline-flex items-center gap-0.5 font-bold text-tangerine">
              <FlameIcon size={13} />
              {streak} day{streak === 1 ? "" : "s"}
            </span>
          ) : (
            <span>No streak yet</span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (!done && scheduledToday) sounds.complete();
            api.toggleCompletion(habit.id, today);
          }}
          disabled={!scheduledToday}
          aria-label={
            !scheduledToday
              ? `${habit.name} is not scheduled today`
              : done
                ? `Mark ${habit.name} as not done today`
                : `Mark ${habit.name} as done today`
          }
          aria-pressed={done}
          className={[
            "flex size-11 items-center justify-center rounded-full border-2 transition-all duration-150",
            "active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            scheduledToday
              ? done
                ? "border-transparent bg-brand text-white shadow-card"
                : "border-line bg-surface text-transparent hover:border-brand hover:text-brand"
              : "cursor-not-allowed border-line/50 bg-line/30 text-line",
          ].join(" ")}
        >
          <CheckIcon size={20} className={done ? "animate-pop" : ""} />
        </button>

        {canFreeze ? (
          <button
            type="button"
            onClick={applyFreeze}
            aria-label={`Use a freeze to keep ${habit.name}'s streak alive`}
            title={`A missed day (${freezable?.day}) would break the streak. One freeze restores it to ${freezable?.restoredStreak} days.`}
            className="flex size-9 items-center justify-center rounded-lg text-info transition-colors hover:bg-info/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <SnowflakeIcon size={16} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${habit.name}`}
          className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <PencilIcon size={16} />
        </button>
      </div>
    </Card>
  );
}
