"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowRightIcon, FlameIcon, LeafIcon } from "@/components/icons";
import { TreeSVG } from "@/components/tree/TreeSVG";
import { useApp } from "@/hooks/useApp";
import { treeInfo } from "@/utils/tree";
import { topStreak, totalCompletions } from "@/utils/streaks";

/** Floating leaves — each drifts up on its own arc, delay and duration. */
const FLOATING_LEAVES = [
  { top: "10%", left: "7%", size: 18, delay: 0, duration: 7 },
  { top: "30%", left: "90%", size: 14, delay: 1.6, duration: 8 },
  { top: "58%", left: "3%", size: 12, delay: 3.1, duration: 6.5 },
  { top: "68%", left: "93%", size: 16, delay: 4.4, duration: 7.5 },
  { top: "6%", left: "40%", size: 12, delay: 5.2, duration: 8.4 },
  { top: "40%", left: "82%", size: 13, delay: 2.4, duration: 9 },
];

/**
 * RestScene — the empty state for a day with nothing scheduled. A small
 * living scene instead of a blank message: the user's tree resting,
 * leaves drifting around it, their streak acknowledged, and a gentle
 * nudge to plan the next day. Rest is part of the routine.
 */
export function RestScene() {
  const { state } = useApp();
  const info = treeInfo(state);
  const streak = topStreak(state.habits, state.completions, state.freezeUsed);
  const total = totalCompletions(state.completions);

  return (
    <div className="relative overflow-hidden px-4 py-8 text-center sm:py-10">
      {/* Floating leaves around the scene */}
      {FLOATING_LEAVES.map((l, i) => (
        <LeafIcon
          key={i}
          size={l.size}
          className="animate-leaf-float absolute text-good/50 dark:text-mint/40"
          style={{
            top: l.top,
            left: l.left,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`,
          }}
        />
      ))}

      {/* The user's tree, resting */}
      <div className="animate-breathe mx-auto w-40 sm:w-48">
        <TreeSVG info={info} />
      </div>

      {/* Momentum chip */}
      {streak > 0 ? (
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-good/10 px-3 py-1.5 text-sm font-bold text-good">
          <FlameIcon size={15} />
          {streak}-day streak — it&apos;s safe today
        </span>
      ) : (
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand">
          {total > 0 ? "You&apos;ve been growing" : "Day one"}
        </span>
      )}

      <h3 className="font-display mt-3 text-xl font-extrabold tracking-tight text-ink">
        A lighter day.
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">
        Nothing scheduled — the garden is resting, and so can you. Rest is
        part of the routine, not a break from it.
      </p>

      {/* CTAs — plan the next day first, add a habit if they prefer */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/habits" className={buttonClasses("primary", "md")}>
          Plan tomorrow
          <ArrowRightIcon size={16} />
        </Link>
        <Link
          href="/habits"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Add a habit
        </Link>
      </div>
    </div>
  );
}
