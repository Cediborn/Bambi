"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TreeSVG } from "@/components/tree/TreeSVG";
import { CheckCircleIcon, DropletIcon, FlowerIcon, LeafIcon, SproutIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { treeInfo, TREE_STAGES } from "@/utils/tree";
import { XP_PER_TEND } from "@/utils/xp";
import { todayKey } from "@/utils/dates";

/**
 * TreeCard — the garden's centerpiece on the dashboard. Shows the tree
 * growing with consistency, the current stage, how close the next stage
 * is — and lets you water it each day. Watering makes the tree sway and
 * glow, and a watering habit earns a few XP (once per day).
 */
export function TreeCard() {
  const { state, api } = useApp();
  const sounds = useSounds();
  const today = todayKey();
  const info = treeInfo(state);
  const tendedToday = state.tendedDates.includes(today);
  const waterings = state.tendedDates.length;
  const [xpFlash, setXpFlash] = useState(false);

  const water = () => {
    if (tendedToday) return;
    api.tendTree(today);
    sounds.checkin();
    setXpFlash(true);
    window.setTimeout(() => setXpFlash(false), 1400);
  };

  return (
    <Card tone="emerald" size="featured" className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="order-2 flex-1 sm:order-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-good/80">
          Your tree · stage {info.index + 1} of {TREE_STAGES.length}
        </p>
        <h2 className="font-display mt-1.5 text-2xl font-extrabold tracking-tight text-ink">
          {info.stage.name}
        </h2>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{info.stage.blurb}</p>

        {/* Next stage progress */}
        {info.daysToNext !== null ? (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <SproutIcon size={14} />
                Next stage
              </span>
              <span className="font-mono">
                {info.daysToNext} day{info.daysToNext === 1 ? "" : "s"} at current pace
              </span>
            </div>
            <ProgressBar value={info.nextProgress} tone="bg-gradient-to-r from-mint to-teal" ariaLabel="Progress to next tree stage" />
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-good">The canopy is full. Well grown.</p>
        )}

        {/* Leaf + flower + watering stats */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-ink-soft">
            <LeafIcon className="text-good" size={16} />
            <span className="font-mono text-ink">{info.leaves}</span> leaves
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-ink-soft">
            <FlowerIcon className="text-achievement" size={16} />
            <span className="font-mono text-ink">{info.flowers}</span> blossom{info.flowers === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-ink-soft">
            <DropletIcon className="text-info" size={16} />
            <span className="font-mono text-ink">{waterings}</span> watering{waterings === 1 ? "" : "s"}
          </span>
        </div>

        {/* Water today */}
        <div className="relative mt-5">
          <Button
            onClick={water}
            disabled={tendedToday}
            variant={tendedToday ? "ghost" : "primary"}
            icon={tendedToday ? <CheckCircleIcon size={16} /> : <DropletIcon size={16} />}
          >
            {tendedToday ? "Watered today" : "Water the tree"}
          </Button>
          {xpFlash ? (
            <span
              aria-hidden="true"
              className="animate-xp-float pointer-events-none absolute left-0 top-0 rounded-full bg-info px-2 py-0.5 text-[11px] font-extrabold text-white shadow-card"
            >
              +{XP_PER_TEND} XP
            </span>
          ) : null}
        </div>
      </div>

      <div className="animate-breathe order-1 mx-auto w-44 shrink-0 sm:order-2 sm:w-56 lg:w-64">
        <TreeSVG info={info} tended={tendedToday} />
      </div>
    </Card>
  );
}
