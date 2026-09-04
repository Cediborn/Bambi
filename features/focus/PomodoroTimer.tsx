"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { BoltIcon, PauseIcon, PlayIcon, RestartIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { todayKey } from "@/utils/dates";

type Mode = "focus" | "short" | "long" | "custom";

const MODES: Record<Mode, { label: string; minutes: number }> = {
  focus: { label: "Deep work", minutes: 25 },
  short: { label: "Short break", minutes: 5 },
  long: { label: "Long break", minutes: 15 },
  custom: { label: "Custom", minutes: 25 },
};

const MODE_ORDER: Mode[] = ["focus", "short", "long", "custom"];

/** Custom durations are capped at 8 hours — plenty for a deep-work block. */
const MAX_CUSTOM_HOURS = 8;

function clampInt(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** 25:00 style under an hour, 1:30:00 style once hours are involved. */
function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function PomodoroTimer() {
  const { api } = useApp();
  const sounds = useSounds();
  const today = todayKey();

  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [toast, setToast] = useState(false);
  // Custom duration inputs (hours + minutes), independent of the presets.
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);

  // Mirror of secondsLeft for reads inside the async tick.
  const secondsRef = useRef(MODES.focus.minutes * 60);
  // Ensure a finished focus round is logged exactly once.
  const loggedRef = useRef(false);
  // Whether the current round has been started (pause keeps it true; a reset clears it).
  const [started, setStarted] = useState(false);

  const customTotalMinutes = customHours * 60 + customMinutes;
  const customValid = customTotalMinutes >= 1 && customTotalMinutes <= MAX_CUSTOM_HOURS * 60;

  /** Full countdown for a mode in seconds. Custom never falls below 1 minute. */
  const durationFor = (m: Mode): number =>
    m === "custom" ? Math.max(60, customTotalMinutes * 60) : MODES[m].minutes * 60;

  const total = durationFor(mode);
  const progress = 1 - secondsLeft / total;
  const customLocked = running || (started && secondsLeft !== 0);

  // Tick once per second while running; finish + log inside the callback.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      secondsRef.current = Math.max(0, secondsRef.current - 1);
      setSecondsLeft(secondsRef.current);
      if (secondsRef.current === 0) {
        window.clearInterval(id);
        setRunning(false);
        if ((mode === "focus" || mode === "custom") && !loggedRef.current) {
          loggedRef.current = true;
          const minutes =
            mode === "custom" ? Math.max(1, customHours * 60 + customMinutes) : MODES.focus.minutes;
          api.addFocusSession(today, minutes);
          sounds.complete();
          setToast(true);
          window.setTimeout(() => setToast(false), 2500);
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, mode, customHours, customMinutes, today, api, sounds]);

  // While idle on the custom mode, editing the duration updates the countdown
  // preview immediately (mirrors what a preset change does). Once a round has
  // started — or is paused mid-round — edits wait for a reset; after finishing,
  // editing starts a fresh round so nothing stale gets logged twice.
  const syncCustomDuration = (totalMinutes: number) => {
    if (mode !== "custom" || running) return;
    if (started && secondsLeft !== 0) return;
    const next = Math.max(60, totalMinutes * 60);
    secondsRef.current = next;
    setSecondsLeft(next);
    setStarted(false);
    loggedRef.current = false;
    setToast(false);
  };

  const resetTimer = (nextMode: Mode) => {
    const next = durationFor(nextMode);
    secondsRef.current = next;
    setSecondsLeft(next);
    setRunning(false);
    setStarted(false);
    loggedRef.current = false;
    setToast(false);
  };

  const selectMode = (m: Mode) => {
    if (m === mode && secondsLeft === 0) {
      resetTimer(m);
      return;
    }
    setMode(m);
    resetTimer(m);
  };

  const clock = formatClock(secondsLeft);
  const hasHours = secondsLeft >= 3600;

  return (
    <Card tone="sky" size="featured" className="flex flex-col items-center text-center">
      {/* Mode picker */}
      <div
        role="group"
        aria-label="Timer mode"
        className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-line bg-surface p-1 dark:border-white/[0.08]"
      >
        {MODE_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => selectMode(m)}
            className={[
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              mode === m
                ? "bg-brand text-white shadow-card"
                : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Custom duration setup */}
      {mode === "custom" ? (
        <div className="mt-6 flex w-full max-w-xs flex-col items-center gap-3">
          <div className="flex items-end justify-center gap-3" role="group" aria-label="Custom duration">
            <label className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Hours
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_CUSTOM_HOURS}
                value={customHours}
                disabled={customLocked}
                aria-label="Hours"
                onChange={(e) => {
                  const n = e.target.value === "" ? 0 : Number(e.target.value);
                  const h = clampInt(n, 0, MAX_CUSTOM_HOURS);
                  const m = h === MAX_CUSTOM_HOURS ? 0 : customMinutes;
                  setCustomHours(h);
                  setCustomMinutes(m);
                  syncCustomDuration(h * 60 + m);
                }}
                className="h-11 w-20 rounded-xl border border-line bg-surface text-center font-mono text-lg font-bold tabular-nums text-ink transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:opacity-40"
              />
            </label>
            <label className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Minutes
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={customMinutes}
                disabled={customLocked}
                aria-label="Minutes"
                onChange={(e) => {
                  const n = e.target.value === "" ? 0 : Number(e.target.value);
                  const m = clampInt(n, 0, 59);
                  const nextMinutes = customHours === MAX_CUSTOM_HOURS ? 0 : m;
                  setCustomMinutes(nextMinutes);
                  syncCustomDuration(customHours * 60 + nextMinutes);
                }}
                className="h-11 w-20 rounded-xl border border-line bg-surface text-center font-mono text-lg font-bold tabular-nums text-ink transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:opacity-40"
              />
            </label>
          </div>
          <p
            className={`text-xs font-semibold ${customValid ? "text-ink-soft" : "text-bad"}`}
            role={customValid ? undefined : "alert"}
          >
            {customValid
              ? customTotalMinutes === 1
                ? "1 minute of deep work — counted in your stats"
                : `${customTotalMinutes} minutes of deep work — counted in your stats`
              : "Pick at least 1 minute (up to 8 hours)."}
          </p>
        </div>
      ) : null}

      {/* Timer */}
      <div className="mt-8">
        <ProgressRing progress={progress} size={200} stroke={10} tone="text-brand">
          <div className="text-center">
            <p
              className={`font-mono font-bold tabular-nums tracking-tight text-ink ${
                hasHours ? "text-3xl sm:text-4xl" : "text-5xl"
              }`}
            >
              {clock}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {running
                ? mode === "custom"
                  ? "Deep work"
                  : MODES[mode].label
                : secondsLeft === 0
                  ? "Round complete"
                  : "Ready when you are"}
            </p>
          </div>
        </ProgressRing>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => resetTimer(mode)}
          disabled={mode === "custom" && !customValid}
          aria-label="Reset timer"
          icon={<RestartIcon size={18} />}
        >
          Reset
        </Button>
        <Button
          size="lg"
          onClick={() => {
            if (secondsLeft === 0) resetTimer(mode);
            setStarted(true);
            setRunning((r) => !r);
          }}
          disabled={mode === "custom" && !customValid}
          icon={running ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        >
          {running ? "Pause" : secondsLeft === 0 ? "Start again" : "Start"}
        </Button>
      </div>

      {toast ? (
        <p className="animate-fade-in mt-5 inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1.5 text-sm font-bold text-good">
          <BoltIcon size={14} />
          +{mode === "custom" ? Math.max(1, customTotalMinutes) : MODES.focus.minutes} min of deep work logged
        </p>
      ) : null}
    </Card>
  );
}
