import { achDescription, achName, useTranslation, type Lang } from '../lib/i18n'
import * as prim from '../primitives'
import { cx } from '../lib/cx'
import type { Ach } from '../lib/achievements'
import * as s from './AchievementToast.css'

interface Props {
  ach: Ach | null
  lang: Lang
}

export function AchievementToast({ ach, lang }: Props) {
  const { t } = useTranslation()
  if (!ach) return null
  return (
    <div role="status" aria-live="polite" className={cx(s.root, s.tone[ach.tone])}>
      <div className={s.iconCircle}>{ach.e}</div>
      <prim.Stack gap="none" minWidth0>
        <span className={s.eyebrow}>{t('xp.achievementUnlocked')}</span>
        <prim.Text size="md" weight="bold" color="primary">
          {achName(ach.id, lang)}
        </prim.Text>
        <prim.Text size="xs" color="tertiary">
          {achDescription(ach.id, lang)}
        </prim.Text>
      </prim.Stack>
      <span className={s.xpBadge}>+{ach.xp} XP</span>
    </div>
  )
}
