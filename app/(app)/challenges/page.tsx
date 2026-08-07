"use client";

import { useState } from "react";
import { Reveal, HoverLift } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChallengeCard } from "@/features/challenges/ChallengeCard";
import { BoltIcon, FlagIcon, MedalIcon, PlusIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";

const STARTERS = [
  { title: "30 days of reading", days: 30, blurb: "Fifteen pages a day, no exceptions." },
  { title: "30 days of movement", days: 30, blurb: "Walk, stretch, dance — just move." },
  { title: "30 days of gratitude", days: 30, blurb: "Three good things, written down." },
  { title: "7 days of early starts", days: 7, blurb: "Up before the rush, seven mornings." },
];

const DAY_OPTIONS = [7, 14, 21, 30];

export default function ChallengesPage() {
  const { state, api } = useApp();
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(30);
  const [customOpen, setCustomOpen] = useState(false);

  const active = state.challenges.filter((c) => !c.completedAt);
  const completed = state.challenges.filter((c) => c.completedAt);
  const xpEarned = completed.reduce((sum, c) => sum + c.xpReward, 0);

  const startCustom = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    api.addChallenge({ title: trimmed, days, xpReward: days * 10 });
    setTitle("");
    setCustomOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Challenges"
        subtitle="Pick a stretch that fits. Thirty small days outrank one perfect one."
        actions={
          completed.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-sm font-bold tabular-nums text-achievement shadow-card">
              <BoltIcon size={15} />
              +{xpEarned} XP from challenges
            </span>
          ) : undefined
        }
      />

      {/* Starters */}
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STARTERS.map((s) => (
            <HoverLift key={s.title}>
              <Card tone="warn" size="compact" className="flex h-full flex-col gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-rose/15 text-rose">
                  <FlagIcon size={20} />
                </span>
                <div className="flex-1">
                  <p className="font-display text-sm font-bold text-ink">{s.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.blurb}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => api.addChallenge({ title: s.title, days: s.days, xpReward: s.days * 10 })}
                >
                  Start
                </Button>
              </Card>
            </HoverLift>
          ))}
        </div>
      </Reveal>

      {/* Custom challenge */}
      <Reveal delay={0.05}>
        <Card tone="violet" className="p-5 sm:p-6">
          {customOpen ? (
            <div className="space-y-4">
              <Field label="Challenge name" htmlFor="challenge-title" hint="Keep it concrete — one verb, one target.">
                <Input
                  id="challenge-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 21 days without snooze"
                  maxLength={48}
                  onKeyDown={(e) => e.key === "Enter" && startCustom()}
                />
              </Field>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Length</p>
                <div role="group" aria-label="Challenge length" className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={days === d}
                      onClick={() => setDays(d)}
                      className={[
                        "rounded-full px-4 py-2 font-mono text-sm font-bold tabular-nums transition-all duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        days === d ? "bg-brand text-white shadow-card" : "bg-surface text-ink-soft hover:text-ink",
                      ].join(" ")}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={startCustom} disabled={!title.trim()} icon={<PlusIcon size={16} />}>
                  Start challenge · +{days * 10} XP
                </Button>
                <Button variant="ghost" onClick={() => setCustomOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-2/15 text-brand-2">
                  <PlusIcon size={20} />
                </span>
                <div>
                  <p className="font-bold text-ink">Make it yours</p>
                  <p className="text-sm text-ink-soft">A custom length, a custom habit, your own rules.</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setCustomOpen(true)}>
                New custom challenge
              </Button>
            </div>
          )}
        </Card>
      </Reveal>

      {/* Active challenges */}
      <section aria-label="Active challenges">
        {active.length === 0 && completed.length === 0 ? (
          <Reveal>
            <EmptyState
              icon={<MedalIcon size={26} />}
              title="No challenges yet"
              description="Every forest starts with one seed. Pick a starter above — thirty days from now, you'll be glad you did."
            />
          </Reveal>
        ) : (
          <div className="space-y-3">
            {active.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}>
                <ChallengeCard challenge={c} />
              </Reveal>
            ))}
            {completed.length > 0 ? (
              <div className="pt-2">
                <h2 className="font-display mb-3 text-base font-bold text-ink">Finished</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {completed.map((c) => (
                    <ChallengeCard key={c.id} challenge={c} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
