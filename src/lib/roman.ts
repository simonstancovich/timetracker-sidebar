const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
] as const;

export function chapterRoman(n: number): string {
  if (n <= 0) return "";
  if (n <= ROMAN.length) return ROMAN[n - 1];
  return String(n);
}
