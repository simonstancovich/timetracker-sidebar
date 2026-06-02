import { useState } from 'react'
import { useTranslation, type Lang } from '../lib/i18n'
import { cx } from '../lib/cx'
import { createLog } from '../lib/logger'
import { vars } from '../theme'
import { SunIcon } from '../icons/SunIcon'
import { MoonIcon } from '../icons/MoonIcon'
import { PinIcon } from '../icons/PinIcon'
import * as s from './AppFooter.css'

const log = createLog('AppFooter')

interface Props {
  mode: 'light' | 'dark'
  setMode: (m: 'light' | 'dark') => void
  lang: Lang
  setLang: (l: Lang) => void
  pinned: boolean
  setPinned: (next: (prev: boolean) => boolean) => void
  onShowIntro: () => void
  onSignOut: () => void
  addFloat: (txt: string, col: string) => void
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
  addFloat,
}: Props) {
  const { t } = useTranslation()
  const [sendingLog, setSendingLog] = useState(false)
  const sendLog = async () => {
    if (sendingLog) return
    setSendingLog(true)
    try {
      const result = await window.electronAPI.sendLogReport()
      log.info('sendLogReport result', result)
      if (result && result.ok) {
        addFloat(t('footer.sendLogDone'), vars.typography.green)
      } else {
        const err = (result && 'error' in result && result.error) || `unexpected response ${JSON.stringify(result)}`
        addFloat(t('footer.sendLogFailed', { err }), vars.typography.error)
      }
    } catch (err) {
      log.error('sendLogReport failed', { error: String(err) })
      addFloat(t('footer.sendLogFailed', { err: String(err) }), vars.typography.error)
    } finally {
      setSendingLog(false)
    }
  }
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
      <button
        type="button"
        onClick={sendLog}
        title={t('footer.sendLog')}
        aria-label={t('footer.sendLog')}
        disabled={sendingLog}
        className={s.sendLogBtn}
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 4h16v16H4z" />
          <path d="M4 4l8 8 8-8" />
        </svg>
      </button>
      <button onClick={onSignOut} title={t('footer.signOut')} className={s.signOutBtn}>
        {t('footer.signOut')}
      </button>
    </div>
  )
}
