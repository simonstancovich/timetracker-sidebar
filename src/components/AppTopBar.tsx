import type { ReactNode } from "react";
import { useTranslation, type Lang } from "../lib/i18n";
import { fmtClock, fmtHours } from "../lib/hours";
import { vars } from "../theme";
import { MONO, SERIF } from "../lib/fonts";
import * as prim from "../primitives";
import { FlameIcon } from "../icons/FlameIcon";
import { SunIcon } from "../icons/SunIcon";
import { MoonIcon } from "../icons/MoonIcon";
import type { Todo } from "../lib/todos";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr"];

interface Company { id: string; name: string; }
interface Project { id: string; name: string; }

interface Props {
  themeClass: string;
  mode: "light" | "dark";
  setMode: (m: "light" | "dark") => void;
  lang: Lang;
  goSize: (s: "full" | "top") => void;
  modeOverlay: ReactNode;
  // timer state
  tRun: boolean;
  setTRun: (next: (prev: boolean) => boolean) => void;
  tSec: number;
  // session feedback
  funMessage: string | null;
  windowFocused: boolean;
  displaySessionXp: number;
  xpBump: { id: number; delta: number } | null;
  justBumpedStreak: boolean;
  // progress
  todayH: number;
  streak: number;
  weekH: number[];
  goal: number;
  done: boolean;
  gpct: number;
  // current task context
  hasCtx: boolean;
  coObj?: Company;
  prObj?: Project;
  // estimated todo progress
  topEstTodo?: Todo;
  topEstLiveH: number;
  // derived strip colors
  topBarBg: string;
  topBarFg: string;
  topBarMuted: string;
}

