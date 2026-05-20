import type { Lang } from "./i18n";

export type SmartDateT = (key: string, vars?: Record<string, string | number>) => string;

export function smartDate(date: Date, lang: Lang, t: SmartDateT): string {
  const locale = lang === "sv" ? "sv-SE" : "en-GB";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);

  if (diffDays === 0) return t("date.today");
  if (diffDays === 1) return t("date.yesterday");
  if (diffDays === -1) return t("date.tomorrow");
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: "long" });
  }
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
