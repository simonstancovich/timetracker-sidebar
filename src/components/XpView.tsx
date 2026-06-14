import { useTranslation, achName, type Lang } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { ACHS } from "../lib/achievements";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { Page } from "./Page";
import { ChapterHeading } from "./ChapterHeading";
import * as s from "./XpView.css";

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
  const lang = i18n.language as Lang;
  const level = Math.floor(xp / 1000) + 1;
  const xpNext = level * 1000;
  const pct = (xp - (level - 1) * 1000) / 1000;
  const title =
    level >= 5 ? t("xp.titlePrincipal") : level >= 3 ? t("xp.titleSenior") : t("xp.titleDev");

  return (
    <Page title={t("page.progress")} hint={`${t("page.level")} ${level}`} gap="sm">
      <prim.Stack data-tour="xp-level" align="center" gap="xs" paddingY="xs">
        <prim.MonoText size="2xs" weight="bold" color="faint" tracking="loosest" transform="uppercase">
          {t("page.level")}
        </prim.MonoText>
        <prim.DisplayText tabular align="center" className={s.levelNumber}>
          {level}
        </prim.DisplayText>
        <prim.DisplayText italic size="xl" align="center" color="tertiary" leading="snug">
          {title}
        </prim.DisplayText>
      </prim.Stack>

      <prim.Stack gap="xs">
        <prim.ProgressBar value={pct} size="thin" tone="gradient" />
        <prim.Stack direction="row" justify="spaceBetween">
          <prim.MonoText size="xs" weight="semibold" color="tertiary" tabular>
            {xp.toLocaleString()} XP
          </prim.MonoText>
          <prim.MonoText size="xs" weight="semibold" color="faint" tabular>
            {(xpNext - xp).toLocaleString()} {t("xp.toNext")}
          </prim.MonoText>
        </prim.Stack>
      </prim.Stack>

      {xpCoach && (
        <prim.DisplayText
          italic
          size="lg"
          align="center"
          color="tertiary"
          leading="relaxed"
          className={s.coach}
        >
          {xpCoach}
        </prim.DisplayText>
      )}

      <prim.Divider />

      <prim.Stack gap="md">
        <prim.Stack direction="row" justify="spaceBetween" align="baseline">
          <prim.MonoText
            size="2xs"
            weight="semibold"
            color="tertiary"
            tracking="loosest"
            transform="uppercase"
          >
            {t("xp.thisWeek")}
          </prim.MonoText>
          <prim.MonoText size="xs" weight="bold" color="accent" tabular>
            +{Math.round(weekTotal * 8).toLocaleString()} XP
          </prim.MonoText>
        </prim.Stack>

        <prim.Stack direction="row" gap="sm" className={s.chart}>
          {weekH.map((h, i) => {
            const isFut = i > todayI;
            const isToday = i === todayI;
            const empty = !isFut && h === 0;
            const tone: prim.BarFillTone = h >= goal ? "met" : isToday ? "today" : "partial";
            return (
              <prim.Stack key={i} flex1 align="center" gap="xs">
                <prim.Stack
                  flex1
                  fullWidth
                  justify="end"
                  className={cx(s.bar, isFut && s.barFuture, empty && s.barMissed)}
                >
                  {isFut || empty ? null : (
                    <prim.BarFill fraction={h / goal} tone={tone} active={isToday} />
                  )}
                </prim.Stack>
                <prim.MonoText
                  size="3xs"
                  weight="bold"
                  tabular
                  color={empty ? "error" : isToday ? "accent" : isFut ? "faint" : "secondary"}
                >
                  {isFut ? "—" : fmtHours(h)}
                </prim.MonoText>
                <prim.MonoText
                  size="3xs"
                  weight={isToday ? "bold" : "semibold"}
                  tracking="looser"
                  transform="uppercase"
                  color={isToday ? "accent" : "tertiary"}
                >
                  {DAYS[i]}
                </prim.MonoText>
              </prim.Stack>
            );
          })}
        </prim.Stack>

        <prim.DisplayText italic size="md" align="center" color="tertiary" leading="relaxed">
          {t("xp.thisWeekLine", { hours: fmtHours(weekTotal) })}
        </prim.DisplayText>
      </prim.Stack>

      <prim.Divider />

      <ChapterHeading title={t("xp.achievements")} hint={`${unlocked.length} / ${ACHS.length}`} />

      <prim.Grid columns={3} gap="sm" data-tour="xp-achievements">
        {ACHS.map((a) => {
          const got = unlocked.includes(a.id);
          return (
            <prim.ColorScope
              key={a.id}
              color={a.co}
              className={cx("engrave-card", s.achCard, got && s.achCardOn)}
            >
              <prim.Text as="span" className={cx(s.achEmoji, !got && s.achEmojiMuted)}>
                {a.e}
              </prim.Text>
              <prim.DisplayText
                size="md"
                align="center"
                leading="snug"
                color="tertiary"
                className={got ? s.achName : undefined}
              >
                {got ? achName(a.id, lang) : t("xp.locked")}
              </prim.DisplayText>
              {got && (
                <prim.MonoText
                  size="3xs"
                  weight="bold"
                  tracking="looser"
                  transform="uppercase"
                  tabular
                  className={s.achXp}
                >
                  +{a.xp} XP
                </prim.MonoText>
              )}
            </prim.ColorScope>
          );
        })}
      </prim.Grid>
    </Page>
  );
}
