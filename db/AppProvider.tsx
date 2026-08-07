"use client";

import { useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import type { Profile, Theme } from "@/types";
import {
  createChallenge,
  createFocusSession,
  createHabit,
  createJournalEntry,
  createReflection,
  createVisionItem,
  reducer,
} from "./appState";
import { AppContext, type AppApi } from "./AppContext";
import { loadState, saveState, writeStoredTheme } from "./persistence";
import { applyAccent } from "@/utils/theme";

/**
 * AppProvider owns the whole client store: reducer + persistence + theme +
 * atmosphere settings. Hydration reads localStorage synchronously, so the
 * first render already has data — no flash of empty UI.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Persist on every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Keep the <html> class in sync with the theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.settings.theme === "dark");
    writeStoredTheme(state.settings.theme);
  }, [state.settings.theme]);

  // Accent color → CSS variables, so every brand utility re-tints live.
  useEffect(() => {
    applyAccent(state.settings.accent);
  }, [state.settings.accent]);

  // Manual atmosphere switches on <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("compact", state.settings.compactMode);
    root.classList.toggle("reduce-motion", state.settings.reduceMotion);
  }, [state.settings.compactMode, state.settings.reduceMotion]);

  const api = useMemo<AppApi>(
    () => ({
      setProfile: (profile: Profile) => dispatch({ type: "profile/set", profile }),
      updateProfile: (patch) => dispatch({ type: "profile/update", patch }),
      addHabit: (input) => dispatch({ type: "habits/add", habit: createHabit(input) }),
      updateHabit: (id: string, patch) => dispatch({ type: "habits/update", id, patch }),
      removeHabit: (id: string) => dispatch({ type: "habits/remove", id }),
      toggleCompletion: (habitId: string, date: string) =>
        dispatch({ type: "completion/toggle", habitId, date }),
      upsertJournal: (date: string, mood: number, content: string) =>
        dispatch({ type: "journal/upsert", entry: createJournalEntry(date, mood, content) }),
      removeJournal: (id: string) => dispatch({ type: "journal/remove", id }),
      toggleQuest: (date: string) => dispatch({ type: "quest/toggle", date }),
      tendTree: (date: string) => dispatch({ type: "tree/tend", date }),
      useFreeze: (habitId: string, date: string) =>
        dispatch({ type: "freeze/use", habitId, date }),
      addFocusSession: (date: string, minutes: number, label?: string) =>
        dispatch({ type: "focus/add", session: createFocusSession(date, minutes, label) }),
      removeFocusSession: (id: string) => dispatch({ type: "focus/remove", id }),
      addChallenge: (input) => dispatch({ type: "challenges/add", challenge: createChallenge(input) }),
      checkinChallenge: (id: string, date: string) => dispatch({ type: "challenges/checkin", id, date }),
      removeChallenge: (id: string) => dispatch({ type: "challenges/remove", id }),
      addVisionItem: (text: string, category: string) =>
        dispatch({ type: "vision/add", item: createVisionItem(text, category) }),
      removeVisionItem: (id: string) => dispatch({ type: "vision/remove", id }),
      upsertReflection: (weekKey, fields) =>
        dispatch({ type: "reflection/upsert", reflection: createReflection(weekKey, fields) }),
      updateSettings: (patch) => dispatch({ type: "settings/update", patch }),
      setTheme: (theme: Theme) => dispatch({ type: "theme/set", theme }),
      importData: (state) => dispatch({ type: "app/import", state }),
      reset: () => dispatch({ type: "app/reset" }),
    }),
    []
  );

  const value = useMemo(() => ({ state, api }), [state, api]);

  return (
    <MotionConfig reducedMotion={state.settings.reduceMotion ? "always" : "user"}>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </MotionConfig>
  );
}
