import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./WeekDayCard.css";

type HoursTone = keyof typeof s.hoursColor;

interface Props {
  weekday: string;
  dayNumber: string;
  hoursLabel: string;
  hoursTone: HoursTone;
  isToday: boolean;
  loaded: boolean;
  title: string;
  onClick: () => void;
}

export function WeekDayCard({
  weekday,
  dayNumber,
  hoursLabel,
  hoursTone,
  isToday,
  loaded,
  title,
  onClick,
}: Props) {
  return (
    <prim.Button
      variant="link"
      onClick={onClick}
      disabled={!loaded}
      title={title}
      className={cx(s.card, isToday && s.cardToday, !loaded && s.cardDisabled)}
    >
      <prim.Text as="span" className={cx(s.weekday, isToday && s.weekdayToday)}>
        {weekday}
      </prim.Text>
      <prim.Text as="span" className={cx(s.dayNum, isToday && s.dayNumToday)}>
        {dayNumber}
      </prim.Text>
      <prim.Text as="span" className={cx(s.hours, s.hoursColor[hoursTone])}>
        {hoursLabel}
      </prim.Text>
    </prim.Button>
  );
}
