import { useTranslation, type Lang } from '../lib/i18n'
import { cx } from '../lib/cx'
import { SunIcon } from '../icons/SunIcon'
import { MoonIcon } from '../icons/MoonIcon'
import { PinIcon } from '../icons/PinIcon'
import * as s from './AppFooter.css'

interface Props {
  mode: 'light' | 'dark'
  setMode: (m: 'light' | 'dark') => void;
  lang: Lang
  setLang: (l: Lang) => void
  pinned: boolean
  setPinned: (next: (prev: boolean) => boolean) => void
  onShowIntro: () => void
  onSignOut: () => void
}

export function AppFooter({
  mode,
  setMode,
  lang,
  setLang,
  pinned,
  setPinned,
  onShowIntro,
  onSignOut,
}: Props) {
  const { t } = useTranslation()
  return (
    <div className={s.root}>
      <div data-tour="footer-theme" className={s.modeGroup} role="radiogroup" aria-label={t('footer.theme')}>
        {(['light', 'dark'] as const).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={mode === m}
            aria-label={t(`footer.${m}Mode`)}
            onClick={() => setMode(m)}
            className={cx(s.modeBtn, mode === m && s.modeBtnActive)}
          >
            {m === 'light' ? <SunIcon /> : <MoonIcon />}
          </button>
        ))}
      </div>
      <button
        data-tour="footer-lang"
        onClick={() => setLang(lang === 'en' ? 'sv' : 'en')}
        title={t('lang.switchTo')}
        aria-label={t('lang.switchTo')}
        className={s.langBtn}
      >
        {lang === 'en' ? '🇸🇪' : '🇬🇧'}
      </button>
      <button
        type="button"
        data-tour="footer-pin"
        onClick={() => setPinned((v) => !v)}
        aria-pressed={pinned}
        title={pinned ? t('footer.unpinSidebar') : t('footer.pinSidebar')}
        className={cx(s.pinBtn, pinned && s.pinBtnActive)}
      >
        <PinIcon />
      </button>
      <button
        data-tour="footer-help"
        onClick={onShowIntro}
        title={t('footer.showIntro')}
        aria-label={t('footer.showIntro')}
        className={s.helpBtn}
      >
        ?
      </button>
      <button onClick={onSignOut} title={t('footer.signOut')} className={s.signOutBtn}>
        {t('footer.signOut')}
      </button>
    </div>
  )
}
