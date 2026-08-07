import { describe, expect, it } from "vitest";
import { evaluateAchievements, unlockedCount } from "@/utils/achievements";
import { completeOn, daysAgo, makeHabit, makeState } from "./helpers";

describe("evaluateAchievements", () => {
  it("unlocks first step after one completion", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [0]) });
    const all = evaluateAchievements(state);
    expect(all.find((a) => a.id === "first-step")?.unlocked).toBe(true);
    expect(unlockedCount(state)).toBeGreaterThanOrEqual(1);
  });

  it("unlocks streak achievements at three days but not seven", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [0, 1, 2]) });
    const all = evaluateAchievements(state);
    expect(all.find((a) => a.id === "streak-3")?.unlocked).toBe(true);
    expect(all.find((a) => a.id === "streak-7")?.unlocked).toBe(false);
  });

  it("caps progress at the target", () => {
    const state = makeState({
      habits: [makeHabit()],
      completions: completeOn("h1", Array.from({ length: 40 }, (_, i) => i)),
    });
    const all = evaluateAchievements(state);
    const century = all.find((a) => a.id === "goals-100");
    expect(century?.progress).toBe(40);
    expect(century?.unlocked).toBe(false);
  });

  it("counts frozen days toward streak achievements", () => {
    // Two completed days plus a frozen one make a 3-day streak.
    const state = makeState({
      habits: [makeHabit()],
      completions: completeOn("h1", [2, 3]),
      freezeUsed: { h1: [daysAgo(1)] },
    });
    expect(evaluateAchievements(state).find((a) => a.id === "streak-3")?.unlocked).toBe(true);
  });
});
