import type { Theme } from "../theme";

interface Props {
  title: string;
  hint?: string;
  M: Theme;
}

export function PageEyebrow({ title, hint, M }: Props) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        padding: "12px 14px 10px",
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontFamily: '"Instrument Serif",Georgia,serif',
          fontStyle: "italic",
          fontSize: 16,
          color: M.t2,
          letterSpacing: -0.1,
          lineHeight: 1.1,
        }}
      >
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
          {hint}
        </span>
      )}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 0,
          height: 1,
          background: M.b1,
        }}
      />
    </div>
  );
}
