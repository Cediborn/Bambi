"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, DEFAULT_AVATAR } from "@/components/ui/Avatar";
import {
  BoltIcon,
  CompassIcon,
  MoonIcon,
  MoreIcon,
  SunIcon,
  XIcon,
} from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/hooks/useApp";
import { useTour } from "@/features/tour/TourContext";
import { computeXp, levelForXp, levelProgress } from "@/utils/xp";
import { ProgressBar } from "@/components/ui/ProgressBar";

/**
 * TopBar — desktop keeps the avatar, XP pill, tour and theme toggle in a row.
 * On mobile those secondary actions collapse into a compact overflow menu so
 * the bar only carries the brand, your buddy, and the menu trigger.
 */
export function TopBar() {
  const { state, api } = useApp();
  const xp = computeXp(state);
  const level = levelForXp(xp);
  const dark = state.settings.theme === "dark";
  const tour = useTour();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close the mobile menu on outside taps and on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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

          {/* Desktop cluster: XP pill, tour and theme stay in the bar on lg+. */}
          <div className="hidden items-center gap-2 lg:flex">
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
          </div>

          {/* Mobile overflow menu (lg and up keep everything in the bar). */}
          <div ref={menuRef} className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex size-10 items-center justify-center rounded-xl border border-line bg-card text-ink-soft shadow-card transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {menuOpen ? <XIcon size={18} /> : <MoreIcon size={18} />}
            </button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  role="menu"
                  aria-label="Quick actions"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-14 z-30 w-64 origin-top-right rounded-2xl border border-line bg-card/95 p-2 shadow-lift backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06]"
                >
                  {/* XP & level snapshot */}
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <BoltIcon size={17} />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-bold text-ink">{xp} XP</p>
                      <p className="text-xs font-semibold text-ink-soft">Level {level}</p>
                    </div>
                    <span className="w-16">
                      <ProgressBar value={levelProgress(xp)} tone="bg-brand" />
                    </span>
                  </div>

                  <div className="my-1 h-px bg-line dark:bg-white/[0.06]" />

                  {/* Theme toggle */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      api.setTheme(dark ? "light" : "dark");
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-soft">
                      {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-ink">
                      {dark ? "Light mode" : "Dark mode"}
                    </span>
                  </button>

                  {/* Take a tour */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      tour.openChooser();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-soft">
                      <CompassIcon size={17} />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-ink">Take a tour</span>
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
