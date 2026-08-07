"use client";

import { Reveal } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ReflectionForm } from "@/features/reflection/ReflectionForm";
import { useApp } from "@/hooks/useApp";
import { todayKey, weekKeyOf, fullDate } from "@/utils/dates";

export default function ReflectionPage() {
  const { state } = useApp();
  const weekKey = weekKeyOf(todayKey());
  const current = state.reflections.find((r) => r.weekKey === weekKey);
  const past = state.reflections
    .filter((r) => r.weekKey !== weekKey)
    .sort((a, b) => (a.weekKey < b.weekKey ? 1 : -1));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reflection"
        subtitle="Once a week, look back without judgment. The five questions below are all you need."
      />

      <Reveal>
        <ReflectionForm existing={current} />
      </Reveal>

      {past.length > 0 ? (
        <section aria-label="Past reflections">
          <h2 className="font-display mb-3 text-base font-bold text-ink">Previous weeks</h2>
          <div className="space-y-3">
            {past.map((r, i) => (
              <Reveal key={r.weekKey} delay={i * 0.05}>
                <Card className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                    Week of {fullDate(r.weekKey)}
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {r.wentWell ? (
                      <p className="text-sm text-ink">
                        <span className="font-bold text-good">Went well · </span>
                        {r.wentWell}
                      </p>
                    ) : null}
                    {r.win ? (
                      <p className="text-sm text-ink">
                        <span className="font-bold text-brand">Win · </span>
                        {r.win}
                      </p>
                    ) : null}
                    {r.lesson ? (
                      <p className="text-sm text-ink">
                        <span className="font-bold text-info">Lesson · </span>
                        {r.lesson}
                      </p>
                    ) : null}
                    {r.nextWeek ? (
                      <p className="text-sm text-ink">
                        <span className="font-bold text-ink-soft">Next week · </span>
                        {r.nextWeek}
                      </p>
                    ) : null}
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
