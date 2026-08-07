import { describe, expect, it } from "vitest";
import { canopyDensity, flowerCount, treeInfo } from "@/utils/tree";
import { completeOn, makeHabit, makeState } from "./helpers";

describe("treeInfo", () => {
  it("starts as a seed", () => {
    expect(treeInfo(makeState()).stage.key).toBe("seed");
    expect(treeInfo(makeState()).index).toBe(0);
  });

  it("grows to sprout at 12 completions", () => {
    const state = makeState({
      habits: [makeHabit()],
      completions: completeOn("h1", Array.from({ length: 12 }, (_, i) => i)),
    });
    const info = treeInfo(state);
    expect(info.stage.key).toBe("sprout");
    expect(info.total).toBe(12);
  });

  it("computes progress toward the next stage", () => {
    const state = makeState({
      habits: [makeHabit()],
      completions: completeOn("h1", Array.from({ length: 21 }, (_, i) => i)),
    });
    // 21 is midway between sprout (12) and sapling (30)
    expect(treeInfo(state).nextProgress).toBeCloseTo(0.5, 5);
  });

  it("reports days to the next stage from recent pace", () => {
    const state = makeState({
      habits: [makeHabit()],
      completions: completeOn("h1", Array.from({ length: 14 }, (_, i) => i)),
    });
    const info = treeInfo(state);
    expect(info.daysToNext).not.toBeNull();
    expect(info.daysToNext).toBeGreaterThan(0);
  });
});

describe("canopyDensity", () => {
  it("thins the canopy when the week is light", () => {
    const state = makeState({ habits: [makeHabit()], completions: completeOn("h1", [0, 1]) });
    expect(canopyDensity(state)).toBeCloseTo(2 / 7, 5);
  });

  it("returns zero when nothing is scheduled", () => {
    const state = makeState({ habits: [makeHabit({ schedule: [] })] });
    expect(canopyDensity(state)).toBe(0);
  });
});

describe("flowerCount", () => {
  it("blooms with achievements and caps at eight", () => {
    const state = makeState({
      habits: [
        makeHabit({ id: "a" }),
        makeHabit({ id: "b" }),
        makeHabit({ id: "c" }),
        makeHabit({ id: "d" }),
        makeHabit({ id: "e" }),
        makeHabit({ id: "f" }),
      ],
      completions: { ...completeOn("a", [0, 1, 2]), ...completeOn("b", [3]), ...completeOn("c", [4]) },
    });
    expect(flowerCount(state)).toBeGreaterThan(0);
    expect(flowerCount(state)).toBeLessThanOrEqual(8);
  });

  it("starts with no flowers", () => {
    expect(flowerCount(makeState())).toBe(0);
  });
});
