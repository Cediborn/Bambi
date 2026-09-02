"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { JournalEntry } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { CheckCircleIcon, PencilIcon, SendIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { todayKey } from "@/utils/dates";

interface JournalFormProps {
  entry?: JournalEntry;
  onSaved?: () => void;
}

/**
 * JournalForm — edit today's journal entry with clear state feedback.
 *
 * States:
 * - **editing**: normal form with mood + text + Update entry button
 * - **saved**: entry saved, button shows ✓ Entry Updated (dimmed), Make Changes available
 * - **saving**: briefly while upsert runs (button shows "Saving…")
 *
 * The component tracks whether the current form content differs from the
 * last-saved snapshot so the Update button is disabled when nothing changed.
 */
export function JournalForm({ entry, onSaved }: JournalFormProps) {
  const { api } = useApp();

  // Form state
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [content, setContent] = useState(entry?.content ?? "");

  // Tracks what was last persisted so we can detect unsaved changes
  const savedRef = useRef({ mood: entry?.mood ?? null, content: entry?.content ?? "" });

  // UI state machine: "editing" | "saving" | "saved"
  const [phase, setPhase] = useState<"editing" | "saving" | "saved">("editing");

  // Reset form state when the entry prop changes (e.g. after a fresh load)
  useEffect(() => {
    setMood(entry?.mood ?? null);
    setContent(entry?.content ?? "");
    savedRef.current = { mood: entry?.mood ?? null, content: entry?.content ?? "" };
    setPhase("editing");
  }, [entry?.id, entry?.mood, entry?.content]);

  const hasChanges =
    mood !== savedRef.current.mood || content.trim() !== savedRef.current.content.trim();

  const valid = content.trim().length > 0 && mood !== null;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!valid || phase === "saving") return;
      setPhase("saving");
      api.upsertJournal(entry?.date ?? todayKey(), mood!, content.trim());
      savedRef.current = { mood, content: content.trim() };
      setPhase("saved");
      onSaved?.();
    },
    [api, entry?.date, mood, content, valid, phase, onSaved]
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
            Your journal entry for today has been saved.
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
        <span className="text-sm font-semibold text-ink">How did today feel?</span>
        <div className="pt-1">
          <MoodPicker value={mood} onChange={setMood} />
        </div>
      </div>
      <Field label="Write a few lines" htmlFor="journal-text" hint="What happened today?">
        <Textarea
          id="journal-text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I…"
          maxLength={1200}
        />
      </Field>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!valid || !hasChanges}
          icon={phase === "saving" ? undefined : <SendIcon size={16} />}
        >
          {phase === "saving"
            ? "Saving…"
            : entry
              ? hasChanges
                ? "Update entry"
                : "No changes"
              : "Save entry"}
        </Button>
      </div>
    </form>
  );
}
