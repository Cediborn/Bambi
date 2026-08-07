"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { ClipboardIcon, CheckCircleIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { todayKey, weekKeyOf } from "@/utils/dates";
import type { Reflection } from "@/types";

const PROMPTS = [
  { key: "wentWell", label: "What went well?", placeholder: "One or two things, honestly." },
  { key: "wentWrong", label: "What didn't?", placeholder: "No self-flagellation — just the facts." },
  { key: "win", label: "Biggest win", placeholder: "The moment you'd want to remember." },
  { key: "lesson", label: "Biggest lesson", placeholder: "What will you carry into next week?" },
  { key: "nextWeek", label: "Plans for next week", placeholder: "One small intention is enough." },
] as const;

type PromptKey = (typeof PROMPTS)[number]["key"];

export function ReflectionForm({ existing }: { existing?: Reflection }) {
  const { api } = useApp();
  const weekKey = weekKeyOf(todayKey());

  const [values, setValues] = useState<Record<PromptKey, string>>({
    wentWell: existing?.wentWell ?? "",
    wentWrong: existing?.wentWrong ?? "",
    win: existing?.win ?? "",
    lesson: existing?.lesson ?? "",
    nextWeek: existing?.nextWeek ?? "",
  });
  const [saved, setSaved] = useState(Boolean(existing));

  const set = (key: PromptKey, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (saved) setSaved(false);
  };

  const save = () => {
    api.upsertReflection(weekKey, values);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const filled = PROMPTS.filter((p) => values[p.key].trim()).length;

  return (
    <Card tone="sky" size="featured">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-info/15 text-info">
          <ClipboardIcon size={20} />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            {existing ? "This week's reflection" : "Weekly reflection"}
          </h2>
          <p className="text-xs text-ink-soft">
            {filled}/5 answered · once a week is enough
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {PROMPTS.map((p) => (
          <Field key={p.key} label={p.label} htmlFor={`refl-${p.key}`}>
            <Textarea
              id={`refl-${p.key}`}
              value={values[p.key]}
              onChange={(e) => set(p.key, e.target.value)}
              placeholder={p.placeholder}
              rows={3}
              maxLength={600}
            />
          </Field>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          onClick={save}
          disabled={filled === 0}
          icon={saved ? <CheckCircleIcon size={16} /> : undefined}
        >
          {saved ? "Saved" : "Save reflection"}
        </Button>
      </div>
    </Card>
  );
}
