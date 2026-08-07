"use client";

import {
  CircleIcon,
  CloudIcon,
  MinusIcon,
  MoodCloudIcon,
  MoodDotIcon,
  MoodFlatIcon,
  MoodStarIcon,
  MoodSunIcon,
  StarIcon,
  SunIcon,
} from "@/components/icons";

export interface MoodOption {
  value: number;
  label: string;
  color: string;
}

export const MOODS: MoodOption[] = [
  { value: 1, label: "Tough", color: "#EF4444" },
  { value: 2, label: "Meh", color: "#F59E0B" },
  { value: 3, label: "Okay", color: "#0EA5E9" },
  { value: 4, label: "Good", color: "#22C55E" },
  { value: 5, label: "Amazing", color: "#4F46E5" },
];

export function moodLabel(value: number): string {
  return MOODS.find((m) => m.value === value)?.label ?? "";
}

/** Outline glyph per mood; the selected chip swaps to the filled variant. */
const MOOD_GLYPHS: Record<number, typeof SunIcon> = {
  1: CloudIcon,
  2: MinusIcon,
  3: CircleIcon,
  4: SunIcon,
  5: StarIcon,
};

/** Filled glyph per mood, shown once selected. */
const MOOD_GLYPHS_FILLED: Record<number, typeof SunIcon> = {
  1: MoodCloudIcon,
  2: MoodFlatIcon,
  3: MoodDotIcon,
  4: MoodSunIcon,
  5: MoodStarIcon,
};

interface MoodPickerProps {
  value: number | null;
  onChange: (value: number) => void;
}

/** Five-level mood selector rendered as premium selectable chips. */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="How are you feeling?"
      className="grid grid-cols-5 gap-2"
    >
      {MOODS.map((m) => {
        const selected = value === m.value;
        const OutlineGlyph = MOOD_GLYPHS[m.value];
        const FilledGlyph = MOOD_GLYPHS_FILLED[m.value];
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={m.label}
            onClick={() => onChange(m.value)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              const current = MOODS.findIndex((x) => x.value === (value ?? 3));
              const next =
                e.key === "ArrowRight"
                  ? (current + 1) % MOODS.length
                  : (current - 1 + MOODS.length) % MOODS.length;
              onChange(MOODS[next].value);
            }}
            className={[
              "flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3",
              "transition-all duration-200 ease-out",
              "active:scale-95",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "scale-[1.04] shadow-card"
                : "border-line bg-surface hover:-translate-y-0.5 hover:border-line hover:shadow-card",
            ].join(" ")}
            style={
              selected
                ? { borderColor: m.color, backgroundColor: `${m.color}14` }
                : undefined
            }
          >
            <span
              className={[
                "flex size-8 items-center justify-center rounded-full transition-all duration-200",
                selected ? "" : "opacity-70",
              ].join(" ")}
              style={{ color: m.color }}
            >
              {selected ? <FilledGlyph size={18} /> : <OutlineGlyph size={18} />}
            </span>
            <span
              className={[
                "text-xs font-semibold transition-colors",
                selected ? "text-ink" : "text-ink-soft",
              ].join(" ")}
            >
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
