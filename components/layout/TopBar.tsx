"use client";

import Link from "next/link";
import { Avatar, DEFAULT_AVATAR } from "@/components/ui/Avatar";
import { BoltIcon, CompassIcon, MoonIcon, SlidersIcon, SunIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/hooks/useApp";
import { useTour } from "@/features/tour/TourContext";
import { computeXp, levelForXp, levelProgress } from "@/utils/xp";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function TopBar() {
  const { state, api } = useApp();
  const xp = computeXp(state);
  const level = levelForXp(xp);
  const dark = state.settings.theme === "dark";
  const tour = useTour();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link
          href="/today"
          className="flex items-center gap-2.5 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <BrandLogo size={32} className="rounded-lg" />
          <span className="font-display text-base font-extrabold tracking-tight text-ink">BAMBI</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {/* Your buddy — tap for settings */}
          <Link
            href="/settings"
            aria-label="Your buddy and settings"
            className="transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Avatar avatar={state.profile?.avatar ?? DEFAULT_AVATAR} size={36} />
          </Link>

          {/* XP pill */}
          <div
            title={`Level ${level}`}
            className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 shadow-card"
          >
            <span className="flex items-center gap-1 text-sm font-extrabold text-brand">
              <BoltIcon size={15} />
              {xp}
            </span>
            <span className="hidden w-16 sm:block">
              <ProgressBar value={levelProgress(xp)} tone="bg-brand" />
            </span>
            <span className="hidden text-xs font-semibold text-ink-soft sm:block">
              Lv {level}
            </span>
          </div>

          {/* Take a tour — the compass is BAMBI's "learn your way around" mark */}
          <button
            type="button"
            onClick={() => tour.openChooser()}
            aria-label="Take a tour"
            title="Learn BAMBI"
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-card text-ink-soft shadow-card transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <CompassIcon size={18} />
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => api.setTheme(dark ? "light" : "dark")}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-card text-ink-soft shadow-card transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          {/* Settings (mobile only) */}
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex size-10 items-center justify-center rounded-xl border border-line bg-card text-ink-soft shadow-card transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
          >
            <SlidersIcon size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
