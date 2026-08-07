"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/Motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BoltIcon, SparklesIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { isScheduledOn } from "@/utils/streaks";
import { computeXp, levelForXp, levelProgress, levelTitle, xpToNextLevel, XP_PER_ENTRY, XP_PER_GOAL } from "@/utils/xp";
import { todayKey } from "@/utils/dates";

/** Level + XP card: how close the user is to the next level and what it unlocks. */
export function XpCard() {
  const { state } = useApp();
  const sounds = useSounds();
  const today = todayKey();
  const xp = computeXp(state);
  const level = levelForXp(xp);
  const next = level + 1;
  const prevLevel = useRef(level);

  // A quiet level-up chime when the level climbs.
  useEffect(() => {
    if (level > prevLevel.current) sounds.levelup();
    prevLevel.current = level;
  }, [level, sounds]);

  const goalsToday = state.habits.filter((h) => isScheduledOn(h, today));
  const goalsDoneToday = goalsToday.filter((h) => (state.completions[h.id] ?? []).includes(today)).length;
  const entryToday = state.journal.some((e) => e.date === today);
  const earnedToday = goalsDoneToday * XP_PER_GOAL + (entryToday ? XP_PER_ENTRY : 0);

  return (
    <Card tone="indigo" size="featured">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Level</p>
          {/* keyed by level so the glow + pop replay on level-up */}
          <div key={level} className="animate-level-glow mt-1 inline-block rounded-full">
            <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-ink">
              {level}
            </p>
          </div>
          <p className="text-sm font-semibold text-brand">{levelTitle(level)}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-brand">
          <BoltIcon size={15} />
          <CountUp value={xp} className="font-mono text-sm font-bold tabular-nums" />
          <span className="font-mono text-sm font-bold">XP</span>
        </span>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={levelProgress(xp)}
          ariaLabel={`Progress to level ${next}`}
        />
        <div className="mt-2 flex items-center justify-between font-mono text-xs font-semibold tabular-nums text-ink-soft">
          <span>
            {xpToNextLevel(xp)} XP to Level {next}
          </span>
          <span className="text-ink-soft/70">{Math.round(levelProgress(xp) * 100)}%</span>
        </div>
      </div>

      {/* Next reward preview */}
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand/5 px-3.5 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-2/15 text-brand-2">
          <SparklesIcon size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            Next at Level {next}
          </p>
          <p className="truncate text-sm font-bold text-ink">{levelTitle(next)}</p>
        </div>
      </div>

      {earnedToday > 0 ? (
        <p className="mt-4 text-xs font-semibold text-ink-soft">
          Earned today: <span className="font-mono font-extrabold tabular-nums text-good">+{earnedToday} XP</span>
        </p>
      ) : null}
    </Card>
  );
}
