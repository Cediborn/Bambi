"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReflectionForm } from "@/features/reflection/ReflectionForm";
import { ReflectionContent } from "@/features/reflection/ReflectionContent";
import { CheckCircleIcon, PencilIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { todayKey, weekKeyOf, shiftKey, fullDate } from "@/utils/dates";

export default function ReflectionPage() {
  const { state } = useApp();
  const [editingWeek, setEditingWeek] = useState<string | null>(null);

  const weekKey = weekKeyOf(todayKey());
  const current = state.reflections.find((r) => r.weekKey === weekKey);
  const past = state.reflections
    .filter((r) => r.weekKey !== weekKey)
    .sort((a, b) => (a.weekKey < b.weekKey ? 1 : -1));
  // The next reflection unlocks on the Monday of the following week.
  const nextWeek = shiftKey(weekKey, 7);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reflection"
        subtitle="Once a week, look back without judgment. The five questions below are all you need."
      />

      <Reveal>
        {current ? (
          <Card tone="sky" size="featured">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-good/15 text-good">
                <CheckCircleIcon size={20} />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-ink">
                  This week&apos;s reflection
                </h2>
                <p className="text-xs text-ink-soft">Saved · week of {fullDate(weekKey)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-good/30 bg-good/10 px-4 py-3 text-sm font-semibold text-good">
              Your reflection for this week is complete. The next one opens on {fullDate(nextWeek)}.
            </div>

            <div className="mt-5">
              <ReflectionContent reflection={current} />
            </div>
          </Card>
        ) : (
          <ReflectionForm />
        )}
      </Reveal>

      {past.length > 0 ? (
        <section aria-label="Previous reflections">
          <h2 className="font-display mb-3 text-base font-bold text-ink">Previous reflections</h2>
          <div className="space-y-3">
            {past.map((r, i) => (
              <Reveal key={r.weekKey} delay={i * 0.05}>
                {editingWeek === r.weekKey ? (
                  <Card className="p-5">
                    <ReflectionForm
                      existing={r}
                      onSaved={() => setEditingWeek(null)}
                      onCancel={() => setEditingWeek(null)}
                    />
                  </Card>
                ) : (
                  <Card className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                        Week of {fullDate(r.weekKey)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingWeek(r.weekKey)}
                        icon={<PencilIcon size={14} />}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="mt-3">
                      <ReflectionContent reflection={r} />
                    </div>
                  </Card>
                )}
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}