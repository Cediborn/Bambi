"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { TourContext } from "./TourContext";
import { TourWelcome } from "./TourWelcome";
import { GuidedTour } from "./GuidedTour";
import { loadTourPrefs, saveTourPrefs, type TourPrefs } from "./tourPersistence";
import { QUICK_TOUR, TOURS } from "./tourSteps";
import type { Tour } from "./tourTypes";

/**
 * TourProvider — owns everything about the guided tours:
 *
 * - the user's preference (never / skipped / completed / active), persisted
 *   under its own storage key so garden data and auth never touch it;
 * - auto-starts the Quick Tour for brand-new users after onboarding;
 * - the welcome chooser, shown only when manually opened from Settings;
 * - the active GuidedTour overlay.
 *
 * New users get the tour automatically. Returning users can restart it
 * from Settings → Help & Guidance → Take a Tour.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<TourPrefs>(loadTourPrefs);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [active, setActive] = useState<Tour | null>(null);
  const autoStartRef = useRef(false);

  useEffect(() => {
    saveTourPrefs(prefs);
  }, [prefs]);

  /**
   * Auto-start for new users.
   * When prefs.status is "never" (no tour data in localStorage), the user
   * has just completed onboarding. After a short delay to let the /today
   * page render, automatically begin the Quick Tour.
   */
  useEffect(() => {
    if (prefs.status === "never" && !active && !autoStartRef.current) {
      autoStartRef.current = true;
      const t = window.setTimeout(() => {
        setActive(QUICK_TOUR);
        setPrefs((p) => ({ ...p, status: "active", lastTour: QUICK_TOUR.id }));
      }, 1800);
      return () => window.clearTimeout(t);
    }
  }, [prefs.status, active]);

  const startTour = useCallback((tourId: string) => {
    const tour = TOURS.find((t) => t.id === tourId) ?? TOURS[0];
    setChooserOpen(false);
    setActive(tour);
    setPrefs((p) => ({ ...p, status: "active", lastTour: tour.id }));
  }, []);

  const closeTour = useCallback((finished: boolean) => {
    setActive(null);
    setPrefs((p) => ({
      ...p,
      status: finished ? "completed" : "skipped",
      completedAt: finished ? new Date().toISOString() : p.completedAt,
    }));
  }, []);

  const openChooser = useCallback(() => {
    setChooserOpen(true);
  }, []);

  const dismissWelcome = useCallback(() => {
    setChooserOpen(false);
  }, []);

  const value = useMemo(() => ({ openChooser }), [openChooser]);

  // The chooser only shows when manually opened from Settings.
  // New users get the tour auto-started instead.
  const showWelcome = chooserOpen;

  return (
    <TourContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {active ? (
          <GuidedTour
            key={active.id}
            tour={active}
            onFinish={() => closeTour(true)}
            onSkip={() => closeTour(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showWelcome ? (
          <TourWelcome
            key="tour-welcome"
            mode="guide"
            onStart={startTour}
            onClose={dismissWelcome}
          />
        ) : null}
      </AnimatePresence>
    </TourContext.Provider>
  );
}
