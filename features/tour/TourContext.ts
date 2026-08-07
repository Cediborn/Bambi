"use client";

import { createContext, useContext } from "react";

export interface TourContextValue {
  /** Open the tour chooser (Quick / Full) — used by the TopBar help button and Settings. */
  openChooser: () => void;
}

export const TourContext = createContext<TourContextValue | null>(null);

/** Access the tour system: `const { openChooser } = useTour()`. */
export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used inside <TourProvider>");
  }
  return ctx;
}
