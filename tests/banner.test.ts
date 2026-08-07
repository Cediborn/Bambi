import { describe, expect, it } from "vitest";
import { bannerMessage } from "@/utils/banner";
import { todayKey } from "@/utils/dates";
import { completeOn, makeHabit, makeState } from "./helpers";

const today = todayKey();

describe("bannerMessage", () => {
  it("welcomes on the very first day", () => {
    const state = makeState({ habits: [makeHabit()] });
    expect(bannerMessage(state, today).icon).toBe("🌱");
  });

  it("welcomes back after a gap", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [5, 6, 7]) });
    expect(bannerMessage(state, today).icon).toBe("🌿");
  });

  it("counts down remaining goals", () => {
    const state = makeState({
      habits: [makeHabit()],
      completions: completeOn("h1", [1]),
    });
    const msg = bannerMessage(state, today);
    expect(msg.icon).toBe("🎯");
    expect(msg.text).toContain("1");
  });

  it("celebrates a fully-done day", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [0]) });
    expect(bannerMessage(state, today).icon).toBe("⭐");
  });

  it("acknowledges a completed quest on a rest day", () => {
    const state = makeState({
      habits: [makeHabit({ schedule: [] })],
      completions: completeOn("h1", [1]),
      questsDone: [today],
    });
    expect(bannerMessage(state, today).icon).toBe("✅");
  });

  it("marks a rest day", () => {
    const state = makeState({
      habits: [makeHabit({ schedule: [] })],
      completions: completeOn("h1", [1, 2]),
    });
    expect(bannerMessage(state, today).icon).toBe("🍃");
  });

  it("always returns a non-empty message", () => {
    for (const d of ["2026-06-01", "2026-06-02", "2026-06-03"]) {
      expect(bannerMessage(makeState(), d).text.length).toBeGreaterThan(0);
    }
  });
});
