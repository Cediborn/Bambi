"use client";

import { useState } from "react";
import { Reveal, HoverLift } from "@/components/ui/Motion";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuoteIcon, CompassIcon, PlusIcon, XIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { VISION_CATEGORIES, visionCategory } from "./visionMeta";
import { todayKey } from "@/utils/dates";
import { daySeed } from "@/utils/greetings";

/** A few calm lines for the top of the board — rotated by date. */
const VISION_LINES = [
  "You don't need the whole map. Just the next step, clearly.",
  "Dreams are just goals without a schedule.",
  "Picture it, then build it one day at a time.",
  "A vision board is a promise to your future self.",
];

export function VisionBoard() {
  const { state, api } = useApp();
  const [text, setText] = useState("");
  const [category, setCategory] = useState(VISION_CATEGORIES[0].key);

  const today = todayKey();
  const line = VISION_LINES[daySeed(today + ":v") % VISION_LINES.length];

  const add = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    api.addVisionItem(trimmed, category);
    setText("");
  };

  return (
    <div className="space-y-6">
      {/* Inspirational quote strip */}
      <Card tone="violet" className="flex items-center gap-4 p-5 sm:p-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-2/15 text-brand-2">
          <QuoteIcon size={22} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">A thought for today</p>
          <p className="mt-1 text-base font-medium leading-relaxed text-ink sm:text-lg">
            &ldquo;{line}&rdquo;
          </p>
        </div>
      </Card>

      {/* Add form */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="vision-text" className="mb-1.5 block text-sm font-semibold text-ink">
              Add a dream goal
            </label>
            <Input
              id="vision-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Run a half marathon, visit Kyoto, learn piano…"
              maxLength={80}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink">Category</p>
            <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
              {VISION_CATEGORIES.map((c) => {
                const selected = category === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(c.key)}
                    className={[
                      "rounded-full border px-3 py-2 text-xs font-bold transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                      "active:scale-95",
                      selected ? "text-white shadow-card" : "border-line bg-surface text-ink-soft hover:text-ink",
                    ].join(" ")}
                    style={selected ? { backgroundColor: c.color, borderColor: c.color } : undefined}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!text.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/55 px-5 text-sm font-semibold text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_10px_24px_-12px_rgb(56_44_24/0.35)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/75 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:bg-brand/30 dark:text-white dark:border-white/15 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_24px_-10px_rgb(0_0_0/0.5)] dark:hover:bg-brand/45"
          >
            <PlusIcon size={16} />
            Pin it
          </button>
        </div>
      </Card>

      {/* Tiles */}
      {state.vision.length === 0 ? (
        <Reveal>
          <EmptyState
            icon={<CompassIcon size={26} />}
            title="Nothing on the board yet"
            description="Pin the things you're quietly working toward. A vision board is a promise to your future self."
          />
        </Reveal>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {state.vision.map((item, i) => {
            const cat = visionCategory(item.category);
            const Icon = cat.icon;
            return (
              <Reveal key={item.id} delay={Math.min(i * 0.04, 0.3)}>
                <HoverLift>
                  <div
                    className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl border p-4"
                    style={{
                      backgroundColor: `${cat.color}12`,
                      borderColor: `${cat.color}30`,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -right-8 -top-8 size-24 rounded-full opacity-25 blur-2xl"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span
                      className="flex size-9 items-center justify-center rounded-xl text-white shadow-card"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                        {cat.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-ink">{item.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => api.removeVisionItem(item.id)}
                      aria-label={`Remove ${item.text}`}
                      className="absolute right-2 top-2 rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-bad/10 hover:text-bad focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bad group-hover:opacity-100"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                </HoverLift>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
