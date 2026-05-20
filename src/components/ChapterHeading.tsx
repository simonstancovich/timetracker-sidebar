import type { Theme } from "../theme";

interface Props {
  title: string;
  hint?: string;
  M: Theme;
}

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
] as const;

export function chapterRoman(n: number): string {
  if (n <= 0) return "";
  if (n <= 10) return ROMAN[n - 1];
  return String(n);
}

export function ChapterHeading({ title, hint, M }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        marginBottom: 6,
      }}
    >
      <span
        style={{
          fontFamily: '"Instrument Serif",Georgia,serif',
          fontStyle: "italic",
          fontSize: 17,
          color: M.t1,
          letterSpacing: -0.1,
          lineHeight: 1.1,
        }}
      >
        <span style={{ color: M.ac, marginRight: 6 }}>§</span>
        {title}
      </span>
      {hint && (
        <span
          style={{
            fontFamily: '"JetBrains Mono",ui-monospace,monospace',
            fontSize: 9,
            color: M.tf,
            textTransform: "uppercase",
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          — {hint} —
        </span>
      )}
    </div>
  );
}
