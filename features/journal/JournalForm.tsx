"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import type { JournalEntry } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { CheckCircleIcon, CheckIcon, PencilIcon, SendIcon, XIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { fullDate, todayKey } from "@/utils/dates";

interface JournalFormProps {
  entry?: JournalEntry;
  onSaved?: () => void;
  onCancel?: () => void;
}

/**
 * JournalForm — create a new entry or edit today's / any past journal entry.
 *
 * When an `entry` is provided, the form updates that exact entry in place
 * (same id, date, createdAt) via `updateJournal`. When no entry is provided,
 * it creates a new entry via `upsertJournal`.
 *
 * States:
 * - **editing**: normal form with mood + text + Save/Update button
 * - **saved**: entry saved, button shows ✓ Entry Updated, Make Changes available
 * - **saving**: briefly while the update runs (button shows "Saving…")
 *
 * The component tracks whether the current form content differs from the
 * last-saved snapshot so the button is disabled when nothing changed.
 */
export function JournalForm({ entry, onSaved, onCancel }: JournalFormProps) {
  const { api } = useApp();

  // Form state
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [content, setContent] = useState(entry?.content ?? "");

  // What was last persisted, so unsaved changes can be detected. This is read
  // during render to derive hasChanges, so it lives in state rather than a ref.
  const [saved, setSaved] = useState({
    mood: entry?.mood ?? null,
    content: entry?.content ?? "",
  });

  // UI state machine: "editing" | "saving" | "saved"
  const [phase, setPhase] = useState<"editing" | "saving" | "saved">("editing");

  // The entry this form is currently synced to. When the entry prop changes
  // (e.g. after a fresh load), the draft resets to match it — done as a
  // render-time state adjustment (the documented pattern for syncing state to
  // a prop) rather than an effect.
  const [syncedEntry, setSyncedEntry] = useState({
    id: entry?.id,
    mood: entry?.mood ?? null,
    content: entry?.content ?? "",
  });
  if (
    syncedEntry.id !== entry?.id ||
    syncedEntry.mood !== (entry?.mood ?? null) ||
    syncedEntry.content !== (entry?.content ?? "")
  ) {
    const next = { id: entry?.id, mood: entry?.mood ?? null, content: entry?.content ?? "" };
    setSyncedEntry(next);
    setMood(next.mood);
    setContent(next.content);
    setSaved(next);
    setPhase("editing");
  }

  const hasChanges = mood !== saved.mood || content.trim() !== saved.content.trim();

  const valid = content.trim().length > 0 && mood !== null;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!valid || phase === "saving") return;
      setPhase("saving");
      const trimmed = content.trim();
      if (entry?.id) {
        api.updateJournal(entry.id, mood!, trimmed);
      } else {
        api.upsertJournal(entry?.date ?? todayKey(), mood!, trimmed);
      }
      setSaved({ mood, content: trimmed });
      setPhase("saved");
      onSaved?.();
    },
    [api, entry?.id, entry?.date, mood, content, valid, phase, onSaved]
  );

  const handleMakeChanges = () => {
    setPhase("editing");
  };

  if (phase === "saved") {
    return (
      <div className="space-y-4">
        {/* Read-only preview of saved content */}
        <div className="rounded-xl border border-good/20 bg-good/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={16} className="text-good" />
            <p className="text-sm font-semibold text-good">Entry Updated</p>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            {entry
              ? `Your journal entry for ${fullDate(entry.date)} has been saved.`
              : "Your journal entry for today has been saved."}
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleMakeChanges}
            icon={<PencilIcon size={15} />}
          >
            Make Changes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-ink">
          {entry ? `How did you feel on ${fullDate(entry.date)}?` : "How did today feel?"}
        </span>
        <div className="pt-1">
          <MoodPicker value={mood} onChange={setMood} />
        </div>
      </div>
      <Field label="Write a few lines" htmlFor="journal-text" hint="What happened?">
        <Textarea
          id="journal-text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I…"
        />
      </Field>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            icon={<XIcon size={15} />}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={!valid || !hasChanges}
          icon={phase === "saving" ? undefined : entry ? <CheckIcon size={16} /> : <SendIcon size={16} />}
        >
          {phase === "saving"
            ? "Saving…"
            : entry
              ? hasChanges
                ? "Save Changes"
                : "No changes"
              : "Save entry"}
        </Button>
      </div>
    </form>
  );
}
