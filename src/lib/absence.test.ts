import { describe, it, expect } from "vitest";
import { workingDaysInRange } from "./absence";

describe("workingDaysInRange", () => {
  it("returns the working days of a normal week (Mon-Fri)", () => {
    // 2026-05-25 is a Monday; 2026-05-29 Friday.
    const days = workingDaysInRange("2026-05-25", "2026-05-29");
    expect(days).toEqual([
      "2026-05-25",
      "2026-05-26",
      "2026-05-27",
      "2026-05-28",
      "2026-05-29",
    ]);
  });

  it("skips the weekend", () => {
    // Fri 2026-05-29 → Mon 2026-06-01 (skips Sat/Sun).
    const days = workingDaysInRange("2026-05-29", "2026-06-01");
    expect(days).toEqual(["2026-05-29", "2026-06-01"]);
  });

  it("skips Swedish holidays (Midsummer Eve 2026-06-19 is not a working day)", () => {
    const days = workingDaysInRange("2026-06-19", "2026-06-19");
    expect(days).toEqual([]);
  });

  it("handles a single working day", () => {
    expect(workingDaysInRange("2026-05-25", "2026-05-25")).toEqual([
      "2026-05-25",
    ]);
  });

  it("returns empty for a reversed or invalid range", () => {
    expect(workingDaysInRange("2026-05-29", "2026-05-25")).toEqual([]);
    expect(workingDaysInRange("", "2026-05-25")).toEqual([]);
  });
});
