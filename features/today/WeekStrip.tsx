"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { ArrowRightIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { weekSummary } from "@/utils/streaks";

/** Compact seven-day rhythm strip — the week at a glance. */
export function WeekStrip() {
  const { state } = useApp();
  const days = weekSummary(state);
  const doneThisWeek = days.reduce((sum, d) => sum + d.completed, 0);

  return (
    <Card tone="emerald" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold text-ink">This week</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {doneThisWeek > 0 ? (
              <span className="font-mono font-semibold tabular-nums text-ink">{doneThisWeek}</span>
            ) : (
              "Your rhythm will show here"
            )}{" "}
            {doneThisWeek > 0 ? "goals completed" : ""}
          </p>
        </div>
        <Link
          href="/growth"
          className="inline-flex items-center gap-1 text-xs font-bold text-good transition-colors hover:text-good/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Growth
          <ArrowRightIcon size={13} />
        </Link>
      </div>

      {/* Days grow outward from the center, one at a time (decorative strip) */}
      <div aria-hidden="true">
      <Stagger
        className="mt-4 flex items-center justify-between"
        delayChildren={0.15}
        stagger={0.05}
      >
        {days.map((day) => {
          const ratio = day.scheduled > 0 ? day.completed / day.scheduled : 0;
          const size =
            ratio >= 1 ? "size-3.5" : ratio > 0 ? "size-3" : "size-2.5";
          const fill =
            ratio >= 1
              ? "bg-mint"
              : ratio > 0
                ? "bg-brand/50"
                : "bg-line";
          return (
            <StaggerItem key={day.key}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`rounded-full transition-all duration-300 ${size} ${fill} ${
                    day.isToday ? "ring-2 ring-brand ring-offset-2 ring-offset-card" : ""
                  }`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    day.isToday ? "text-brand" : "text-ink-soft/70"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
      </div>
    </Card>
  );
}
