import { describe, expect, it } from "vitest";
import {
  computeXp,
  levelForXp,
  levelProgress,
  levelTitle,
  xpToNextLevel,
  XP_PER_ENTRY,
  XP_PER_GOAL,
  XP_PER_QUEST,
  XP_PER_TEND,
  XP_WELCOME,
} from "@/utils/xp";
import { makeHabit, makeState } from "./helpers";

describe("computeXp", () => {
  it("counts goals, journal, quests, tending and the welcome bonus", () => {
    const state = makeState({
      profile: { name: "Cedi", avatar: "fawn", interests: [], onboardedAt: "2026-01-01" },
      habits: [makeHabit()],
      completions: { h1: ["2026-06-01", "2026-06-02"] },
      journal: [{ id: "j1", date: "2026-06-01", mood: 4, content: "", createdAt: "" }],
      questsDone: ["2026-06-01"],
      tendedDates: ["2026-06-02"],
    });
    expect(computeXp(state)).toBe(
      2 * XP_PER_GOAL + XP_PER_ENTRY + XP_PER_QUEST + XP_PER_TEND + XP_WELCOME
    );
  });

  it("adds challenge XP only for completed challenges", () => {
    const state = makeState({
      challenges: [
        { id: "c1", title: "Thirty", days: 30, startedAt: "", doneDates: [], xpReward: 100, completedAt: "2026-06-01" },
        { id: "c2", title: "Running", days: 30, startedAt: "", doneDates: [], xpReward: 100 },
      ],
    });
    expect(computeXp(state)).toBe(100);
  });

  it("gives no welcome bonus before onboarding", () => {
    expect(computeXp(makeState())).toBe(0);
  });
});

describe("levels", () => {
  it("maps XP to level boundaries", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(250)).toBe(3);
  });

  it("computes progress and remaining XP", () => {
    expect(levelProgress(50)).toBe(0.5);
    expect(levelProgress(100)).toBe(0);
    expect(xpToNextLevel(40)).toBe(60);
    expect(xpToNextLevel(0)).toBe(100);
  });

  it("wraps level titles", () => {
    expect(levelTitle(1)).toBe("Sprout");
    expect(levelTitle(11)).toBe("Sprout");
  });
});
