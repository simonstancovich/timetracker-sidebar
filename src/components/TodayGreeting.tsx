import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import * as s from "./TodayGreeting.css";

interface Props {
  firstName: string;
  message: string;
}

export function TodayGreeting({ firstName, message }: Props) {
  const { t } = useTranslation();
  const hr = new Date().getHours();
  const greeting =
    hr >= 5 && hr < 12
      ? t("greet.morning")
      : hr >= 12 && hr < 17
        ? t("greet.afternoon")
        : hr >= 17 && hr < 22
          ? t("greet.evening")
          : t("greet.latenight");
  if (!firstName) return null;
  return (
    <prim.Stack className={s.wrap}>
      <prim.Text as="div" className={s.heading}>
        {greeting}, {firstName}.
      </prim.Text>
      {message && (
        <prim.Text as="div" className={s.subtitle}>
          {message}
        </prim.Text>
      )}
    </prim.Stack>
  );
}