export function AppTopBar({
  themeClass, mode, setMode, lang, goSize, modeOverlay,
  tRun, setTRun, tSec,
  funMessage, windowFocused, displaySessionXp, xpBump, justBumpedStreak,
  todayH, streak, weekH, goal, done, gpct,
  hasCtx, coObj, prObj, topEstTodo, topEstLiveH,
  topBarBg, topBarFg, topBarMuted,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
<div
  key="mode-top"
  className={`mode-root ${themeClass}`}
  onDoubleClick={() => goSize("full")}
  title={t("top.dblClickToOpen")}
  style={{
    height: "100vh",
    width: "100vw",
    background: vars.background.page,
    display: "flex",
    alignItems: "stretch",
    gap: 0,
    padding: 0,
    fontFamily:
      "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
    borderBottom: `1px solid ${vars.border.soft}`,
    position: "relative",
    overflow: "hidden",
  }}
>
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "0 8px",
      position: "relative",
      overflow: "hidden",
      background: topBarBg,
      transition: "background 200ms ease-out",
    }}
  >
    <div
      className={`top-fill${windowFocused ? "" : " paused"}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: `${gpct}%`,
        backgroundImage: done
          ? `linear-gradient(90deg, color-mix(in srgb, ${vars.typography.green} 7%, transparent) 0%, color-mix(in srgb, ${vars.typography.green} 13%, transparent) 50%, color-mix(in srgb, ${vars.typography.green} 7%, transparent) 100%)`
          : `linear-gradient(90deg, color-mix(in srgb, ${vars.typography.accent} 4%, transparent) 0%, color-mix(in srgb, ${vars.typography.accent} 11%, transparent) 50%, color-mix(in srgb, ${vars.typography.accent} 4%, transparent) 100%)`,
        pointerEvents: "none",
      }}
    />

    <button
      onClick={() => setTRun((r) => !r)}
      title={tRun ? "Pause" : "Start"}
      className="top-play-btn"
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: tRun ? vars.typography.pink : vars.background.button,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        zIndex: 1,
        cursor: "pointer",
        padding: 0,
      }}
    >
      {tRun ? (
        <svg width="5" height="6" viewBox="0 0 12 14" fill="none">
          <rect x="1" y="1" width="3" height="12" rx="1" fill="white" />
          <rect x="8" y="1" width="3" height="12" rx="1" fill="white" />
        </svg>
      ) : (
        <svg
          width="5"
          height="7"
          viewBox="0 0 13 15"
          fill="none"
          style={{ marginLeft: 1 }}
        >
          <path
            d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z"
            fill="white"
            stroke="white"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        zIndex: 1,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: tRun ? vars.typography.pink : vars.typography.onAccent,
          boxShadow: tRun
            ? `0 0 5px ${vars.typography.pink}`
            : "0 0 4px rgba(255,255,255,0.6)",
          animation: "pulse 1.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          color: tRun ? vars.typography.accent : topBarFg,
          letterSpacing: 0.1,
          minWidth: 48,
        }}
      >
        {fmtClock(tSec)}
      </div>
      {topEstTodo && (
        <span
          title={t("todo.loggedOfEstimate", {
            logged: fmtHours(topEstLiveH),
            estimate: fmtHours(topEstTodo.estimateH),
          })}
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            color:
              topEstLiveH >= topEstTodo.estimateH ? vars.typography.green : topBarMuted,
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          / {fmtHours(topEstTodo.estimateH)}
        </span>
      )}
    </div>

    <div
      style={{
        flex: 1,
        minWidth: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {!tRun ? (
        (() => {
          const msg =
            tSec > 0 ? t("status.pausedTask") : t("status.notTracking");
          const sep = "   â€¢   ";
          const half = (msg + sep).repeat(30);
          return (
            <div className="status-marquee" style={{ zIndex: 1 }}>
              <div
                className={`status-marquee-track${windowFocused ? "" : " paused"}`}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.4,
                  color: topBarFg,
                  fontFamily: MONO,
                }}
              >
                {half}
                {half}
              </div>
            </div>
          );
        })()
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              maxWidth: "45%",
              minWidth: 0,
            }}
          >
            {hasCtx && coObj ? (
              <>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    color: vars.typography.primary,
                    letterSpacing: -0.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {coObj.name}
                </span>
                {prObj?.name && (
                  <span
                    style={{
                      fontFamily:
                        MONO,
                      fontSize: 8,
                      color: vars.typography.faint,
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minWidth: 0,
                    }}
                  >
                    Â· {prObj.name}
                  </span>
                )}
              </>
            ) : (
              <span
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: vars.typography.tertiary,
                }}
              >
                {t("timer.noTaskSelected")}
              </span>
            )}
          </div>

          {funMessage && (
            <span
              key={funMessage}
              className="fun-msg"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 13,
                color: vars.typography.accent,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                minWidth: 0,
                letterSpacing: -0.1,
              }}
            >
              &ldquo;{funMessage}&rdquo;
            </span>
          )}
        </>
      )}
    </div>
  </div>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexShrink: 0,
      padding: "0 10px",
      background: vars.background.page,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {weekH.map((h, i) => {
        const p = Math.min(1, h / goal);
        const filled = p > 0;
        const color = p >= 1 ? vars.typography.green : p > 0 ? vars.typography.accent : vars.border.soft;
        return (
          <span
            key={i}
            title={`${DAYS[i]}: ${fmtHours(h)}h`}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: color,
              opacity: filled ? 0.4 + p * 0.6 : 0.35,
            }}
          />
        );
      })}
    </div>

    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 3,
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          color: displaySessionXp > 0 ? vars.typography.accent : vars.typography.faint,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: 0.2,
        }}
      >
        +{displaySessionXp}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 7,
          color: vars.typography.faint,
          textTransform: "uppercase",
          letterSpacing: 1.4,
          fontWeight: 600,
        }}
      >
        xp
      </span>
      {xpBump && (
        <span
          key={xpBump.id}
          className="xp-bump"
          style={{ color: vars.typography.accent }}
        >
          +{xpBump.delta}
        </span>
      )}
    </div>

    <prim.ActivityRing
      progress={gpct / 100}
      done={done}
      size={22}
      stroke={1.5}
    >
      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          fontFamily: MONO,
          color: done ? vars.typography.green : vars.typography.primary,
          letterSpacing: -0.2,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
        title={`${fmtHours(todayH)} / ${goal}h`}
      >
        {fmtHours(todayH)}
      </span>
    </prim.ActivityRing>

    <div
      className={justBumpedStreak ? "streak-pop" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 3,
        color: vars.typography.pink,
      }}
    >
      <FlameIcon size={10} />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          color: vars.typography.pink,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: 0.2,
        }}
      >
        {streak}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 7,
          color: vars.typography.faint,
          textTransform: "uppercase",
          letterSpacing: 1.4,
          fontWeight: 600,
        }}
      >
        {t("today.stat.streak")}
      </span>
    </div>

    <button
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      title={mode === "light" ? "Switch to dark" : "Switch to light"}
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "transparent",
        border: `1px solid ${vars.border.soft}`,
        color: vars.typography.secondary,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "all .15s ease",
      }}
    >
      {mode === "light" ? <SunIcon size={11} /> : <MoonIcon size={11} />}
    </button>

    <button
      onClick={() => goSize("full")}
      title={lang === "sv" ? "Ã–ppna sidomenyn" : "Open sidebar"}
      style={{
        height: 22,
        padding: "0 12px",
        borderRadius: 999,
        background: vars.typography.accent,
        border: "none",
        color: vars.typography.onAccent,
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all .15s ease",
      }}
    >
      {lang === "sv" ? "Ã–ppna" : "Open"}
    </button>
  </div>
</div>
{modeOverlay}
    </>
  );
}
