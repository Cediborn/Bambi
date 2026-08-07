"use client";

import { Reveal, RevealBlur, ScaleReveal, SlideIn } from "@/components/ui/Motion";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckInCard } from "@/features/today/CheckInCard";
import { FocusBanner } from "@/features/today/FocusBanner";
import { GoalRow } from "@/features/today/GoalRow";
import { HeroCard } from "@/features/today/HeroCard";
import { RestScene } from "@/features/today/RestScene";
import { WeekStrip } from "@/features/today/WeekStrip";
import { XpCard } from "@/features/today/XpCard";
import { QuoteCard } from "@/features/today/QuoteCard";
import { AchievementsStrip } from "@/features/today/AchievementsStrip";
import { QuestCard } from "@/features/today/QuestCard";
import { GrowthRhythmCard } from "@/features/today/GrowthRhythmCard";
import { TreeCard } from "@/features/tree/TreeCard";
import { useApp } from "@/hooks/useApp";
import { longDate, todayKey } from "@/utils/dates";
import { isScheduledOn } from "@/utils/streaks";

/**
 * The Today page — BAMBI's home. Each section has its own motion identity
 * (hero focuses in, quest slides in, tree grows into place, week strip
 * counts out from the center) so the page reads as one calm, sequenced
 * scene instead of a grid of identical cards.
 */
export default function TodayPage() {
  const { state, api } = useApp();
  const today = todayKey();

  const goals = state.habits.filter((h) => isScheduledOn(h, today));
  const done = goals.filter((h) => (state.completions[h.id] ?? []).includes(today)).length;
  const allDone = goals.length > 0 && done === goals.length;

  return (
    <div className="space-y-6 lg:space-y-10">
      <PageHeader title="Today" meta={longDate(today)} />

      {/* One quiet, contextual insight — never a notification */}
      <FocusBanner />

      {/* Centerpiece — fades in while the blur clears */}
      <RevealBlur>
        <HeroCard />
      </RevealBlur>

      {/* Full-width consistency rhythm — the visual proof that small daily steps add up */}
      <Reveal delay={0.06}>
        <GrowthRhythmCard />
      </Reveal>

      {/* Asymmetric dashboard — wide feature cards left, tight progress rail right */}
      <div className="grid items-start gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Left — the garden & today's work */}
        <section className="space-y-6 lg:col-span-3" aria-label="Today's quest and focus">
          <SlideIn from="left" delay={0.05}>
            <QuestCard />
          </SlideIn>

          <ScaleReveal delay={0.1}>
            <TreeCard />
          </ScaleReveal>

          <Reveal delay={0.15}>
            <Card tone="indigo" size="featured">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-bold text-ink">Today&apos;s Focus</h2>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {goals.length > 0
                      ? `${goals.length - done} to go — small steps.`
                      : "A softer day — rest counts as growth."}
                  </p>
                </div>
                {goals.length > 0 ? (
                  <span className="font-mono rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold tabular-nums text-brand">
                    {done}/{goals.length}
                  </span>
                ) : null}
              </div>

              {goals.length === 0 ? (
                <RestScene />
              ) : (
                <div className="space-y-4">
                  {goals.map((habit) => (
                    <GoalRow
                      key={habit.id}
                      habit={habit}
                      done={(state.completions[habit.id] ?? []).includes(today)}
                      onToggle={() => api.toggleCompletion(habit.id, today)}
                    />
                  ))}
                  {allDone ? (
                    <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-mint/10 px-3.5 py-2.5 text-sm font-bold text-good">
                      Great work. Consistency builds remarkable results.
                    </p>
                  ) : null}
                </div>
              )}
            </Card>
          </Reveal>
        </section>

        {/* Right — progress & reflection */}
        <aside className="space-y-6 lg:col-span-2" aria-label="Progress and reflection">
          <Reveal delay={0.05}>
            <XpCard />
          </Reveal>
          <Reveal delay={0.1}>
            <CheckInCard />
          </Reveal>
          <Reveal delay={0.15}>
            <WeekStrip />
          </Reveal>
          <Reveal delay={0.2} y={8}>
            <QuoteCard />
          </Reveal>
          <Reveal delay={0.25}>
            <AchievementsStrip />
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
