"use client";

import { Reveal } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/features/growth/StatCard";
import { PomodoroTimer } from "@/features/focus/PomodoroTimer";
import { ActivityIcon, BoltIcon, TimerIcon, TrashIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { todayKey, fullDate } from "@/utils/dates";
import { isScheduledOn } from "@/utils/streaks";

export default function FocusPage() {
  const { state, api } = useApp();
  const today = todayKey();

  const todaySessions = state.focus.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
  const totalMinutes = state.focus.reduce((sum, s) => sum + s.minutes, 0);
  const sessions = [...state.focus]
    .sort((a, b) => (a.endedAt < b.endedAt ? 1 : -1))
    .slice(0, 8);

  const goalsToday = state.habits.filter((h) => isScheduledOn(h, today)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus"
        subtitle="Twenty-five quiet minutes beat two distracted hours. The timer is just a container."
      />

      <div className="grid items-start gap-6 lg:grid-cols-5 lg:gap-8">
        <Reveal className="lg:col-span-3">
          <PomodoroTimer />
        </Reveal>

        <div className="space-y-6 lg:col-span-2">
          <Reveal delay={0.05}>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<TimerIcon size={20} />}
                label="Today"
                value={`${todayMinutes}m`}
                sub={todaySessions.length > 0 ? `${todaySessions.length} session${todaySessions.length === 1 ? "" : "s"}` : "No sessions yet"}
                tone="brand"
              />
              <StatCard
                icon={<BoltIcon size={20} />}
                label="All time"
                value={`${totalMinutes}m`}
                sub={`${state.focus.length} sessions`}
                tone="sky"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {sessions.length === 0 ? (
              <EmptyState
                icon={<ActivityIcon size={24} />}
                title="No deep work yet"
                description="Finish one focus round and it will show up here — a quiet log of your best hours."
              />
            ) : (
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-base font-bold text-ink">Recent sessions</h2>
              <ul className="mt-4 space-y-2.5">
                  {sessions.map((s) => (
                    <li key={s.id} className="group flex items-center justify-between gap-3 rounded-xl bg-surface/60 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold tabular-nums text-ink">
                          {s.minutes} min
                        </p>
                        <p className="text-xs text-ink-soft">{fullDate(s.date)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => api.removeFocusSession(s.id)}
                        aria-label={`Remove ${s.minutes} minute session`}
                        className="rounded-lg p-2 text-ink-soft opacity-0 transition-opacity hover:bg-bad/10 hover:text-bad focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bad group-hover:opacity-100"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </li>
                  ))}
              </ul>
            </Card>
            )}
          </Reveal>

          <Reveal delay={0.15}>
            <p className="flex items-center gap-2 px-1 text-xs text-ink-soft">
              <ActivityIcon size={14} />
              {goalsToday > 0
                ? "Schedule a focus habit — coffee icon — and it shows up in Today's Focus."
                : "Add a habit with the coffee icon to see focus sessions on your dashboard."}
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
