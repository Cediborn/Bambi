"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal, SlideIn, Stagger, StaggerItem } from "@/components/ui/Motion";
import { StatCard } from "@/features/growth/StatCard";
import { WeekChart } from "@/features/growth/WeekChart";
import { XpChart } from "@/features/growth/XpChart";
import {
  ActivityIcon,
  BookOpenIcon,
  BoltIcon,
  FlameIcon,
  HabitGlyph,
  SparklesIcon,
  TargetIcon,
} from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { habitColor } from "@/utils/habitMeta";
import { completionsInLastDays, frozenSetFor, habitStreak, totalCompletions } from "@/utils/streaks";
import { computeXp, levelForXp, levelProgress, xpToNextLevel } from "@/utils/xp";

export default function GrowthPage() {
  const { state } = useApp();
  const xp = computeXp(state);
  const level = levelForXp(xp);
  const total = totalCompletions(state.completions);
  const week = completionsInLastDays(state.completions, 7);
  const best = state.habits.reduce(
    (bestHabit, h) => {
      const s = habitStreak(h, state.completions, frozenSetFor(h.id, state.freezeUsed));
      return s > bestHabit.streak ? { name: h.name, streak: s } : bestHabit;
    },
    { name: "", streak: 0 }
  );

  const bestHabit = state.habits
    .map((h) => ({
      habit: h,
      streak: habitStreak(h, state.completions, frozenSetFor(h.id, state.freezeUsed)),
      done: (state.completions[h.id] ?? []).length,
    }))
    .sort((a, b) => b.done - a.done);

  const maxDone = bestHabit[0]?.done ?? 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="Growth"
        subtitle="Trends beat totals. Watch the pattern, not the peak."
      />

      {/* Stats — arrive one after another */}
      <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" stagger={0.07}>
        <StaggerItem>
          <StatCard icon={<BoltIcon size={20} />} label="Total XP" value={String(xp)} sub={`Level ${level}`} tone="brand" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={<FlameIcon size={20} />} label="Best streak" value={String(best.streak)} sub={best.name || "No habit yet"} tone="tangerine" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={<TargetIcon size={20} />} label="Goals completed" value={String(total)} sub="All time" tone="violet" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={<ActivityIcon size={20} />} label="This week" value={String(week)} sub="Goals in 7 days" tone="mint" />
        </StaggerItem>
      </Stagger>

      {/* XP rhythm — the long view */}
      <Reveal delay={0.05}>
        <XpChart />
      </Reveal>

      {/* Level */}
      <Reveal delay={0.08}>
        <Card tone="indigo" className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-ink">Level {level}</h2>
              <p className="mt-1 font-mono text-sm tabular-nums text-ink-soft">
                {xpToNextLevel(xp)} XP to level {level + 1}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-bold text-brand">
              <SparklesIcon size={15} />
              {xp} XP
            </span>
          </div>
          <div className="mt-4">
            <ProgressBar value={levelProgress(xp)} ariaLabel="Level progress" />
          </div>
        </Card>
      </Reveal>

      {/* Weekly chart */}
      <Reveal delay={0.1}>
        <WeekChart />
      </Reveal>

      {/* Habit breakdown */}
      <SlideIn from="left" delay={0.1}>
        {state.habits.length === 0 ? (
          <EmptyState
            illustration="seed"
            title="No habits to break down yet"
            description="Once you plant your first habit, its rhythm shows up here — streaks, totals, and the quiet pattern you're building."
          />
        ) : (
          <Card className="p-6">
            <h2 className="font-display text-base font-bold text-ink">Habit breakdown</h2>
            <div className="mt-5 space-y-5">
              {bestHabit.map(({ habit, streak, done }) => {
                const color = habitColor(habit.color);
                const share = maxDone > 0 ? done / maxDone : 0;
                return (
                  <div key={habit.id} className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}1A`, color }}
                    >
                      <HabitGlyph name={habit.icon} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-bold text-ink">{habit.name}</p>
                        <p className="shrink-0 text-xs font-semibold text-ink-soft">
                          {done} done
                          {streak > 0 ? ` · ${streak}-day streak` : ""}
                        </p>
                      </div>
                      <div className="mt-1.5">
                        <ProgressBar value={share} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </SlideIn>

      <p className="flex items-center gap-2 px-1 text-xs text-ink-soft">
        <BookOpenIcon size={14} />
        Rest days never break a streak. Recovery is part of the loop.
      </p>
    </div>
  );
}
