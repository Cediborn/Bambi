"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArrowRightIcon, LockIcon, TrophyIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { evaluateAchievements } from "@/utils/achievements";

/** Achievements at a glance: unlocked count plus the next one to chase. */
export function AchievementsStrip() {
  const { state } = useApp();
  const achievements = evaluateAchievements(state);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const nextUp = achievements.find((a) => !a.unlocked);

  return (
    <Card tone="gold" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-base font-bold text-ink">Achievements</p>
        <span className="font-mono inline-flex items-center gap-1.5 rounded-full bg-achievement/15 px-2.5 py-1 text-xs font-bold tabular-nums text-achievement">
          <TrophyIcon size={13} />
          {unlocked}/{achievements.length}
        </span>
      </div>

      {nextUp ? (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
              <LockIcon size={14} className="shrink-0 text-ink-soft" />
              <span className="truncate">{nextUp.title}</span>
            </p>
            <span className="shrink-0 text-xs font-semibold text-ink-soft">
              {nextUp.progress}/{nextUp.target}
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar
              value={nextUp.target > 0 ? nextUp.progress / nextUp.target : 0}
              tone="bg-gradient-to-r from-achievement to-warn"
              ariaLabel={`${nextUp.title} progress`}
            />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm font-medium text-ink-soft">Every badge earned. Impressive.</p>
      )}

      <Link
        href="/achievements"
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-2 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        See all
        <ArrowRightIcon size={13} />
      </Link>
    </Card>
  );
}
