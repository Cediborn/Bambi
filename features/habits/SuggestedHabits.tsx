"use client";

import { HabitGlyph } from "@/components/icons";
import { SUGGESTION_CATEGORIES, type HabitSuggestion } from "./suggestions";

/**
 * Suggested habits for the new-habit flow. Tapping a chip hands the
 * suggestion to the parent, which seeds the habit form with it.
 */
export function SuggestedHabits({
  activeId,
  onPick,
}: {
  activeId: string | null;
  onPick: (suggestion: HabitSuggestion) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-base font-bold text-ink">Suggested habits</h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          Tap one to start — you can tweak it before saving, or write your own below.
        </p>
      </div>

      <div className="space-y-3">
        {SUGGESTION_CATEGORIES.map((cat) => (
          <div key={cat.key}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              {cat.label}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {cat.items.map((s) => {
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
                        : "border-line bg-surface text-ink hover:border-brand/40 hover:text-ink",
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
        ))}
      </div>
    </div>
  );
}