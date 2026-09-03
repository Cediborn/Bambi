"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Input";
import { Avatar, AvatarPicker, DEFAULT_AVATAR } from "@/components/ui/Avatar";
import { SparkleField } from "@/components/decor/SparkleField";
import { ArrowRightIcon, CheckIcon, HabitGlyph } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/hooks/useApp";
import { INTERESTS, suggestionsFor } from "@/features/onboarding/starterHabits";

const STEPS = ["Welcome", "Name", "Avatar", "Interests", "First habits"];

export default function OnboardingPage() {
  const { api } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [interests, setInterests] = useState<string[]>([]);
  const [starters, setStarters] = useState<Record<string, boolean>>({});

  const toggleInterest = (key: string) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const suggestions = suggestionsFor(interests);

  const toggleStarter = (habitName: string) => {
    setStarters((prev) => ({ ...prev, [habitName]: !prev[habitName] }));
  };

  const finish = () => {
    const chosen = suggestions.filter((s) => starters[s.name] !== false);
    api.setProfile({ name: name.trim() || "friend", avatar, interests, onboardedAt: new Date().toISOString() });
    chosen.forEach((h) =>
      api.addHabit({ name: h.name, icon: h.icon, color: h.color, schedule: [0, 1, 2, 3, 4, 5, 6] })
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
                Pick what matters now. We&apos;ll match habits to fit.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3" role="group" aria-label="Interests">
                {INTERESTS.map((interest) => {
                  const selected = interests.includes(interest.key);
                  return (
                    <button
                      key={interest.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleInterest(interest.key)}
                      className={[
                        "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-150",
                        "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        selected
                          ? "border-brand/40 bg-brand/10"
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
                        className={`text-sm font-semibold ${
                          selected ? "text-brand" : "text-ink"
                        }`}
                      >
                        {interest.label}
                      </span>
                    </button>
                  );
                })}
              </div>
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
                Your first habits
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                A few starters from your interests. Drop any you don&apos;t want —
                everything can change later.
              </p>
              <div className="mt-6 space-y-3">
                {suggestions.map((s) => {
                  const selected = starters[s.name] !== false;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleStarter(s.name)}
                      className={[
                        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-150",
                        "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        selected
                          ? "border-brand/40 bg-brand/5"
                          : "border-line bg-card opacity-60",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${s.color}1A`, color: s.color }}
                      >
                        <HabitGlyph name={s.icon} size={20} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{s.name}</span>
                        <span className="block text-xs text-ink-soft">Every day</span>
                      </span>
                      <span
                        className={[
                          "flex size-6 items-center justify-center rounded-full border-2 transition-all duration-150",
                          selected
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
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
                <Button onClick={finish}>
                  Start today
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
