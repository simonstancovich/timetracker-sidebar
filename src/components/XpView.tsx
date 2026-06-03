import { useTranslation, achName, type Lang } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { ACHS } from "../lib/achievements";
import { vars } from "../theme";
import { useAppContext } from "../lib/AppContext";
import { MONO, SERIF } from "../lib/fonts";
import * as prim from "../primitives";
import { Page } from "./Page";
import { ChapterHeading } from "./ChapterHeading";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr"];

interface Props {
  xp: number;
  xpCoach: string;
  weekTotal: number;
  weekH: number[];
  todayI: number;
  unlocked: string[];
  goal: number;
}

export function XpView({ xp, xpCoach, weekTotal, weekH, todayI, unlocked, goal }: Props) {
  const { t, i18n } = useTranslation();
  const { mode } = useAppContext();
  const lang = i18n.language as Lang;
  const level = Math.floor(xp / 1000) + 1;
  const xpBase = (level - 1) * 1000;
  const xpNext = level * 1000;
  const pct = Math.min(((xp - xpBase) / (xpNext - xpBase)) * 100, 100);

  return (
    <Page title={t("page.progress")} hint={`${t("page.level")} ${level}`} gap="sm">
      {/* Level hero */}
      <div
        data-tour="xp-level"
        style={{
          textAlign: "center",
          padding: "8px 0 10px",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            color: vars.typography.faint,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {t("page.level")}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 92,
            fontWeight: 400,
            color: vars.typography.primary,
            letterSpacing: -3,
            lineHeight: 0.9,
            margin: "4px 0 4px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {level}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 16,
            color: vars.typography.tertiary,
            lineHeight: 1.3,
            letterSpacing: -0.1,
          }}
        >
          {level >= 5
            ? t("xp.titlePrincipal")
            : level >= 3
              ? t("xp.titleSenior")
              : t("xp.titleDev")}
        </div>
      </div>

      {/* XP progress bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <prim.ProgressBar value={pct / 100} size="thin" tone="gradient" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: MONO,
            fontSize: 10,
            color: vars.typography.tertiary,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{xp.toLocaleString()} XP</span>
          <span style={{ color: vars.typography.faint }}>
            {(xpNext - xp).toLocaleString()} {t("xp.toNext")}
          </span>
        </div>
      </div>

      {xpCoach && (
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: vars.typography.tertiary,
            lineHeight: 1.4,
            textAlign: "center",
            padding: "0 8px",
          }}
        >
          {xpCoach}
        </div>
      )}

      {/* Week bar chart */}
      <div
        style={{
          paddingTop: 14,
          borderTop: `1px solid ${vars.border.soft}`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 600,
              color: vars.typography.tertiary,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            {t("xp.thisWeek")}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: vars.typography.accent,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            +{Math.round(weekTotal * 8).toLocaleString()} XP
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            height: 90,
          }}
        >
          {weekH.map((h, i) => {
            const isFut = i > todayI,
              isToday = i === todayI,
              empty = !isFut && h === 0;
            const p2 = isFut ? 0 : Math.min((h / goal) * 100, 100);
            const bc = h >= goal ? vars.typography.green : isToday ? vars.typography.accent : "#d97706";
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    width: "100%",
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  {isFut ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        border: `1px dashed ${vars.border.soft}`,
                        borderRadius: 4,
                      }}
                    />
                  ) : empty ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "1px dashed rgba(239, 68, 68, 0.35)",
                        background: "rgba(239, 68, 68, 0.05)",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: `${p2}%`,
                        background: bc,
                        borderRadius: 4,
                        minHeight: 6,
                        outline: isToday ? `1.5px solid ${vars.typography.accent}` : "none",
                        outlineOffset: 1,
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    fontWeight: 700,
                    color: empty
                      ? vars.typography.error
                      : isToday
                        ? vars.typography.accent
                        : isFut
                          ? vars.typography.faint
                          : vars.typography.secondary,
                    letterSpacing: 0.2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {isFut ? "—" : fmtHours(h)}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    fontWeight: isToday ? 700 : 600,
                    color: isToday ? vars.typography.accent : vars.typography.tertiary,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                  }}
                >
                  {DAYS[i]}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: vars.typography.tertiary,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {t("xp.thisWeekLine", { hours: fmtHours(weekTotal) })}
        </div>
      </div>

      <div style={{ paddingTop: 14, borderTop: `1px solid ${vars.border.soft}` }}>
        <ChapterHeading
          title={t("xp.achievements")}
          hint={`${unlocked.length} / ${ACHS.length}`}
        />
      </div>
      <div
        data-tour="xp-achievements"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {ACHS.map((a) => {
          const got = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className="engrave-card"
              style={{
                background: got
                  ? mode === "dark"
                    ? `${a.co}14`
                    : `${a.co}0d`
                  : "transparent",
                border: got
                  ? `1px solid ${a.co}55`
                  : `1px solid ${vars.border.soft}`,
                borderRadius: 10,
                padding: "12px 6px 10px",
                textAlign: "center",
                opacity: got ? 1 : 0.45,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1,
                  filter: got ? "none" : "grayscale(1)",
                }}
              >
                {a.e}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  color: got ? a.co : vars.typography.tertiary,
                  lineHeight: 1.15,
                  letterSpacing: -0.1,
                  marginTop: 2,
                }}
              >
                {got ? achName(a.id, lang) : t("xp.locked")}
              </div>
              {got && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    fontWeight: 700,
                    color: a.co,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    marginTop: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  +{a.xp} XP
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
