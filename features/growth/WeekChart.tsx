"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { weekSummary } from "@/utils/streaks";

/** Seven-day rhythm chart — animated bars, gradient fills, milestone marks. */
export function WeekChart() {
  const { state } = useApp();
  const days = weekSummary(state);
  const hasHabits = state.habits.length > 0;
  const reduce = useReducedMotion();

  return (
    <Card tone="emerald" className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-base font-bold text-ink">Last 7 days</h2>
        <p className="text-xs font-medium text-ink-soft">Goals completed</p>
      </div>

      {!hasHabits ? (
        <p className="mt-6 text-sm text-ink-soft">
          Add a habit and your weekly rhythm will show up here.
        </p>
      ) : (
        <div className="relative mt-6">
          {/* Milestone line: a full day = 100% */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[30px] border-t border-dashed border-line dark:border-white/10"
          />
          <div className="flex items-end justify-between gap-2 sm:gap-4" aria-hidden="true">
            {days.map((day, i) => {
              const ratio = day.scheduled > 0 ? day.completed / day.scheduled : 0;
              const height = day.scheduled > 0 ? Math.max(6, ratio * 100) : 3;
              const full = day.scheduled > 0 && ratio >= 1;
              return (
                <div key={day.key} className="group flex flex-1 flex-col items-center gap-2">
                  <span
                    className={[
                      "font-mono text-[11px] font-semibold tabular-nums transition-colors",
                      day.isToday ? "text-brand" : "text-ink-soft",
                      full ? "text-achievement" : "",
                    ].join(" ")}
                  >
                    {day.completed}/{day.scheduled}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center">
                    <motion.div
                      className={[
                        "relative w-full max-w-9 origin-bottom rounded-t-lg transition-shadow duration-200",
                        full
                          ? "bg-gradient-to-t from-achievement to-warn"
                          : day.isToday
                            ? "bg-gradient-to-t from-brand to-brand-2"
                            : "bg-gradient-to-t from-brand/40 to-brand-2/40",
                        "group-hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_18%,transparent)]",
                      ].join(" ")}
                      initial={reduce ? false : { scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.55, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: `${height}%` }}
                      title={`${day.label}: ${day.completed} of ${day.scheduled} goals`}
                    >
                      {full ? (
                        <StarIcon
                          size={14}
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-achievement"
                        />
                      ) : null}
                    </motion.div>
                  </div>
                  <span
                    className={[
                      "text-xs font-semibold",
                      day.isToday ? "text-brand" : "text-ink-soft",
                    ].join(" ")}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="sr-only">
        {days
          .map((d) => `${d.label}: ${d.completed} of ${d.scheduled} goals`)
          .join(". ")}
        .
      </p>
    </Card>
  );
}
