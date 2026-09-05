"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { HabitCard } from "@/features/habits/HabitCard";
import { HabitForm } from "@/features/habits/HabitForm";
import { ProfileSuggestions } from "@/features/habits/ProfileSuggestions";
import { HabitHistory } from "@/features/habits/HabitHistory";
import { SuggestedHabits } from "@/features/habits/SuggestedHabits";
import { profileSuggestions, type HabitSuggestion } from "@/features/habits/suggestions";
import { PlusIcon, SnowflakeIcon, XIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { freezesAvailable } from "@/utils/streaks";

export default function HabitsPage() {
  const { state } = useApp();
  // "+ New Habits" from the dashboard lands here with ?new=1 — open the
  // habit builder directly, no onboarding required. The (app) layout only
  // renders this page client-side, so `window` is always available.
  const [creating, setCreating] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("new") === "1"
  );
  const [preset, setPreset] = useState<HabitSuggestion | null>(null);
  const freezes = freezesAvailable(state);

  const toggleCreating = () => {
    setCreating((v) => !v);
    setPreset(null);
  };

  const existingNames = new Set(state.habits.map((h) => h.name.toLowerCase()));
  const madeForYou = profileSuggestions(state.profile?.interests ?? [], existingNames);

  const history = state.habits
    .map((habit) => ({ habit, dates: state.completions[habit.id] ?? [] }))
    .filter((h) => h.dates.length > 0)
    .sort((a, b) => b.dates[b.dates.length - 1].localeCompare(a.dates[a.dates.length - 1]));

  return (
    <div>
      <PageHeader
        title="Habits"
        subtitle="Keep each one small enough that you'll do it on your worst day. Consistency beats intensity."
        actions={
          <>
            {freezes > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-sm font-bold text-info shadow-card">
                <SnowflakeIcon size={15} />
                {freezes} {freezes === 1 ? "freeze" : "freezes"}
              </span>
            ) : null}
            <Button onClick={toggleCreating} icon={creating ? <XIcon size={17} /> : <PlusIcon size={17} />}>
              {creating ? "Close" : "New habit"}
            </Button>
          </>
        }
      />

      {creating ? (
        <Card className="animate-fade-up mb-6 p-5 sm:p-6">
          {madeForYou.length > 0 ? (
            <>
              <ProfileSuggestions items={madeForYou} activeId={preset?.id ?? null} onPick={setPreset} />
              <div className="my-5 h-px bg-line" aria-hidden="true" />
            </>
          ) : null}
          <SuggestedHabits activeId={preset?.id ?? null} onPick={setPreset} />
          <div className="my-5 h-px bg-line" aria-hidden="true" />
          <HabitForm
            key={preset?.id ?? "custom"}
            preset={preset}
            onSaved={toggleCreating}
          />
        </Card>
      ) : null}

      {state.habits.length === 0 && !creating ? (
        <EmptyState
          illustration="sprout"
          title="No habits yet"
          description="Nothing here yet — and that's fine. Every forest starts with one seed. Start smaller than you think you need to."
          action={
            <Button onClick={() => setCreating(true)} icon={<PlusIcon size={16} />}>
              Plant your first habit
            </Button>
          }
        />
      ) : (
        <Stagger className="space-y-3" stagger={0.05}>
          {state.habits.map((habit) => (
            <StaggerItem key={habit.id}>
              <HabitCard habit={habit} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {history.length > 0 ? (
        <div className="mt-10">
          <HabitHistory
            items={history}
            completions={state.completions}
            freezeUsed={state.freezeUsed}
          />
        </div>
      ) : null}
    </div>
  );
}