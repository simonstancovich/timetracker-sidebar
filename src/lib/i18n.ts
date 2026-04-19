// Thin adapter over i18next. Existing call sites use `t(key, lang, vars)` and
// `pickGreeting / pickFunMessage / pickTip`; this module preserves that API
// while routing all copy through standard i18next JSON catalogs in /locales.
//
// Why i18next: industry-standard runtime, plays well with TMS tools (Lokalise,
// Tolgee, Crowdin) that expect per-language JSON files, supports ICU plural
// forms when we need them, and keeps the door open to a translator workflow.

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enResources from '../locales/en.json'
import svResources from '../locales/sv.json'

export type Lang = 'en' | 'sv'

if (!i18n.isInitialized) {
  void i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: enResources },
        sv: { translation: svResources },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnNull: false,
    })
}

// Re-export useTranslation so call sites import from one place.
export { useTranslation } from 'react-i18next'

// Back-compat: keep the (key, lang, vars) signature so existing call sites
// don't have to migrate. Internally uses i18next's per-language fixed-T.
export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  return i18n.getFixedT(lang)(key, vars) as string
}

// Returns undefined if the key is not in the catalog. Useful for optional
// fields like `intro.x.hint` where the absence should mean "no hint".
export function tOpt(key: string, lang: Lang, vars?: Record<string, string | number>): string | undefined {
  return i18n.exists(key, { lng: lang }) ? t(key, lang, vars) : undefined
}

export function setLang(lang: Lang) {
  if (i18n.language !== lang) void i18n.changeLanguage(lang)
}

// ─── Random pools ───────────────────────────────────────────────────────────
// Pool entries use single-brace `{name}` placeholders and are picked at
// runtime, then template-substituted manually. i18next's interpolation only
// runs on `t()` calls, not on array-of-strings lookups.

const subRe = /\{(\w+)\}/g
const applyTemplate = (s: string, vars: Record<string, string>) =>
  s.replace(subRe, (_, k) => (k in vars ? vars[k] : `{${k}}`))

const pickFromArray = (key: string, lang: Lang): string => {
  const arr = i18n.getResource(lang, 'translation', key) as string[] | undefined
  if (!Array.isArray(arr) || arr.length === 0) return ''
  return arr[Math.floor(Math.random() * arr.length)]
}

export function pickGreeting(name: string, lang: Lang = 'en'): string {
  const tpl = pickFromArray('greetings', lang)
  if (!tpl) return ''
  return applyTemplate(tpl, { name: name || (lang === 'sv' ? 'du' : 'friend') })
}

export function pickFunMessage(lang: Lang = 'en'): string {
  return pickFromArray('funMessages', lang)
}

export function pickTip(lang: Lang = 'en'): string {
  return pickFromArray('productivityTips', lang)
}

// ─── Achievement records ────────────────────────────────────────────────────
// Records (achievements, intro steps) are stored as data with structural keys
// only; localized strings flow through the same i18n catalog so adding a
// language never touches the data file.

export const achName = (id: string, lang: Lang) => t(`achievements.${id}.name`, lang)
export const achDescription = (id: string, lang: Lang) => t(`achievements.${id}.description`, lang)
