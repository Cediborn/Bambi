"use client";

import { Reveal } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { AchievementCard } from "@/features/achievements/AchievementCard";
import { TrophyIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { ACHIEVEMENT_CATEGORIES, evaluateAchievements, unlockedCount } from "@/utils/achievements";

export default function AchievementsPage() {
  const { state } = useApp();
  const achievements = evaluateAchievements(state);
  const unlocked = unlockedCount(state);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Achievements"
          subtitle={
            unlocked > 0
              ? `You've unlocked ${unlocked} of ${achievements.length} so far. Every one was earned by showing up.`
              : "Badges for showing up. First goal, first streak, first entry."
          }
          actions={
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 font-mono text-sm font-bold tabular-nums text-ink shadow-card">
              <TrophyIcon size={16} className="text-achievement" />
              {unlocked}/{achievements.length}
            </span>
          }
        />
      </Reveal>

      {ACHIEVEMENT_CATEGORIES.map((category, ci) => {
        const items = achievements.filter((a) => a.category === category.key);
        if (items.length === 0) return null;
        const unlockedInGroup = items.filter((a) => a.unlocked).length;
        return (
          <section key={category.key} aria-label={category.label}>
            <Reveal delay={ci * 0.03}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">
                    {category.label}
                  </h2>
                  <p className="text-xs text-ink-soft">{category.blurb}</p>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-ink-soft">
                  {unlockedInGroup}/{items.length}
                </span>
              </div>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
              {items.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i * 0.04, 0.3)}>
                  <AchievementCard achievement={a} />
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
