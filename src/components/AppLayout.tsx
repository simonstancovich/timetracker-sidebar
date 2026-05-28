import type { ReactNode } from "react";
import { vars } from "../theme";

interface Props {
  themeClass: string;
  mode: "light" | "dark";
  topLeftCorner?: ReactNode;
  header: ReactNode;
  banners?: ReactNode;
  footer: ReactNode;
  overlays?: ReactNode;
  modeOverlay?: ReactNode;
  children: ReactNode;
}

// Structural chrome for the running app: a flex-column with header + banners
// + scrolling main + footer, plus an overlay slot for toasts/modals and an
// outer-sibling slot for the cross-mode transition overlay.
export function AppLayout({
  themeClass,
  mode,
  topLeftCorner,
  header,
  banners,
  footer,
  overlays,
  modeOverlay,
  children,
}: Props) {
  return (
    <>
      <div
        key="mode-full"
        className={`mode-root ${themeClass} ${mode === "dark" ? "app-dark-glow" : ""}`}
        style={{
          height: "100vh",
          background: mode === "dark" ? undefined : vars.background.page,
          fontFamily:
            "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
          color: vars.typography.primary,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {topLeftCorner}
        {header}
        {banners}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
        {footer}
        {overlays}
      </div>
      {modeOverlay}
    </>
  );
}
