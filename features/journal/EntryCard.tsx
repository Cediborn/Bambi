"use client";

import { useState } from "react";
import type { JournalEntry } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MOODS, moodLabel } from "@/components/ui/MoodPicker";
import { TrashIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { fullDate } from "@/utils/dates";

const MOOD_COLOR: Record<number, string> = Object.fromEntries(MOODS.map((m) => [m.value, m.color]));

export function EntryCard({ entry }: { entry: JournalEntry }) {
  const { api } = useApp();
  const [confirming, setConfirming] = useState(false);

  return (
    <Card size="compact">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="size-3.5 rounded-full"
            style={{ backgroundColor: MOOD_COLOR[entry.mood] ?? "#94A3B8" }}
          />
          <div>
            <p className="text-sm font-bold text-ink">{fullDate(entry.date)}</p>
            <p className="text-xs font-medium text-ink-soft">
              Feeling <span className="font-semibold text-ink">{moodLabel(entry.mood)}</span>
            </p>
          </div>
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft">Delete this entry?</span>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                api.removeJournal(entry.id);
                setConfirming(false);
              }}
            >
              Yes, delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Keep
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete entry from ${entry.date}`}
            className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-bad focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <TrashIcon size={16} />
          </button>
        )}
      </div>

      {entry.content ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {entry.content}
        </p>
      ) : null}
    </Card>
  );
}
