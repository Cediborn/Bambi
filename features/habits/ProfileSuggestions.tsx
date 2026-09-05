"use client";

import { SparklesIcon, HabitGlyph } from "@/components/icons";
import type { HabitSuggestion } from "./suggestions";

/**
 * Habits generated from the user's own interests and custom goals (the
 * same engine that builds the onboarding starters). Tapping a chip hands
 * the suggestion to the parent, which seeds the habit form with it.
 */
export function ProfileSuggestions({
  items,
  activeId,
  onPick,
}: {
  items: HabitSuggestion[];
  activeId: string | null;
  onPick: (suggestion: HabitSuggestion) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="font-display flex items-center gap-1.5 text-base font-bold text-ink">
        <SparklesIcon size={16} className="text-brand" />
        Made for you
      </h2>
      <p className="mt-0.5 text-xs text-ink-soft">
        Based on what matters to you. Tap to add, or write your own below.
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(s)}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all duration-150",
                "active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active
                  ? "border-brand/50 bg-brand/10 text-brand"
                  : "border-brand/25 bg-brand/[0.06] text-ink hover:border-brand/40 hover:text-brand",
              ].join(" ")}
            >
              <span aria-hidden="true" style={{ color: s.color }}>
                <HabitGlyph name={s.icon} size={14} />
              </span>
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}