"use client";

import { createContext } from "react";
import type { AppState, Habit, Profile, Settings, Theme } from "@/types";

/** The action surface the UI talks to. */
export interface AppApi {
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Pick<Profile, "name" | "avatar" | "interests">>) => void;
  addHabit: (input: { name: string; icon: string; color: string; schedule: number[] }) => void;
  updateHabit: (id: string, patch: Partial<Pick<Habit, "name" | "icon" | "color" | "schedule">>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  upsertJournal: (date: string, mood: number, content: string) => void;
  removeJournal: (id: string) => void;
  toggleQuest: (date: string) => void;
  /** Water the tree for a given date (toggles). */
  tendTree: (date: string) => void;
  /** Spend one streak freeze: `date` counts as done for `habitId`. */
  useFreeze: (habitId: string, date: string) => void;
  addFocusSession: (date: string, minutes: number, label?: string) => void;
  removeFocusSession: (id: string) => void;
  addChallenge: (input: { title: string; days: number; xpReward: number }) => void;
  checkinChallenge: (id: string, date: string) => void;
  removeChallenge: (id: string) => void;
  addVisionItem: (text: string, category: string) => void;
  removeVisionItem: (id: string) => void;
  upsertReflection: (
    weekKey: string,
    fields: {
      wentWell: string;
      wentWrong: string;
      win: string;
      lesson: string;
      nextWeek: string;
    }
  ) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (theme: Theme) => void;
  importData: (state: AppState) => void;
  reset: () => void;
}

export interface AppContextValue {
  state: AppState;
  api: AppApi;
}

export const AppContext = createContext<AppContextValue | null>(null);
