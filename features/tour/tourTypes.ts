/**
 * BAMBI guided-tour types.
 *
 * A tour is a plain, declarative list of steps. Each regular step points
 * at a real element (via `target`) on a real page (via `route`); the tour
 * overlay navigates there, highlights it and explains it. `welcome` and
 * `complete` steps are full-screen moments without a spotlight.
 *
 * Adding a new step (or a whole module tour) is just adding an entry here —
 * no changes to the overlay engine required.
 */

export type TourKind = "regular" | "welcome" | "complete";

export interface TourStep {
  id: string;
  kind?: TourKind;
  /** Route to navigate to before showing this step. */
  route?: string;
  /** CSS selector for the element to spotlight. Falls back to the page h1. */
  target?: string;
  title: string;
  description: string;
}

export interface Tour {
  id: string;
  /** Short human label, e.g. "Quick tour". */
  label: string;
  /** One-line pitch shown on the chooser card. */
  tagline: string;
  /** How long it roughly takes — shown as metadata on the chooser. */
  duration: string;
  steps: TourStep[];
}
