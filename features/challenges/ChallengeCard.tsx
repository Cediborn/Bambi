"use client";

import type { Challenge } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BoltIcon, CheckCircleIcon, FlagIcon, TrashIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { todayKey } from "@/utils/dates";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { api } = useApp();
  const sounds = useSounds();
  const today = todayKey();

  const doneCount = challenge.doneDates.length;
  const complete = Boolean(challenge.completedAt);
  const checkedInToday = challenge.doneDates.includes(today);
  const ratio = Math.min(1, doneCount / challenge.days);
  const startedToday = challenge.startedAt.slice(0, 10) === today;
  const dayNumber = Math.min(challenge.days, doneCount + 1);

  const toggle = () => {
    if (complete) return;
    api.checkinChallenge(challenge.id, today);
    if (!checkedInToday) sounds.complete();
  };

  return (
    <Card tone={complete ? "gold" : "default"} hover className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={[
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              complete ? "bg-achievement/15 text-achievement" : "bg-rose/15 text-rose",
            ].join(" ")}
          >
            {complete ? <CheckCircleIcon size={22} /> : <FlagIcon size={22} />}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-bold text-ink">{challenge.title}</h3>
            <p className="text-xs text-ink-soft">
              Day <span className="font-mono font-semibold tabular-nums">{dayNumber}</span> of{" "}
              <span className="font-mono font-semibold tabular-nums">{challenge.days}</span>
              {complete ? " · finished" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => api.removeChallenge(challenge.id)}
          aria-label={`Remove ${challenge.title}`}
          className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-bad/10 hover:text-bad focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bad"
        >
          <TrashIcon size={16} />
        </button>
      </div>

      <div>
        <ProgressBar
          value={ratio}
          tone={complete ? "bg-gradient-to-r from-achievement to-warn" : "bg-gradient-to-r from-rose to-brand"}
          ariaLabel={`${challenge.title} progress`}
        />
        <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] font-semibold tabular-nums text-ink-soft">
          <span>
            {doneCount}/{challenge.days} days
          </span>
          <span className="inline-flex items-center gap-1 text-achievement">
            <BoltIcon size={12} />
            +{challenge.xpReward} XP
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">
          {complete
            ? "Challenge complete. One more proof of consistency."
            : checkedInToday
              ? "Checked in today. See you tomorrow."
              : startedToday
                ? "Started today. Showing up is the whole game."
                : "A check-in a day keeps the streak alive."}
        </p>
        <Button
          size="sm"
          onClick={toggle}
          disabled={complete || checkedInToday}
          icon={checkedInToday ? <CheckCircleIcon size={14} /> : undefined}
        >
          {complete ? "Done" : checkedInToday ? "Checked in" : "Check in"}
        </Button>
      </div>
    </Card>
  );
}
