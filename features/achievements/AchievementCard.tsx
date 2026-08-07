"use client";

import type { Achievement, AchievementCategory } from "@/utils/achievements";
import { HoverLift } from "@/components/ui/Motion";
import { Card, type CardTone } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  BoltIcon,
  BookIcon,
  CheckCircleIcon,
  CrownIcon,
  FlameIcon,
  HeartIcon,
  LeafIcon,
  LockIcon,
  MedalIcon,
  PenLineIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
} from "@/components/icons";

const ICONS = {
  flame: FlameIcon,
  trophy: TrophyIcon,
  bolt: BoltIcon,
  target: TargetIcon,
  pen: PenLineIcon,
  star: StarIcon,
  crown: CrownIcon,
  book: BookIcon,
  leaf: LeafIcon,
  medal: MedalIcon,
  heart: HeartIcon,
} as const;

/** Each category gets its own temperature on the card. */
const CATEGORY_TONE: Record<AchievementCategory, CardTone> = {
  growth: "emerald",
  habits: "indigo",
  consistency: "warn",
  learning: "sky",
  journal: "default",
  health: "emerald",
  social: "violet",
  special: "gold",
};

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICONS[achievement.icon];
  const progressPct = achievement.target > 0 ? achievement.progress / achievement.target : 0;

  return (
    <HoverLift className="h-full">
      <Card
        tone={achievement.unlocked ? CATEGORY_TONE[achievement.category] : "default"}
        className={`flex h-full flex-col gap-3 p-5 ${
          achievement.unlocked ? "" : "opacity-90"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={[
              "flex size-11 items-center justify-center rounded-xl",
              achievement.unlocked
                ? "bg-gradient-to-br from-brand to-brand-2 text-white shadow-card"
                : "bg-surface text-ink-soft",
            ].join(" ")}
          >
            <Icon size={22} />
          </span>
          {achievement.unlocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-bold text-good">
              <CheckCircleIcon size={12} />
              Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-soft">
              <LockIcon size={12} />
              Locked
            </span>
          )}
        </div>

        <div>
          <h3
            className={[
              "font-display text-sm font-bold",
              achievement.unlocked ? "text-ink" : "text-ink-soft",
            ].join(" ")}
          >
            {achievement.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{achievement.description}</p>
        </div>

        {!achievement.unlocked ? (
          <div className="mt-auto space-y-1.5">
            <ProgressBar value={progressPct} ariaLabel={`${achievement.title} progress`} />
            <p className="font-mono text-right text-[11px] font-semibold tabular-nums text-ink-soft">
              {achievement.progress}/{achievement.target}
            </p>
          </div>
        ) : null}
      </Card>
    </HoverLift>
  );
}
