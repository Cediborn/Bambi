"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, HabitGlyph, PlusIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import {
  DIFFICULTY_LABEL,
  HABIT_CATEGORIES,
  categoryFor,
  habitsFor,
  normalizeInterests,
} from "./habitLibrary";

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/**
 * The "+ New Habits" browser: browse the curated library category by
 * category, pick any habits you want, and add them to your active habits —
 * no onboarding redo, existing habits untouched. Habits already owned are
 * shown as "Added" and never duplicated. The user's own interests sort
 * first so the flow still feels personal.
 */
export function HabitLibraryPicker({
  priorityKeys,
  ownedNames,
}: {
  priorityKeys: string[];
  ownedNames: Set<string>;
}) {
  const { api } = useApp();
  const priorities = normalizeInterests(priorityKeys);

  const categories = useMemo(() => {
    const rest = HABIT_CATEGORIES.filter((c) => !priorities.includes(c.key));
    return [
      ...priorities.map((key) => categoryFor(key)).filter((c): c is NonNullable<typeof c> => Boolean(c)),
      ...rest,
    ];
  }, [priorities]);

  const [activeKey, setActiveKey] = useState(() => categories[0]?.key ?? HABIT_CATEGORIES[0].key);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const activeCat = categoryFor(activeKey);
  const habits = activeCat ? habitsFor(activeKey) : [];
  const owned = habits.filter((h) => ownedNames.has(h.title.toLowerCase()));
  const available = habits.filter((h) => !ownedNames.has(h.title.toLowerCase()));
  const selectedCount = available.filter((h) => selected.has(h.id)).length;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addSelected = () => {
    const chosen = available.filter((h) => selected.has(h.id));
    chosen.forEach((h) =>
      api.addHabit({ name: h.title, icon: h.icon, color: h.color, schedule: ALL_DAYS })
    );
    setSelected(new Set());
  };

  return (
    <div>
      <div>
        <h2 className="font-display flex items-center gap-1.5 text-base font-bold text-ink">
          <PlusIcon size={16} className="text-brand" />
          Browse by category
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          Pick a category, then choose the habits you want. You decide — or write your own below.
        </p>
      </div>

      {/* Category pills — the user's own interests come first */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Categories">
        {categories.map((cat) => {
          const active = activeKey === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setActiveKey(cat.key);
                setSelected(new Set());
              }}
              className={[
                "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition-all duration-150",
                "active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active
                  ? "border-brand/50 bg-brand/10 text-brand"
                  : "border-line bg-surface text-ink hover:border-brand/40 hover:text-ink",
              ].join(" ")}
            >
              <span aria-hidden="true" className="opacity-80">
                <HabitGlyph name={cat.glyph} size={12} />
              </span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Habits in the active category */}
      {activeCat ? (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
            {activeCat.label} · {habits.length} habits
          </p>
          {available.length === 0 ? (
            <p className="mt-3 rounded-xl bg-surface px-3.5 py-3 text-sm font-semibold text-ink-soft">
              You&apos;ve already added every habit in this category — try another one.
            </p>
          ) : (            <div className="mt-2 grid gap-2">
              {available.map((h) => {
                const on = selected.has(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(h.id)}
                    className={[
                      "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all duration-150",
                      "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                      on
                        ? "border-brand/40 bg-brand/5"
                        : "border-line bg-card hover:border-brand/30",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${h.color}1A`, color: h.color }}
                    >
                      <HabitGlyph name={h.icon} size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-sm font-bold leading-tight text-ink">
                        {h.title}
                      </span>
                      <span className="block text-[10px] text-ink-soft">
                        {h.minutes} min · {DIFFICULTY_LABEL[h.difficulty]}
                      </span>
                    </span>
                    <span
                      className={[
                        "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
                        on ? "border-transparent bg-brand text-white" : "border-line text-transparent",
                      ].join(" ")}
                    >
                      <CheckIcon size={10} />
                    </span>
                  </button>
);
              })}
            </div>
          )}

          {owned.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {owned.map((h) => (
                <span
                  key={h.id}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 text-[10px] font-semibold text-ink-soft"
                >
                  <CheckIcon size={10} className="text-good" />
                  {h.title}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={addSelected}
              disabled={selectedCount === 0}
              size="sm"
              icon={<PlusIcon size={14} />}
            >
              Add {selectedCount > 0 ? `${selectedCount} ` : ""}
              {selectedCount === 1 ? "habit" : "habits"}
            </Button>
            {selectedCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}