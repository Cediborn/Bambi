"use client";

import { useState } from "react";
import Link from "next/link";
import type { JournalEntry } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MoodPicker, moodLabel } from "@/components/ui/MoodPicker";
import { ArrowRightIcon, BoltIcon, QuoteIcon, SparklesIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { todayKey } from "@/utils/dates";
import { XP_PER_ENTRY } from "@/utils/xp";

export function CheckInCard() {
  const { state, api } = useApp();
  const sounds = useSounds();
  const today = todayKey();
  const entry = state.journal.find((e) => e.date === today);

  if (entry) {
    return <Summary entry={entry} />;
  }
  // Swapping between the two branches remounts the prompt, so its picker
  // state resets whenever today's entry appears or is deleted.
  return (
    <Prompt onCheckIn={(mood) => { sounds.checkin(); api.upsertJournal(today, mood, ""); }} />
  );
}

function Prompt({ onCheckIn }: { onCheckIn: (mood: number) => void }) {
  const [mood, setMood] = useState<number | null>(null);

  return (
    <Card tone="sky" size="featured">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sky/10 text-sky">
          <QuoteIcon size={20} />
        </span>
        <div>
          <p className="font-display text-base font-bold text-ink">How are you feeling?</p>
          <p className="text-xs text-ink-soft">One tap · +{XP_PER_ENTRY} XP</p>
        </div>
      </div>

      <MoodPicker value={mood} onChange={setMood} />

      <div className="mt-5 flex justify-end">
        <Button onClick={() => mood !== null && onCheckIn(mood)} disabled={mood === null}>
          Reflect
          <ArrowRightIcon size={16} />
        </Button>
      </div>
    </Card>
  );
}

/** One short, calm line per mood — no cheerleading, just acknowledgment. */
const MOOD_LINES: Record<number, string> = {
  1: "Tough days count too — they count double.",
  2: "Meh is fine. Not everything has to feel big.",
  3: "Okay is a solid day. Log it and move on.",
  4: "Good. That's a day worth keeping.",
  5: "Amazing. Don't forget this feeling.",
};

function Summary({ entry }: { entry: JournalEntry }) {
  return (
    <Card tone="sky" className="animate-pop p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-mint/15 text-good">
          <SparklesIcon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-ink">Checked in</p>
          <p className="mt-1 text-sm text-ink-soft">
            You&apos;re feeling{" "}
            <span className="font-bold text-ink">{moodLabel(entry.mood)}</span>.{" "}
            {MOOD_LINES[entry.mood] ?? MOOD_LINES[3]}{" "}
            {entry.content
              ? "A note too — good."
              : "Want to write a few lines about it?"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <QuoteIcon size={15} />
              Open journal
              <ArrowRightIcon size={15} />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
              <BoltIcon size={13} />
              +{XP_PER_ENTRY} XP
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
