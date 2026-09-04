"use client";

import type { Reflection } from "@/types";

const FIELDS: { key: keyof Omit<Reflection, "id" | "weekKey" | "createdAt">; label: string; tone: string }[] = [
  { key: "wentWell", label: "Went well", tone: "text-good" },
  { key: "wentWrong", label: "Didn't go as planned", tone: "text-bad" },
  { key: "win", label: "Biggest win", tone: "text-brand" },
  { key: "lesson", label: "Biggest lesson", tone: "text-info" },
  { key: "nextWeek", label: "Plans for next week", tone: "text-ink-soft" },
];

/**
 * The five answers of a saved reflection, rendered in full. Shared by the
 * current-week (locked) view and the previous-reflections history.
 */
export function ReflectionContent({ reflection }: { reflection: Reflection }) {
  const answered = FIELDS.filter((f) => reflection[f.key].trim());
  if (answered.length === 0) {
    return <p className="text-sm italic text-ink-soft">No answers written this week.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {answered.map((f) => (
        <p key={f.key} className="text-sm leading-relaxed text-ink">
          <span className={`font-bold ${f.tone}`}>{f.label} · </span>
          {reflection[f.key]}
        </p>
      ))}
    </div>
  );
}