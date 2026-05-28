import { vars } from "../theme";
import * as prim from "../primitives";

interface SaveToastData {
  cheer: string;
  hours: string;
  xp: number;
}

interface Props {
  toast: SaveToastData | null;
  mode: "light" | "dark";
}

export function SaveToast({ toast, mode }: Props) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          mode === "dark"
            ? "rgba(11, 9, 16, 0.55)"
            : "rgba(253, 252, 251, 0.65)",
        animation: "saveFlashBackdrop 2.1s cubic-bezier(.22,1,.36,1) forwards",
        zIndex: 110,
        pointerEvents: "none",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="glassy"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          padding: "26px 30px 24px",
          borderRadius: 22,
          background: vars.background.surface,
          border: `1.5px solid color-mix(in srgb, ${vars.typography.green} 33%, transparent)`,
          boxShadow: `0 14px 48px color-mix(in srgb, ${vars.typography.green} 33%, transparent), 0 0 0 1px color-mix(in srgb, ${vars.typography.green} 13%, transparent)`,
          animation: "saveFlashCard 2.1s cubic-bezier(.22,1,.36,1) forwards",
        }}
      >
        <svg
          viewBox="0 0 72 72"
          width={72}
          height={72}
          fill="none"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ stroke: vars.typography.green }}
        >
          <circle
            className="save-flash-ring"
            cx="36"
            cy="36"
            r="31"
            strokeDasharray="195"
            strokeDashoffset="195"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
          <polyline
            className="save-flash-check"
            points="22 38 32 48 52 26"
            strokeDasharray="40"
            strokeDashoffset="40"
          />
        </svg>
        <prim.Stack align="center" gap="none">
          <prim.Text size="xl" weight="black" color="primary" tracking="tight">
            {toast.cheer}
          </prim.Text>
          <prim.MonoText size="sm" weight="normal" color="tertiary" tracking="wide">
            +{toast.hours}  ·  +{toast.xp} XP
          </prim.MonoText>
        </prim.Stack>
      </div>
    </div>
  );
}
