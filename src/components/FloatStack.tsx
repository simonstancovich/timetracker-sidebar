import { vars } from "../theme";
import { MONO } from "../lib/fonts";
import type { Float } from "../lib/useFloats";

interface Props {
  floats: Float[];
}

export function FloatStack({ floats }: Props) {
  if (floats.length === 0) return null;
  return (
    <div
      aria-live="polite"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 16,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 99,
      }}
    >
      {floats.map((f) => (
        <div
          key={f.id}
          role="status"
          style={{
            maxWidth: "100%",
            background: vars.background.surface,
            border: `1px solid ${vars.border.soft}`,
            borderRadius: 13,
            padding: "9px 18px",
            fontSize: 15,
            fontWeight: 800,
            color: f.col,
            fontFamily: MONO,
            textAlign: "center",
            lineHeight: 1.35,
            overflowWrap: "anywhere",
            animation: "floatUp 1.5s ease-out forwards",
            boxShadow: `0 4px 24px ${f.col}44`,
          }}
        >
          {f.txt}
        </div>
      ))}
    </div>
  );
}
