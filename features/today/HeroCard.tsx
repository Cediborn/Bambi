"use client";

import { useState } from "react";
import { CountUp } from "@/components/ui/Motion";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Avatar } from "@/components/ui/Avatar";
import {
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon,
  FlameIcon,
  HabitGlyph,
  MoodGlyph,
  SparklesIcon,
} from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { timeGreeting } from "@/utils/greetings";
import { levelProgress, levelTitle, XP_PER_QUEST } from "@/utils/xp";
import { todayKey } from "@/utils/dates";
import { useTodayHero } from "./useTodayHero";

/**
 * The visual centerpiece of the dashboard. A warm gradient panel that
 * answers "what should I do next?" in one glance.
 *
 * The panel is never static: its greeting line, chip and glyph adapt to
 * the user's real situation (streak, progress, first visit, return after
 * a gap, time of day…) via `heroContext`. Layout is editorial — quest and
 * focus on the wide side, the numbers stacked as a tight rail on the other.
 *
 * All derived numbers come from `useTodayHero` — this component only
 * renders and handles interaction.
 */
export function HeroCard() {
  const { api } = useApp();
  const sounds = useSounds();
  const today = todayKey();
  const { name, avatar, xp, level, streak, ctx, quest, questDone, pending, focusLine } =
    useTodayHero();

  const [xpFlash, setXpFlash] = useState(false);

  const completeQuest = () => {
    if (questDone) return;
    api.toggleQuest(today);
    sounds.quest();
    setXpFlash(true);
    window.setTimeout(() => setXpFlash(false), 1400);
  };

  return (
    <section
      aria-label="Today at a glance"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-2 to-brand-2 text-white shadow-lift"
    >
      {/* Soft drifting highlights + grain so the panel never looks flat */}
      <div
        aria-hidden="true"
        className="animate-hero-shimmer absolute -right-12 -top-16 size-60 rounded-full bg-white/15 blur-3xl sm:-right-20 sm:-top-24 sm:size-80"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 left-1/4 size-56 rounded-full bg-white/10 blur-3xl sm:-bottom-28 sm:size-72"
      />
      <div aria-hidden="true" className="grain-overlay absolute inset-0 opacity-[0.08]" />

      <div className="relative p-5 sm:p-6 lg:p-8">
        {/* Greeting */}
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div className="flex items-end gap-3 sm:gap-4">
            <Avatar avatar={avatar} size={56} className="ring-2 ring-white/30" />
            <div>
              <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
                {timeGreeting()}, {name}.{" "}
                <span aria-hidden="true" className="inline-flex text-lg sm:text-xl lg:text-2xl">
                  <MoodGlyph name={ctx.glyph} size={22} />
                </span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/80 sm:text-base">{ctx.line}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              {ctx.chip}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/85 backdrop-blur-sm">
              {levelTitle(level)}
            </span>
          </div>
        </div>

        {/* Editorial split: the day's work wide, the numbers as a tight rail */}
        <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-5 lg:col-span-2">
            {/* Today's quest + reward */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  {questDone ? <CheckCircleIcon size={20} /> : <HabitGlyph name={quest.icon} size={20} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
                    Today&apos;s quest
                  </p>
                  <p
                    className={[
                      "min-w-0 break-words font-bold transition-colors",
                      questDone ? "text-white/80 line-through decoration-white/50" : "text-white",
                    ].join(" ")}
                  >
                    {quest.title}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-extrabold text-white backdrop-blur-sm">
                  <SparklesIcon size={15} />
                  +{quest.rewardXp} XP
                </span>
                <button
                  type="button"
                  onClick={completeQuest}
                  disabled={questDone}
                  className="relative inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_10px_24px_-10px_rgb(0_0_0/0.45)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_14px_28px_-10px_rgb(0_0_0/0.5)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-80"
                >
                  {questDone ? (
                    <>
                      <CheckCircleIcon size={16} />
                      Quest complete
                    </>
                  ) : (
                    <>
                      <SparklesIcon size={16} />
                      Complete quest
                    </>
                  )}
                  {!questDone ? <ArrowRightIcon size={15} /> : null}
                  {xpFlash ? (
                    <span
                      aria-hidden="true"
                      className="animate-xp-float absolute -top-2.5 right-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-good shadow-card"
                    >
                      +{XP_PER_QUEST} XP
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            {/* Today's focus status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/85">
                <span className="font-bold text-white">{pending?.name ?? "Nothing pending"}</span>
                <span className="text-white/70"> — {focusLine}</span>
              </p>
              {pending ? (
                <button
                  type="button"
                  onClick={() => api.toggleCompletion(pending.id, today)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Mark done
                  <ArrowRightIcon size={14} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Numbers rail */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-1 lg:gap-5">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="flex size-8 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <FlameIcon size={16} />
              </span>
              <div className="min-w-0">
                <CountUp
                  value={streak}
                  className="font-mono text-lg sm:text-2xl lg:text-3xl font-bold tabular-nums tracking-tight"
                />
                <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] text-white/75">
                  Day streak
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="flex size-8 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <BoltIcon size={16} />
              </span>
              <div className="min-w-0">
                <CountUp
                  value={xp}
                  className="font-mono text-lg sm:text-2xl lg:text-3xl font-bold tabular-nums tracking-tight"
                />
                <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] text-white/75">
                  Total XP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* keyed by level so the pop replays on level-up */}
              <div key={level} className="animate-pop flex min-w-0 items-center gap-2 sm:gap-3">
                <ProgressRing
                  progress={levelProgress(xp)}
                  size={48}
                  stroke={6}
                  tone="text-mint"
                  trackClassName="text-white/20"
                >
                  <span className="font-mono text-[10px] sm:text-sm font-bold">Lv {level}</span>
                </ProgressRing>
                <div className="hidden sm:block">
                  <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] text-white/75">
                    Level
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-white/90">{levelTitle(level)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
