import { describe, expect, it } from "vitest";
import { lastNDays, shiftKey, todayKey, toDateKey, weekKeyOf } from "@/utils/dates";

describe("date helpers", () => {
  it("formats dates as YYYY-MM-DD", () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("shifts across month and year boundaries", () => {
    expect(shiftKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftKey("2026-01-31", 1)).toBe("2026-02-01");
    expect(shiftKey("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("finds the Monday of the containing week", () => {
    // 2026-06-08 is a Monday; the 10th is a Wednesday.
    expect(weekKeyOf("2026-06-10")).toBe("2026-06-08");
    expect(weekKeyOf("2026-06-08")).toBe("2026-06-08");
  });

  it("lastNDays returns n days ending today, oldest first", () => {
    const days = lastNDays(7);
    expect(days).toHaveLength(7);
    expect(days[days.length - 1]).toBe(todayKey());
    expect(shiftKey(days[0], 6)).toBe(todayKey());
  });
});
