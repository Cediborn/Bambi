"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BoltIcon, CheckCircleIcon, HabitGlyph, SparklesIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { dailyQuest, isQuestDone } from "@/utils/quests";
import { XP_PER_QUEST } from "@/utils/xp";
import { todayKey } from "@/utils/dates";

/** The day's one meaningful task — a nudge, not a checklist. */
export function QuestCard() {
  const { state, api } = useApp();
  const sounds = useSounds();
  const today = todayKey();
  const quest = dailyQuest(today, state.profile?.interests);
  const done = isQuestDone(state, today);
  const [xpFlash, setXpFlash] = useState(false);

  const complete = () => {
    if (done) return;
    api.toggleQuest(today);
    sounds.quest();
    setXpFlash(true);
    window.setTimeout(() => setXpFlash(false), 1400);
  };

  return (
    <Card tone="gold" size="featured" className="relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={[
              "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
              done ? "bg-mint/15 text-good" : "bg-achievement/15 text-achievement",
            ].join(" ")}
          >
            {done ? <CheckCircleIcon size={24} /> : <HabitGlyph name={quest.icon} size={24} />}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              Today&apos;s quest
            </p>
            <h2
              className={[
                "font-display mt-0.5 truncate text-lg font-extrabold tracking-tight transition-colors",
                done ? "text-ink-soft line-through decoration-line" : "text-ink",
              ].join(" ")}
            >
              {quest.title}
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft">{done ? "Quest complete — rest of the day is yours." : quest.hint}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-achievement/15 px-3 py-1.5 text-sm font-extrabold text-achievement">
            <BoltIcon size={15} />
            +{quest.rewardXp} XP
          </span>
          <div className="relative">
            <Button
              onClick={complete}
              disabled={done}
              icon={done ? <CheckCircleIcon size={16} /> : <SparklesIcon size={16} />}
            >
              {done ? "Done" : "Complete"}
            </Button>
            {xpFlash ? (
              <span
                aria-hidden="true"
                className="animate-xp-float pointer-events-none absolute -top-3 right-0 rounded-full bg-achievement px-2 py-0.5 text-[11px] font-extrabold text-ink shadow-card"
              >
                +{XP_PER_QUEST} XP
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
