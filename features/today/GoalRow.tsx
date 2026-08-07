"use client";

import { useState } from "react";
import type { Habit } from "@/types";
import { CheckIcon, HabitGlyph } from "@/components/icons";
import { habitColor } from "@/utils/habitMeta";
import { XP_PER_GOAL } from "@/utils/xp";
import { useSounds } from "@/hooks/useSounds";

interface GoalRowProps {
  habit: Habit;
  done: boolean;
  onToggle: () => void;
}

export function GoalRow({ habit, done, onToggle }: GoalRowProps) {
  const color = habitColor(habit.color);
  const sounds = useSounds();
  const [xpFlash, setXpFlash] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleToggle = () => {
    if (!done) {
      sounds.complete();
      setXpFlash(true);
      window.setTimeout(() => setXpFlash(false), 1400);
    }
    // A quiet one-shot sweep — "this row just updated", never a reload.
    setFlash(true);
    window.setTimeout(() => setFlash(false), 900);
    onToggle();
  };

  return (
    <div className="group relative flex items-center gap-3.5">
      {flash ? (
        <span
          aria-hidden="true"
          className="animate-flash-sweep absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-mint/20 to-transparent"
        />
      ) : null}
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={done}
        aria-label={done ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          "active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          done
            ? "border-transparent bg-brand text-white shadow-card"
            : "border-line bg-surface text-transparent hover:border-brand hover:text-brand",
        ].join(" ")}
      >
        <CheckIcon size={18} className={done ? "animate-pop" : ""} />
      </button>

      {xpFlash ? (
        <span
          aria-hidden="true"
          className="animate-xp-float pointer-events-none absolute left-8 top-0 rounded-full bg-good px-2 py-0.5 text-[11px] font-extrabold text-white shadow-card"
        >
          +{XP_PER_GOAL} XP
        </span>
      ) : null}

      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <HabitGlyph name={habit.icon} size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate font-semibold transition-colors duration-200",
            done ? "text-ink-soft line-through decoration-line" : "text-ink",
          ].join(" ")}
        >
          {habit.name}
        </p>
      </div>
    </div>
  );
}
