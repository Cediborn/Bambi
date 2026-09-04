"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Habit } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, FieldError, Input } from "@/components/ui/Input";
import { CheckIcon, HabitGlyph, TrashIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { HABIT_COLORS, HABIT_ICONS } from "@/utils/habitMeta";
import type { HabitSuggestion } from "./suggestions";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HabitFormProps {
  /** When present, the form edits this habit instead of creating a new one. */
  habit?: Habit;
  /** A suggested habit to seed the form when creating (editable before saving). */
  preset?: HabitSuggestion | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function HabitForm({ habit, preset, onSaved, onCancel }: HabitFormProps) {
  const { api } = useApp();
  const [name, setName] = useState(habit?.name ?? preset?.name ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? preset?.icon ?? "leaf");
  const [color, setColor] = useState(habit?.color ?? preset?.color ?? HABIT_COLORS[0]);
  const [schedule, setSchedule] = useState<number[]>(habit?.schedule ?? [0, 1, 2, 3, 4, 5, 6]);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (day: number) => {
    setSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const everyDay = schedule.length === 7;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give your habit a name.");
      return;
    }
    if (schedule.length === 0) {
      setError("Pick at least one day for this habit.");
      return;
    }
    setError(null);
    if (habit) {
      api.updateHabit(habit.id, { name: trimmed, icon, color, schedule });
    } else {
      api.addHabit({ name: trimmed, icon, color, schedule });
    }
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Habit name" htmlFor="habit-name">
        <Input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read 10 pages"
          maxLength={48}
          autoFocus
        />
      </Field>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-ink">Icon</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icon">
          {HABIT_ICONS.map((item) => {
            const selected = icon === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={item.label}
                onClick={() => setIcon(item.key)}
                className={[
                  "flex size-11 items-center justify-center rounded-xl border-2 transition-all duration-150",
                  "active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  selected
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line bg-surface text-ink-soft hover:border-brand/40 hover:text-ink",
                ].join(" ")}
              >
                <HabitGlyph name={item.key} size={20} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-ink">Color</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
          {HABIT_COLORS.map((c) => {
            const selected = color === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className={[
                  "size-9 rounded-full border-2 transition-all duration-150",
                  "active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  selected ? "scale-110 border-card ring-2 ring-brand" : "border-line/40",
                ].join(" ")}
                style={{ backgroundColor: c }}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink">Repeat on</span>
          <button
            type="button"
            onClick={() => setSchedule(everyDay ? [] : [0, 1, 2, 3, 4, 5, 6])}
            className="text-xs font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {everyDay ? "Clear all" : "Every day"}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {DAY_NAMES.map((day, i) => {
            const selected = schedule.includes(i);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={selected}
                aria-label={day}
                onClick={() => toggleDay(i)}
                className={[
                  "h-9 rounded-lg text-xs font-bold transition-all duration-150",
                  "active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  selected
                    ? "bg-brand text-white shadow-card"
                    : "bg-surface text-ink-soft hover:bg-line/60 hover:text-ink",
                ].join(" ")}
              >
                {day[0]}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <FieldError>{error}</FieldError> : null}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" fullWidth>
          <CheckIcon size={17} />
          {habit ? "Save changes" : "Add habit"}
        </Button>
        {habit ? (
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              api.removeHabit(habit.id);
              onSaved?.();
            }}
            icon={<TrashIcon size={17} />}
            aria-label="Delete habit"
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>
        ) : null}
        {onCancel ? (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
