import { describe, expect, it } from "vitest";
import { heroContext } from "@/utils/hero";
import { todayKey } from "@/utils/dates";
import { completeOn, makeHabit, makeState } from "./helpers";

const today = todayKey();

describe("heroContext", () => {
  it("welcomes a brand-new user", () => {
    expect(heroContext(makeState(), today).mood).toBe("first");
  });

  it("celebrates when everything is done", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [0]) });
    expect(heroContext(state, today).mood).toBe("all-done");
  });

  it("raises a streak mood for long streaks", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [1, 2, 3]) });
    const ctx = heroContext(state, today);
    expect(ctx.mood).toBe("streak");
    expect(ctx.chip).toContain("3-day");
  });

  it("signals a streak on the line when today is pending", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [1, 2]) });
    expect(heroContext(state, today).mood).toBe("streak-line");
  });

  it("offers a rest mood when nothing is scheduled", () => {
    const state = makeState({
      habits: [makeHabit({ schedule: [] })],
      completions: completeOn("h1", [0, 1, 2]),
    });
    expect(heroContext(state, today).mood).toBe("rest");
  });

  it("welcomes back after several inactive days", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [5, 6, 7]) });
    expect(heroContext(state, today).mood).toBe("returning");
  });

  it("marks the anniversary of joining", () => {
    const state = makeState({
      profile: { name: "Cedi", avatar: "fawn", interests: [], onboardedAt: "2025-06-01" },
      habits: [makeHabit()],
      completions: completeOn("h1", [1, 2]),
    });
    expect(heroContext(state, "2026-06-01").mood).toBe("anniversary");
  });

  it("nudges when close to the next level", () => {
    const state = makeState({
      profile: { name: "Cedi", avatar: "fawn", interests: [], onboardedAt: "2025-01-15" },
      habits: [makeHabit()],
      // 7 completions, none consecutive, none in the last 3 days
      completions: completeOn("h1", [2, 4, 6, 8, 10, 12, 14]),
    });
    // 70 XP + 20 welcome = 90 → 10 XP from level 2
    expect(heroContext(state, today).mood).toBe("almost-level");
  });
});
