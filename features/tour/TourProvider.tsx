"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { TourContext } from "./TourContext";
import { TourWelcome } from "./TourWelcome";
import { GuidedTour } from "./GuidedTour";
import { loadTourPrefs, saveTourPrefs, type TourPrefs } from "./tourPersistence";
import { TOURS } from "./tourSteps";
import type { Tour } from "./tourTypes";

/**
 * TourProvider — owns everything about the guided tours:
 *
 * - the user's preference (never / skipped / completed / active), persisted
 *   under its own storage key so garden data and auth never touch it;
 * - the welcome chooser, shown on the first visit (and reusable anytime via
 *   `openChooser` from the TopBar help button or Settings);
 * - the active GuidedTour overlay.
 *
 * First visits are never forced: "Maybe later" dismisses it for good, and
 * the tour stays one tap away.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<TourPrefs>(loadTourPrefs);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [active, setActive] = useState<Tour | null>(null);

  useEffect(() => {
    saveTourPrefs(prefs);
  }, [prefs]);

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
    // Only record "skipped" when the user hasn't already gone further.
    setPrefs((p) => (p.status === "never" ? { ...p, status: "skipped" } : p));
  }, []);

  const value = useMemo(() => ({ openChooser }), [openChooser]);

  // Derived, not stored: first visits see the welcome card exactly once;
  // "skipped"/"completed" persist, so it never nags again.
  const firstVisit = prefs.status === "never" && !active;
  const showWelcome = firstVisit || chooserOpen;

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
            mode={firstVisit ? "welcome" : "guide"}
            onStart={startTour}
            onClose={dismissWelcome}
          />
        ) : null}
      </AnimatePresence>
    </TourContext.Provider>
  );
}
