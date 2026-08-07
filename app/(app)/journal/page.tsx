"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { JournalForm } from "@/features/journal/JournalForm";
import { EntryCard } from "@/features/journal/EntryCard";
import { MoodPanel } from "@/features/journal/MoodPanel";
import { FlameIcon, PenLineIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { todayKey } from "@/utils/dates";
import { journalStreak } from "@/utils/streaks";

export default function JournalPage() {
  const { state } = useApp();
  const today = todayKey();
  const todayEntry = state.journal.find((e) => e.date === today);
  const past = state.journal
    .filter((e) => e.date !== today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const streak = journalStreak(state.journal);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal"
        subtitle="Three honest lines are enough. No audience, no pressure."
        actions={
          streak > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-bold text-tangerine shadow-card">
              <FlameIcon size={15} />
              {streak}-day journal streak
            </span>
          ) : undefined
        }
      />

      {/* Mood tracker */}
      <Reveal>
        <MoodPanel />
      </Reveal>

      {/* Today's entry */}
      <Reveal delay={0.05}>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display mb-4 text-base font-bold text-ink">
            {todayEntry ? "Today's entry" : "Write today's entry"}
          </h2>
          <JournalForm entry={todayEntry} />
        </Card>
      </Reveal>

      {/* History */}
      {past.length > 0 ? (
        <section aria-label="Past entries">
          <h2 className="font-display mb-3 text-base font-bold text-ink">Previous entries</h2>
          <Stagger className="space-y-3" stagger={0.05}>
            {past.map((entry) => (
              <StaggerItem key={entry.id}>
                <EntryCard entry={entry} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : (
        <Reveal>
          <EmptyState
            icon={<PenLineIcon size={26} />}
            title="No entries yet"
            description="Every check-in lands here. Over time it reads like a map of how far you've come."
          />
        </Reveal>
      )}
    </div>
  );
}
