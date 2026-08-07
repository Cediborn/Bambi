"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/Motion";
import { BoltIcon, StarIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { lastNDays, todayKey } from "@/utils/dates";
import { XP_PER_ENTRY, XP_PER_GOAL, XP_PER_QUEST, XP_PER_TEND } from "@/utils/xp";

/**
 * XpChart — the last 30 days as bars of XP earned. Pure read-only view of
 * the store: each day's XP is derived the same way `computeXp` does
 * (goals + quest + journal + tending), so the chart can never disagree
 * with the total.
 */
export function XpChart() {
  const { state } = useApp();
  const reduce = useReducedMotion();
  const today = todayKey();

  const { days, total } = useMemo(() => {
    const doneByDate = new Map<string, number>();
    for (const dates of Object.values(state.completions)) {
      for (const d of dates) doneByDate.set(d, (doneByDate.get(d) ?? 0) + 1);
    }
    const questDays = new Set(state.questsDone);
    const journalDays = new Set(state.journal.map((e) => e.date));
    const tendDays = new Set(state.tendedDates);

    const days = lastNDays(30).map((key) => {
      const xp =
        (doneByDate.get(key) ?? 0) * XP_PER_GOAL +
        (questDays.has(key) ? XP_PER_QUEST : 0) +
        (journalDays.has(key) ? XP_PER_ENTRY : 0) +
        (tendDays.has(key) ? XP_PER_TEND : 0);
      return { key, xp, isToday: key === today };
    });

    return {
      days,
      total: days.reduce((sum, d) => sum + d.xp, 0),
    };
  }, [state, today]);

  const max = Math.max(...days.map((d) => d.xp), 1);
  // Only draw bars when there is actual XP to show; a fresh user with
  // habits but no history gets the friendly empty message instead.
  const hasData = total > 0;

  return (
    <Card tone="indigo" size="featured">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand/80">
            XP rhythm
          </p>
          <h2 className="font-display mt-1 text-lg font-extrabold tracking-tight text-ink">
            The last 30 days
          </h2>
        </div>
        {hasData ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-brand">
            <BoltIcon size={15} />
            <CountUp value={total} /> XP earned
          </span>
        ) : null}
      </div>

      {!hasData ? (
        <p className="text-sm leading-relaxed text-ink-soft">
          Every completed goal, quest, journal entry and tree watering lands
          here as XP. Do something small and this chart starts to breathe.
        </p>
      ) : (
        <div className="flex items-end gap-[3px] sm:gap-1.5" role="img" aria-label={`XP earned per day over the last 30 days: ${total} total`}>
          {days.map((day, i) => {
            const height = day.xp > 0 ? Math.max(8, (day.xp / max) * 100) : 3;
            return (
              <div key={day.key} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-32 w-full items-end">
                  <motion.div
                    className={[
                      "w-full origin-bottom rounded-t-md transition-shadow duration-200",
                      day.isToday
                        ? "bg-gradient-to-t from-brand to-brand-2"
                        : day.xp > 0
                          ? "bg-gradient-to-t from-brand/45 to-brand-2/45 group-hover:from-brand/70 group-hover:to-brand-2/70"
                          : "bg-line/50 dark:bg-white/[0.06]",
                      "group-hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_18%,transparent)]",
                    ].join(" ")}
                    initial={reduce ? false : { scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.05 + i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: `${height}%` }}
                    title={`${day.key}: ${day.xp} XP`}
                  >
                    {day.xp > 0 && day.xp === max ? (
                      <StarIcon size={13} className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-achievement" />
                    ) : null}
                  </motion.div>
                </div>
                {(i % 5 === 0 || day.isToday) ? (
                  <span
                    className={[
                      "font-mono text-[9px] font-semibold tabular-nums",
                      day.isToday ? "text-brand" : "text-ink-soft/70",
                    ].join(" ")}
                  >
                    {day.isToday ? "now" : day.key.slice(8)}
                  </span>
                ) : (
                  <span className="h-[15px]" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="sr-only">
        {days.map((d) => `${d.key}: ${d.xp} XP`).join(". ")}.
      </p>
    </Card>
  );
}
