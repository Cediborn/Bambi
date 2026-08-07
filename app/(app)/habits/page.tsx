"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stagger, StaggerItem } from "@/components/ui/Motion";
import { HabitCard } from "@/features/habits/HabitCard";
import { HabitForm } from "@/features/habits/HabitForm";
import { PlusIcon, SnowflakeIcon, XIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { freezesAvailable } from "@/utils/streaks";

export default function HabitsPage() {
  const { state } = useApp();
  const [creating, setCreating] = useState(false);
  const freezes = freezesAvailable(state);

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
            <Button onClick={() => setCreating((v) => !v)} icon={creating ? <XIcon size={17} /> : <PlusIcon size={17} />}>
              {creating ? "Close" : "New habit"}
            </Button>
          </>
        }
      />

      {creating ? (
        <Card className="animate-fade-up mb-6 p-5 sm:p-6">
          <HabitForm onSaved={() => setCreating(false)} />
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
    </div>
  );
}
