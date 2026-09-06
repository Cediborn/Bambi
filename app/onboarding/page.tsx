"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Input";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarPicker, DEFAULT_AVATAR } from "@/components/ui/Avatar";
import { SparkleField } from "@/components/decor/SparkleField";
import { ArrowRightIcon, CheckIcon, HabitGlyph } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/hooks/useApp";
import {
  DIFFICULTY_LABEL,
  HABIT_CATEGORIES,
  categoryFor,
  onboardingSelections,
} from "@/features/habits/habitLibrary";

const STEPS = ["Welcome", "Name", "Avatar", "Interests", "First habits"];

/** How many habits per category the picker shows before "Show all".
    Categories hold 5 habits, so everything is shown. */
const PER_CATEGORY_VISIBLE = 5;

/** Max categories a user can pick during onboarding. */
const MAX_INTERESTS = 4;

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function OnboardingPage() {
  const { api } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [interests, setInterests] = useState<string[]>([]);
  /** habitId -> picked. Absent means picked (everything is offered, drop what you don't want). */
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  /** category key -> show the full library for that category. */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  /** Shown when the user tries to pick more than MAX_INTERESTS. */
  const [maxHint, setMaxHint] = useState(false);

  const toggleInterest = (key: string) => {
    if (interests.includes(key)) {
      setMaxHint(false);
      setInterests((prev) => prev.filter((k) => k !== key));
      return;
    }
    if (interests.length >= MAX_INTERESTS) {
      setMaxHint(true);
      return;
    }
    setMaxHint(false);
    setInterests((prev) => [...prev, key]);
  };

  const selections = onboardingSelections(interests);
  const totalOffered = selections.reduce((n, s) => n + s.habits.length, 0);
  const pickedCount = selections.reduce(
    (n, s) => n + s.habits.filter((h) => picked[h.id] !== false).length,
    0
  );

  const togglePicked = (id: string) => {
    setPicked((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }));
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const finish = () => {
    const chosen = selections.flatMap((s) => s.habits).filter((h) => picked[h.id] !== false);
    api.setProfile({ name: name.trim() || "friend", avatar, interests, onboardedAt: new Date().toISOString() });
    chosen.forEach((h) =>
      api.addHabit({ name: h.title, icon: h.icon, color: h.color, schedule: ALL_DAYS })
    );
    router.replace("/today");
  };

  const next = () => {
    if (step === 1) {
      if (!name.trim()) {
        setNameError("Tell us your name — or tap “Skip” to stay anonymous.");
        return;
      }
      setNameError(null);
    }
    if (step === STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10 text-ink">
      <SparkleField />
      <div className="relative w-full max-w-md">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-2" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "w-8 bg-brand" : "w-3 bg-line"
              }`}
            />
          ))}
        </div>

        <div key={step} className="animate-fade-up">
          {step === 0 && (
            <div className="flex flex-col items-center text-center">
              <BrandLogo size={88} className="ring-2 ring-white/10" />
              <h1 className="font-display mt-7 text-4xl font-extrabold tracking-tight">
                Grow a little, every day.
              </h1>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-soft">
                Habits, streaks, and a daily check-in. Small things, done
                daily, add up.
              </p>
              <Button size="lg" className="mt-8" onClick={next}>
                Get started
                <ArrowRightIcon size={17} />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                What should we call you?
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Change it anytime in Settings.
              </p>
              <div className="mt-6">
                <Input
                  id="onboarding-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={32}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && next()}
                />
                {nameError ? (
                  <div className="mt-2">
                    <FieldError>{nameError}</FieldError>
                  </div>
                ) : null}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setName("friend");
                    setNameError(null);
                    setStep(2);
                  }}
                >
                  Skip
                </Button>
                <Button onClick={next}>
                  Continue
                  <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-6 flex items-center justify-center">
                <Avatar avatar={avatar} size={96} className="ring-4 ring-brand/20" />
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Pick your buddy
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                This little one grows alongside your tree. You can switch anytime in Settings.
              </p>
              <div className="mt-6 rounded-2xl border border-line bg-card p-4">
                <AvatarPicker value={avatar} onChange={setAvatar} tileSize={44} columns="grid-cols-4" />
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
                <Button onClick={next}>
                  Continue
                  <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                What are you working on?
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Pick what matters to you right now and build habits around it.
              </p>
              <p className="mt-2 text-xs font-semibold text-ink-soft">
                Pick up to {MAX_INTERESTS} — {interests.length} selected
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3" role="group" aria-label="Interests">
                {HABIT_CATEGORIES.map((interest) => {
                  const selected = interests.includes(interest.key);
                  const atMax = interests.length >= MAX_INTERESTS;
                  return (
                    <button
                      key={interest.key}
                      type="button"
                      aria-pressed={selected}
                      aria-disabled={atMax && !selected}
                      onClick={() => toggleInterest(interest.key)}
                      className={[
                        "flex min-w-0 items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all duration-150",
                        "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        selected
                          ? "border-brand/40 bg-brand/10"
                          : atMax
                            ? "border-line/60 bg-card/60 opacity-70"
                            : "border-line bg-card hover:border-brand/30",
                      ].join(" ")}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                          selected ? "bg-brand text-white" : "bg-surface text-ink-soft"
                        }`}
                      >
                        <HabitGlyph name={interest.glyph} size={18} />
                      </span>
                      <span
                        className={`block min-w-0 break-words text-sm font-semibold leading-tight ${
                          selected ? "text-brand" : "text-ink"
                        }`}
                      >
                        {interest.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {maxHint ? (
                <p className="mt-3 rounded-xl bg-surface px-3.5 py-2.5 text-xs font-semibold text-ink-soft">
                  You can pick up to {MAX_INTERESTS}. Deselect one to choose another.
                </p>
              ) : null}

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
                <Button onClick={next} disabled={interests.length === 0}>
                  Continue
                  <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Your starting habits
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Here are habits from the areas you picked. Take the ones that
                fit — drop any you don&apos;t want. Everything can change later.
              </p>

              <div className="mt-6 space-y-6">
                {selections.map(({ category, habits }) => {
                  const cat = categoryFor(category);
                  if (!cat) return null;
                  const isExpanded = expanded[category] === true;
                  const visible = isExpanded ? habits : habits.slice(0, PER_CATEGORY_VISIBLE);
                  return (
                    <section key={category}>
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="flex size-7 items-center justify-center rounded-lg bg-surface text-ink-soft"
                          >
                            <HabitGlyph name={cat.glyph} size={15} />
                          </span>
                          <h2 className="font-display text-sm font-bold text-ink">{cat.label}</h2>
                          <span className="text-xs text-ink-soft">
                            {habits.length} habits
                          </span>
                        </div>
                        {habits.length > PER_CATEGORY_VISIBLE ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(category)}
                            className="shrink-0 text-xs font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          >
                            {isExpanded
                              ? "Show less"
                              : `Show all ${habits.length}`}
                          </button>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        {visible.map((h) => {
                          const chosen = picked[h.id] !== false;
                          return (
                            <button
                              key={h.id}
                              type="button"
                              aria-pressed={chosen}
                              onClick={() => togglePicked(h.id)}
                              className={[
                                "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-150",
                                "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                                chosen
                                  ? "border-brand/40 bg-brand/5"
                                  : "border-line bg-card opacity-60",
                              ].join(" ")}
                            >
                              <span
                                aria-hidden="true"
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: `${h.color}1A`, color: h.color }}
                              >
                                <HabitGlyph name={h.icon} size={18} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block break-words text-sm font-bold text-ink">{h.title}</span>
                                <span className="block text-xs text-ink-soft">
                                  {h.minutes} min · {DIFFICULTY_LABEL[h.difficulty]}
                                </span>
                              </span>
                              <span
                                className={[
                                  "flex size-6 items-center justify-center rounded-full border-2 transition-all duration-150",
                                  chosen
                                    ? "border-transparent bg-brand text-white"
                                    : "border-line text-transparent",
                                ].join(" ")}
                              >
                                <CheckIcon size={14} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
                <Button onClick={finish}>
                  Start today
                  {totalOffered > 0 ? (
                    <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold tabular-nums">
                      {pickedCount}
                    </span>
                  ) : null}
                  <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-ink-soft">
          Everything stays on this device.
        </p>
      </div>
    </main>
  );
}