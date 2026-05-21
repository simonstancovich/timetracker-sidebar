import { describe, it, expect } from "vitest";
import { chapterRoman } from "./roman";

describe("chapterRoman", () => {
  it("maps 1-based positions to roman numerals", () => {
    expect(chapterRoman(1)).toBe("I");
    expect(chapterRoman(4)).toBe("IV");
    expect(chapterRoman(20)).toBe("XX");
  });

  it("returns an empty string for non-positive input", () => {
    expect(chapterRoman(0)).toBe("");
    expect(chapterRoman(-3)).toBe("");
  });

  it("falls back to the decimal string beyond the table", () => {
    expect(chapterRoman(21)).toBe("21");
  });
});
