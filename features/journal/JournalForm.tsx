"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { JournalEntry } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { SendIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { todayKey } from "@/utils/dates";

interface JournalFormProps {
  entry?: JournalEntry;
  onSaved?: () => void;
}

export function JournalForm({ entry, onSaved }: JournalFormProps) {
  const { api } = useApp();
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [content, setContent] = useState(entry?.content ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || mood === null) return;
    api.upsertJournal(entry?.date ?? todayKey(), mood, content.trim());
    onSaved?.();
  };

  const valid = content.trim().length > 0 && mood !== null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-ink">How did today feel?</span>
        <div className="pt-1">
          <MoodPicker value={mood} onChange={setMood} />
        </div>
      </div>        <Field label="Write a few lines" htmlFor="journal-text" hint="What happened today?">
        <Textarea
          id="journal-text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I…"
          maxLength={1200}
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={!valid} icon={<SendIcon size={16} />}>
          {entry ? "Update entry" : "Save entry"}
        </Button>
      </div>
    </form>
  );
}
