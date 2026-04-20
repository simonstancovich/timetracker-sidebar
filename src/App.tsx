import { useEffect, useMemo, useRef, useState } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { Combobox } from './components/Combobox'
import {
  Company,
  Project,
  TimeEntry,
  buildSavePayload,
  deleteTimeEntry,
  loadCompanies,
  loadProjects,
  loadTimeEntries,
  loadUsers,
  saveTimeEntry,
} from './api'
import { formatLocalDate } from './lib/date'
import { fmtHours, parseHoursInput } from './lib/hours'
import { CHECKS, EMPTY_ACH_STATS, isoWeekKey, type AchCtx, type AchStats } from './lib/achievements'
import { pickRandomMessage } from './lib/funMessages'
import { pickTip } from './lib/productivityTips'
import { pickGreeting } from './lib/greetingMessages'
import { getTimerInsight } from './lib/timerInsights'
import { emptyTodayMessage, saveCheer, xpCoachNote } from './lib/personality'
import { getHolidays, isWorkingDay } from './lib/swedishHolidays'
import { Lang, useTranslation, setLang as setI18nLang, achName, achDescription } from './lib/i18n'
import { useModal } from './lib/useModal'
import { buildIntroSteps } from './lib/introSteps'
import { IntroOverlay } from './components/IntroOverlay'
import { MeetingsWidget } from './components/MeetingsWidget'
import { MonthView } from './components/MonthView'
import { WeekView } from './components/WeekView'
import { light as L, dark as D, type Theme, lightTheme, darkTheme } from './theme'

// Language-agnostic achievement records. Localized name + description live
// in /locales/{lang}.json under `achievements.{id}.{name,description}` and
// are read via `achName(id, lang)` / `achDescription(id, lang)`.
const ACHS = [
  // First-time milestones
  { id: 'first',       e: '🎯',  xp: 50,   co: '#7c3aed' },
  { id: 'rookie',      e: '📋',  xp: 75,   co: '#8b5cf6' },
  { id: 'novice',      e: '📝',  xp: 150,  co: '#6366f1' },
  { id: 'veteran',     e: '🎖️',  xp: 250,  co: '#4f46e5' },
  { id: 'prolific',    e: '📚',  xp: 750,  co: '#3730a3' },

  // Streaks
  { id: 'warmup',      e: '☕',  xp: 50,   co: '#f97316' },
  { id: 'fire',        e: '🔥',  xp: 100,  co: '#ea580c' },
  { id: 'habit',       e: '🔗',  xp: 175,  co: '#dc2626' },
  { id: 'lockin',      e: '🔒',  xp: 300,  co: '#b91c1c' },
  { id: 'disciplined', e: '🧘',  xp: 500,  co: '#991b1b' },
  { id: 'obsessed',    e: '⚡',  xp: 800,  co: '#eab308' },
  { id: 'unstoppable', e: '🚀',  xp: 1200, co: '#ca8a04' },
  { id: 'legend',      e: '👑',  xp: 2500, co: '#a16207' },

  // Hours accumulated
  { id: 'quarter',     e: '🌱',  xp: 100,  co: '#22c55e' },
  { id: 'flow',        e: '🌊',  xp: 150,  co: '#0ea5e9' },
  { id: 'cent',        e: '💯',  xp: 300,  co: '#0891b2' },
  { id: 'dedicated',   e: '💪',  xp: 500,  co: '#0e7490' },
  { id: 'halfgrand',   e: '🏅',  xp: 750,  co: '#155e75' },
  { id: 'grand',       e: '🏆',  xp: 1250, co: '#be185d' },
  { id: 'mythic',      e: '💎',  xp: 2500, co: '#9f1239' },
  { id: 'legacy',      e: '🗿',  xp: 5000, co: '#881337' },

  // Daily peaks
  { id: 'solid',       e: '📈',  xp: 50,   co: '#14b8a6' },
  { id: 'full',        e: '✅',  xp: 80,   co: '#059669' },
  { id: 'goal',        e: '⭐',  xp: 120,  co: '#16a34a' },
  { id: 'lord',        e: '⏰',  xp: 175,  co: '#15803d' },
  { id: 'midnight',    e: '🌙',  xp: 275,  co: '#166534' },
  { id: 'impossible',  e: '🤯',  xp: 500,  co: '#14532d' },

  // Time of day
  { id: 'early',       e: '🌅',  xp: 75,   co: '#f59e0b' },
  { id: 'dawn',        e: '🌄',  xp: 150,  co: '#d97706' },
  { id: 'night',       e: '🦉',  xp: 75,   co: '#6366f1' },
  { id: 'vampire',     e: '🦇',  xp: 125,  co: '#4f46e5' },
  { id: 'twilight',    e: '🌇',  xp: 40,   co: '#c026d3' },
  { id: 'lunch',       e: '🥪',  xp: 50,   co: '#db2777' },

  // Variety
  { id: 'multi',       e: '🎭',  xp: 100,  co: '#9333ea' },
  { id: 'collector',   e: '🗂️',  xp: 250,  co: '#7e22ce' },
  { id: 'hopper',      e: '🐸',  xp: 125,  co: '#6b21a8' },
  { id: 'renaissance', e: '🎨',  xp: 400,  co: '#581c87' },
  { id: 'focused',     e: '🎯',  xp: 100,  co: '#0d9488' },

  // Weekly / monthly
  { id: 'perfectweek', e: '🌟',  xp: 350,  co: '#fbbf24' },
  { id: 'perfectmonth',e: '✨',  xp: 1500, co: '#f59e0b' },
  { id: 'king',        e: '♛',  xp: 1000, co: '#d97706' },
  { id: 'comeback',    e: '💫',  xp: 75,   co: '#06b6d4' },
  { id: 'weekend',     e: '🌴',  xp: 60,   co: '#10b981' },
  { id: 'break',       e: '🏖️',  xp: 25,   co: '#22d3ee' },

  // Billing
  { id: 'firstinv',    e: '💰',  xp: 50,   co: '#84cc16' },
  { id: 'bigweek',     e: '💵',  xp: 300,  co: '#65a30d' },
  { id: 'moneymaker',  e: '💸',  xp: 1750, co: '#4d7c0f' },

  // Quirky
  { id: 'speed',       e: '⚡',  xp: 80,   co: '#a855f7' },
  { id: 'overachiever',e: '🔥',  xp: 600,  co: '#ef4444' },
  { id: 'editor',      e: '✏️',  xp: 50,   co: '#64748b' },
] as const
type Ach = (typeof ACHS)[number]

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr']
const GOAL = 8

const pad = (n: number) => String(n).padStart(2, '0')

// Playful status under the timer clock — text and icon kept separate so the
// text can be centered without the icon pulling it off-center.
function vibe(tSec: number, tRun: boolean, lang: Lang = 'en'): { text: string; icon: string } {
  const en = lang === 'en'
  if (!tRun) return tSec > 0
    ? { text: en ? 'On a break — press ▶ to resume' : 'På paus — tryck ▶ för att återuppta', icon: '' }
    : { text: en ? 'Ready when you are' : 'Redo när du är', icon: '✨' }
  const m = tSec / 60
  if (m < 2)   return { text: en ? 'Warming up' : 'Värmer upp',                icon: '☕' }
  if (m < 10)  return { text: en ? 'Finding flow' : 'Hittar flow',             icon: '🎯' }
  if (m < 25)  return { text: en ? 'In the zone' : 'I zonen',                  icon: '✨' }
  if (m < 50)  return { text: en ? 'Deep focus' : 'Djupt fokus',               icon: '🧘' }
  if (m < 90)  return { text: en ? 'Crushing it' : 'Krossar det',              icon: '🔥' }
  if (m < 150) return { text: en ? 'Unstoppable' : 'Ostoppbar',                icon: '⚡' }
  if (m < 240) return { text: en ? 'Legendary' : 'Legendarisk',                icon: '🏆' }
  return       { text: en ? 'Maybe stretch a little?' : 'Stretcha kanske lite?', icon: '🌱' }
}

const fmtClock = (s: number) =>
  `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
const fmtDateISO = formatLocalDate
const mondayOf = (d: Date) => {
  const r = new Date(d)
  const day = (r.getDay() + 6) % 7 // Mon=0
  r.setDate(r.getDate() - day)
  r.setHours(0, 0, 0, 0)
  return r
}

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [lang, setLang] = useState<Lang>('en')
  const { t } = useTranslation()
  const M: Theme = mode === 'light' ? L : D

  const [tab, setTab] = useState<'today' | 'timer' | 'history' | 'xp'>('today')
  // History tab navigates independently; selectedDate drives week/month anchors.
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [historyScale, setHistoryScale] = useState<'week' | 'month'>('week')

  // Inline expandable "+ Log past time" form on the Timer tab.
  const [logOpen, setLogOpen] = useState(false)

  // When the user clicks a day in Week/Month, Today switches to show that
  // day's entries. null = today.
  const [viewDate, setViewDate] = useState<Date | null>(null)
  const [viewDateEntries, setViewDateEntries] = useState<TimeEntry[]>([])
  const [viewDateLoading, setViewDateLoading] = useState(false)

  const stepHistoryDate = (dir: 1 | -1) => {
    if (historyScale === 'week') {
      setSelectedDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 7 * dir); return n })
    } else {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1))
    }
  }
  const historyIsOnCurrent = (() => {
    const now = new Date()
    if (historyScale === 'week') {
      const monA = new Date(selectedDate); monA.setDate(monA.getDate() - ((monA.getDay() + 6) % 7)); monA.setHours(0,0,0,0)
      const monB = new Date(now); monB.setDate(monB.getDate() - ((monB.getDay() + 6) % 7)); monB.setHours(0,0,0,0)
      return +monA === +monB
    }
    return selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth()
  })()
  const jumpHistoryToCurrent = () => setSelectedDate(new Date())
  const [size, setWindowSize] = useState<'full' | 'top'>('full')

  // Bump at the start of every minute so the header clock ticks forward, and
  // so midnight-derived values (`todayI`, greetings) recompute automatically.
  const [nowTick, setNowTick] = useState(0)
  useEffect(() => {
    let id = 0
    const schedule = () => {
      const now = new Date()
      const nextMinute = new Date(now)
      nextMinute.setSeconds(0, 0)
      nextMinute.setMinutes(nextMinute.getMinutes() + 1)
      id = window.setTimeout(() => { setNowTick((n) => n + 1); schedule() }, Math.max(200, +nextMinute - +now))
    }
    schedule()
    return () => clearTimeout(id)
  }, [])

  const [sessionXp, setSessionXp] = useState(0)
  const lastXp = useRef<number | null>(null)
  const sessionSettledAt = useRef(Date.now() + 2500)
  const [funMessage, setFunMessage] = useState<string | null>(null)
  const [xpBump, setXpBump] = useState<{ id: number; delta: number } | null>(null)
  const xpBumpId = useRef(0)
  const [showIntro, setShowIntro] = useState(false)
  const [introChecked, setIntroChecked] = useState(false)
  const [introStep, setIntroStep] = useState(0)
  const [greetingMsg, setGreetingMsg] = useState<string>('')
  const [timerInsight, setTimerInsight] = useState<string>('')
  const [modeTransition, setModeTransition] = useState<'idle' | 'out' | 'in'>('idle')

  const goSize = async (s: 'full' | 'top') => {
    if (s === 'full' && tRun) setTab('timer')
    if (modeTransition !== 'idle') return
    setModeTransition('out')
    await new Promise((r) => setTimeout(r, 180))
    setWindowSize(s)
    await window.electronAPI.setSize(s)
    setModeTransition('in')
    setTimeout(() => setModeTransition('idle'), 200)
  }

  const confirmSignOut = () => {
    if (window.confirm(t('footer.confirmSignOut'))) {
      window.electronAPI.signOut()
    }
  }

  const [currentUser, setCurrentUser] = useState<{ _user_id: string; username: string } | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [projectCache, setProjectCache] = useState<Record<string, Project[]>>({})
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [weekH, setWeekH] = useState<number[]>([0, 0, 0, 0, 0])

  const [xp, setXp] = useState(0)

  useEffect(() => {
    if (Date.now() < sessionSettledAt.current) {
      lastXp.current = xp
      return
    }
    if (lastXp.current !== null && xp > lastXp.current) {
      setSessionXp((s) => s + (xp - lastXp.current!))
    }
    lastXp.current = xp
  }, [xp])

  useEffect(() => {
    if (size !== 'top') { setFunMessage(null); return }
    let hideId: number | undefined
    let showTip = false
    const show = () => {
      setFunMessage(showTip ? pickTip(lang) : pickRandomMessage(lang))
      showTip = !showTip
      hideId = window.setTimeout(() => setFunMessage(null), 18000)
    }
    const initialId = window.setTimeout(show, 5000)
    const rotateId = window.setInterval(show, 45000)
    return () => {
      clearTimeout(initialId)
      clearInterval(rotateId)
      if (hideId) clearTimeout(hideId)
    }
  }, [size, lang])
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [floats, setFloats] = useState<{ id: number; txt: string; col: string }[]>([])
  const [ach, setAch] = useState<Ach | null>(null)
  const [pendingAchs, setPendingAchs] = useState<Ach[]>([])
  const [achStats, setAchStats] = useState<AchStats>(EMPTY_ACH_STATS)
  const [achStatsLoaded, setAchStatsLoaded] = useState(false)
  const fid = useRef(0)

  // Timer state
  const [tSec, setTSec] = useState(0)
  const [tRun, setTRun] = useState(false)
  const [tCo, setTCo] = useState('')
  const [tPr, setTPr] = useState('')
  const [tD, setTD] = useState('')
  const [tNote, setTNote] = useState('')
  const [tInv, setTInv] = useState(true)
  const [timerLoaded, setTimerLoaded] = useState(false)
  const tick = useRef<number | null>(null)

  const prevDisplayXp = useRef(0)
  useEffect(() => {
    const current = sessionXp + (tRun ? Math.floor(tSec / 60) : 0)
    if (current > prevDisplayXp.current) {
      const delta = current - prevDisplayXp.current
      const id = ++xpBumpId.current
      setXpBump({ id, delta })
      const t = window.setTimeout(() => {
        setXpBump((cur) => (cur && cur.id === id ? null : cur))
      }, 1500)
      prevDisplayXp.current = current
      return () => clearTimeout(t)
    }
    prevDisplayXp.current = current
  }, [sessionXp, tRun, tSec])

  // Log form state
  const [fCo, setFCo] = useState('')
  const [fPr, setFPr] = useState('')
  const [fH, setFH] = useState(1)
  const [fD, setFD] = useState('')
  const [fNote, setFNote] = useState('')
  const [fInv, setFInv] = useState(true)
  const [fHInput, setFHInput] = useState('1:00')
  useEffect(() => { setFHInput(fmtHours(fH)) }, [fH])
  const [logFormLoaded, setLogFormLoaded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<Date | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<
    { title: string; body: string; confirmLabel: string; onConfirm: () => void | Promise<void> } | null
  >(null)
  const confirmationRef = useModal<HTMLDivElement>({
    enabled: !!confirmation,
    onClose: () => setConfirmation(null),
  })

  const resetTimer = () => {
    setTRun(false); setTSec(0); setTCo(''); setTPr(''); setTD(''); setTNote(''); setTInv(true)
    setDraftId(null); draftIdRef.current = null
  }

  const [pendingCancelTimer, setPendingCancelTimer] = useState(false)
  const cancelTimer = async () => {
    setPendingCancelTimer(false)
    const id = draftIdRef.current
    resetTimer()
    if (id) {
      // Best-effort: remove the crash-safe draft from the server. Swallow
      // errors — the local state is already cleared, so the user's intent
      // has been honored even if the round-trip fails.
      try { await deleteTimeEntry(id) } catch { /* ignore */ }
    }
  }

  const resetLogForm = () => {
    setEditingId(null); setEditingDate(null); setFCo(''); setFPr(''); setFH(1); setFD(''); setFNote(''); setFInv(true)
  }

  const stopAndLogCurrent = async () => {
    if (!tCo || !tPr || !tD.trim()) {
      addFloat(t('form.fillFirst'), '#ef4444')
      return
    }
    const h = Math.max(1, Math.ceil(tSec / 60)) / 60
    await saveNewEntry(tCo, tPr, h, tD.trim(), tInv, tNote.trim(), new Date(), draftIdRef.current)
    resetTimer()
    setTab('today')
  }

  const switchTaskGuarded = (
    cid: string, prid: string, desc: string,
    continueFrom?: { entryId: string; hours: number; note: string; invoice: boolean },
  ) => {
    const applySwitch = async () => {
      await ensureProjects(cid)
      setTCo(cid); setTPr(prid); setTD(desc)
      if (continueFrom) {
        setTNote(continueFrom.note)
        setTInv(continueFrom.invoice)
        setTSec(Math.round(continueFrom.hours * 3600))
        setDraftId(continueFrom.entryId)
        draftIdRef.current = continueFrom.entryId
        setTRun(true)
      } else {
        setTNote(''); setTInv(true); setTSec(0)
        setDraftId(null); draftIdRef.current = null
        setTRun(false)
      }
      setTab('timer')
    }

    const canSaveCurrent = !!(tCo && tPr && tD.trim() && tSec > 0)
    const saveCurrentAndSwitch = async () => {
      if (canSaveCurrent) {
        const h = Math.max(1, Math.ceil(tSec / 60)) / 60
        await saveNewEntry(tCo, tPr, h, tD.trim(), tInv, tNote.trim(), new Date(), draftIdRef.current)
      }
      await applySwitch()
    }

    if (tRun && canSaveCurrent) {
      // Timer is actively running → confirm before saving & switching.
      setConfirmation({
        title: t('timer.confirmSwitchTitle'),
        body: t('timer.confirmSwitchBody'),
        confirmLabel: t('timer.confirmSwitchOk'),
        onConfirm: saveCurrentAndSwitch,
      })
    } else if (canSaveCurrent) {
      // Paused with unsaved progress → save silently, then switch.
      saveCurrentAndSwitch()
    } else {
      applySwitch()
    }
  }

  const editEntry = async (entry: TimeEntry) => {
    setEditingId(entry.id)
    // Parse YYYY-MM-DD as a local date so the save keeps the original day
    // regardless of the calendar's currently-selected date or timezone.
    const [y, mo, d] = (entry.task_date || '').split('-').map(Number)
    setEditingDate(Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d) ? new Date(y, mo - 1, d) : null)
    setFCo(entry._company_id)
    await ensureProjects(entry._company_id)
    setFPr(entry._project_id)
    setFH(parseFloat(entry.hour) || 0)
    setFD(entry.description || '')
    setFNote(entry.internal_description || '')
    setFInv(entry.invoice === '1')
    setTab('timer')
    setLogOpen(true)
  }

  // ─── Auth gating ───────────────────────────────────────────────────────
  useEffect(() => {
    window.electronAPI.checkAuth().then(setAuthed)
    const unsubs = [
      window.electronAPI.onAuthSuccess(() => setAuthed(true)),
      window.electronAPI.onSignedOut(() => setAuthed(false)),
      window.electronAPI.onSessionLost(() => setAuthed(false)),
      window.electronAPI.onForcedSize((s) => setWindowSize(s)),
    ]
    return () => unsubs.forEach((off) => typeof off === 'function' && off())
  }, [])

  // Hydrate device-scoped prefs (mode, lang) before auth completes so the
  // LoginScreen and cold-start spinner already reflect the user's choices.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [m, l] = await Promise.all([
        window.electronAPI.storeGet('mode'),
        window.electronAPI.storeGet('lang'),
      ])
      if (cancelled) return
      if (m === 'dark' || m === 'light') setMode(m)
      if (l === 'en' || l === 'sv') setLang(l)
    })()
    return () => { cancelled = true }
  }, [])

  // Reset user-scoped state on sign-out so the next user doesn't inherit it.
  useEffect(() => {
    if (authed) return
    setXp(0); setUnlocked([]); setStreak(0)
    setAchStats(EMPTY_ACH_STATS); setAchStatsLoaded(false); setPendingAchs([]); setAch(null)
    setEntries([]); setEntriesLoading(true); setWeekH([0, 0, 0, 0, 0])
    setTRun(false); setTSec(0); setTCo(''); setTPr(''); setTD(''); setTNote(''); setTInv(true)
    setPendingCancelTimer(false)
    setFCo(''); setFPr(''); setFH(1); setFHInput('1:00'); setFD(''); setFNote(''); setFInv(true)
    setEditingId(null); setEditingDate(null)
    setDraftId(null); setSessionXp(0)
    setCurrentUser(null)
    setTimerLoaded(false); setLogFormLoaded(false)
  }, [authed])

  // ─── Persisted: mode, xp, unlocked, streak, timer ──────────────────────
  useEffect(() => {
    if (!authed) return
    ;(async () => {
      const [m, x, u, s, last, t, l] = await Promise.all([
        window.electronAPI.storeGet('mode'),
        window.electronAPI.storeGet('xp'),
        window.electronAPI.storeGet('unlocked'),
        window.electronAPI.storeGet('streak'),
        window.electronAPI.storeGet('lastLoggedDate'),
        window.electronAPI.storeGet('timer'),
        window.electronAPI.storeGet('lang'),
      ])
      if (m === 'dark' || m === 'light') setMode(m)
      if (l === 'en' || l === 'sv') setLang(l)
      setXp(typeof x === 'number' ? x : 0)
      setUnlocked(Array.isArray(u) ? u : [])
      const savedStats = await window.electronAPI.storeGet('achStats')
      setAchStats(savedStats && typeof savedStats === 'object' ? { ...EMPTY_ACH_STATS, ...savedStats } : EMPTY_ACH_STATS)
      setAchStatsLoaded(true)

      // Streak valid if we've logged today or on the most recent
      // previous working day (skipping weekends + Swedish holidays).
      const now = new Date()
      const today = fmtDateISO(now)
      const hols = getHolidays(now.getFullYear())
      const prev = new Date(now)
      do { prev.setDate(prev.getDate() - 1) } while (!isWorkingDay(prev, hols))
      const prevWD = fmtDateISO(prev)
      if (typeof s === 'number' && (last === today || last === prevWD)) setStreak(s)
      else setStreak(0)

      // restore running timer
      if (t && typeof t === 'object') {
        setTCo(t.tCo || '')
        setTPr(t.tPr || '')
        setTD(t.tD || '')
        setTNote(t.tNote || '')
        setTInv(typeof t.tInv === 'boolean' ? t.tInv : true)
        if (t.draftId) setDraftId(t.draftId)
        if (t.running && typeof t.startedAt === 'number') {
          setTSec(Math.max(0, Math.floor((Date.now() - t.startedAt) / 1000)))
          setTRun(true)
        } else {
          setTSec(typeof t.tSec === 'number' ? t.tSec : 0)
          setTRun(false)
        }
        if (t.tCo) { loadProjects(t.tCo).then((list) => setProjectCache((c) => ({ ...c, [t.tCo]: list }))).catch(() => {}) }
      }
      setTimerLoaded(true)
    })()
  }, [authed])

  useEffect(() => { window.electronAPI.storeSet('mode', mode) }, [mode])
  useEffect(() => {
    window.electronAPI.storeSet('lang', lang)
    setI18nLang(lang)
  }, [lang])

  useEffect(() => {
    const r = document.documentElement.style
    r.setProperty('--rec-color', M.pk)
    r.setProperty('--scrollbar-thumb', M.b1)
    r.setProperty('--select-bg', M.bg)
    r.setProperty('--select-fg', M.t1)
  }, [M])
  useEffect(() => {
    if (!authed || introChecked) return
    window.electronAPI.storeGet('intro_seen').then((seen) => {
      if (!seen) {
        setShowIntro(true)
        setIntroStep(0)
        if (size !== 'full') goSize('full')
      }
      setIntroChecked(true)
    })
  }, [authed, introChecked])

  const dismissIntro = () => {
    setShowIntro(false)
    setIntroStep(0)
    window.electronAPI.storeSet('intro_seen', true)
    window.electronAPI.setBlurCollapseDisabled(false)
  }

  const introSteps = useMemo(() => buildIntroSteps(lang), [lang])
  const advanceIntro = () => {
    setIntroStep((s) => {
      const next = s + 1
      if (next >= introSteps.length) {
        dismissIntro()
        return 0
      }
      return next
    })
  }

  const startIntroFresh = () => {
    setTRun(false)
    setTSec(0)
    setTCo('')
    setTPr('')
    setTD('')
    setTNote('')
    setTab('today')
    setIntroStep(0)
    setShowIntro(true)
    if (size !== 'full') goSize('full')
  }

  const devcoreId = (
    companies.find((c) => c.name.toLowerCase() === 'devcore') ??
    companies.find((c) => c.name.toLowerCase().includes('devcore'))
  )?.id

  useEffect(() => {
    if (!showIntro || !devcoreId) return
    if (projectCache[devcoreId]) return
    loadProjects(devcoreId)
      .then((list) => setProjectCache((pc) => ({ ...pc, [devcoreId]: list })))
      .catch(() => {})
  }, [showIntro, devcoreId, projectCache])

  useEffect(() => {
    if (!showIntro) return
    // Any client / project works — not restricted to DevCore / Utbildning —
    // so the tour continues for tenants without those exact names.
    if (introStep === 1 && tab === 'timer') setIntroStep(2)
    if (introStep === 2 && tRun) setIntroStep(3)
    if (introStep === 3 && tCo) setIntroStep(4)
    if (introStep === 4 && tPr) setIntroStep(5)
    if (introStep === 6 && tab === 'today') setIntroStep(7)
    if (introStep === 9 && tab === 'history') setIntroStep(10)
    if (introStep === 11 && tab === 'xp') setIntroStep(12)
  }, [showIntro, introStep, tab, tCo, tPr, tRun])

  const introCanAdvance = introStep === 5 ? tD.trim().length > 0 : true

  useEffect(() => {
    window.electronAPI.setBlurCollapseDisabled(showIntro || !authed)
  }, [showIntro, authed])

  useEffect(() => {
    if (authed === false && size !== 'full') {
      setWindowSize('full')
      window.electronAPI.setSize('full')
    }
  }, [authed, size])

  useEffect(() => {
    if (!currentUser) return
    const first = currentUser.username.trim().split(/\s+/)[0] || 'friend'
    setGreetingMsg(pickGreeting(first, lang))
    const id = window.setInterval(() => setGreetingMsg(pickGreeting(first, lang)), 30 * 60 * 1000)
    return () => clearInterval(id)
  }, [currentUser, lang])

  const emptyMsg = useMemo(() => emptyTodayMessage(lang), [nowTick, lang])

  useEffect(() => {
    if (!currentUser) return
    const first = currentUser.username.trim().split(/\s+/)[0] || ''
    const compute = () => setTimerInsight(getTimerInsight({
      tRun, tSec, tCo, tPr, tD,
      todayH, goal: GOAL,
      entriesToday: entries.length,
      streak,
      firstName: first,
      lang,
    }))
    compute()
    const id = window.setInterval(compute, 2 * 60 * 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tRun, tCo, tPr, tD, entries.length, currentUser, lang])

  useEffect(() => { if (authed) window.electronAPI.storeSet('xp', xp) }, [xp, authed])
  useEffect(() => { if (authed) window.electronAPI.storeSet('unlocked', unlocked) }, [unlocked, authed])
  useEffect(() => { if (authed) window.electronAPI.storeSet('streak', streak) }, [streak, authed])
  useEffect(() => { if (authed && achStatsLoaded) window.electronAPI.storeSet('achStats', achStats) }, [achStats, authed, achStatsLoaded])

  // Dequeue: when no toast is showing and the queue has items, pop the next
  // one into `ach`. The dismiss timer is a separate effect (below) so the
  // cleanup here doesn't kill it on the first re-render.
  useEffect(() => {
    if (ach || pendingAchs.length === 0) return
    const [next, ...rest] = pendingAchs
    setAch(next)
    setPendingAchs(rest)
  }, [ach, pendingAchs])

  // Auto-dismiss the currently-shown toast after 3.2s. Runs whenever `ach`
  // becomes truthy; cleanup runs when `ach` flips back to null (via this
  // timeout) or when a new toast replaces it.
  useEffect(() => {
    if (!ach) return
    const id = window.setTimeout(() => setAch(null), 3200)
    return () => clearTimeout(id)
  }, [ach])

  // Persist timer on control/field changes (NOT on tSec tick — startedAt covers elapsed).
  useEffect(() => {
    if (!authed || !timerLoaded) return
    window.electronAPI.storeSet('timer', {
      tCo, tPr, tD, tNote, tInv,
      tSec: tRun ? 0 : tSec,
      running: tRun,
      startedAt: tRun ? Date.now() - tSec * 1000 : null,
      draftId,
    })
  }, [authed, timerLoaded, tCo, tPr, tD, tNote, tInv, tRun, draftId])

  // Persist Log form fields too so manual-log inputs survive app restarts.
  useEffect(() => {
    if (!authed) return
    ;(async () => {
      const f = await window.electronAPI.storeGet('logForm')
      if (f && typeof f === 'object') {
        setFCo(f.fCo || '')
        setFPr(f.fPr || '')
        setFH(typeof f.fH === 'number' ? f.fH : 1)
        setFD(f.fD || '')
        setFNote(f.fNote || '')
        setFInv(typeof f.fInv === 'boolean' ? f.fInv : true)
        if (f.fCo) loadProjects(f.fCo).then((list) => setProjectCache((c) => ({ ...c, [f.fCo]: list }))).catch(() => {})
      }
      setLogFormLoaded(true)
    })()
  }, [authed])

  useEffect(() => {
    if (!authed || !logFormLoaded) return
    window.electronAPI.storeSet('logForm', { fCo, fPr, fH, fD, fNote, fInv })
  }, [authed, logFormLoaded, fCo, fPr, fH, fD, fNote, fInv])

  // ─── Load companies once authed ────────────────────────────────────────
  useEffect(() => {
    if (!authed) return
    loadCompanies().then(setCompanies).catch(() => {})
  }, [authed])

  // ─── Resolve current user (prefer cache; else infer from entries + user.load) ─
  useEffect(() => {
    if (!authed) return
    ;(async () => {
      const cached = await window.electronAPI.storeGet('currentUser')
      if (cached && cached._user_id && cached.username) { setCurrentUser(cached); return }
      // Need a recent entry to discover _user_id (entries are scoped to me).
      try {
        const today = await loadTimeEntries(new Date())
        let uid = today[0]?._user_id
        if (!uid) {
          // try last 14 days until we find one
          for (let i = 1; i <= 14 && !uid; i++) {
            const d = new Date(); d.setDate(d.getDate() - i)
            const rows = await loadTimeEntries(d)
            uid = rows[0]?._user_id
          }
        }
        // We can't run the app without knowing who the user is. If anything
        // along the resolution path fails, sign out and let them re-auth
        // rather than guessing or showing data under a wrong identity.
        if (!uid) { window.electronAPI.signOut(); return }
        const users = await loadUsers()
        const me = users.find((u) => u.id === uid)
        if (!me) { window.electronAPI.signOut(); return }
        const resolved = { _user_id: me.id, username: me.name || me.username }
        setCurrentUser(resolved)
        await window.electronAPI.storeSet('currentUser', resolved)
      } catch { window.electronAPI.signOut() }
    })()
  }, [authed])

  // ─── Load entries for today ────────────────────────────────────────────
  // Today view is always today; History view loads its own entries per week/month.
  // `nowTick` re-runs this at local-midnight so the day rolls over cleanly.
  useEffect(() => {
    if (!authed) return
    let cancelled = false
    setEntriesLoading(true)
    loadTimeEntries(new Date())
      .then((list) => { if (!cancelled) { setEntries(list); setEntriesLoading(false) } })
      .catch((err) => {
        if (cancelled) return
        setEntriesLoading(false)
        if (err.message === 'NOT_AUTHENTICATED') setAuthed(false)
      })
    return () => { cancelled = true }
  }, [authed, nowTick])

  // ─── Load entries for a viewed past day (Today tab, when viewDate set) ─
  useEffect(() => {
    if (!authed || !viewDate) return
    let cancelled = false
    setViewDateLoading(true)
    loadTimeEntries(viewDate)
      .then((list) => { if (!cancelled) { setViewDateEntries(list); setViewDateLoading(false) } })
      .catch(() => { if (!cancelled) setViewDateLoading(false) })
    return () => { cancelled = true }
  }, [authed, viewDate, entries])

  // ─── Load week hours (Mon–Fri containing selectedDate) ─────────────────
  useEffect(() => {
    if (!authed) return
    // Always show the current week — independent of selectedDate
    const mon = mondayOf(new Date())
    const days = [0, 1, 2, 3, 4].map((i) => {
      const d = new Date(mon)
      d.setDate(d.getDate() + i)
      return d
    })
    Promise.all(days.map((d) => loadTimeEntries(d).catch((): TimeEntry[] => [])))
      .then((all) =>
        setWeekH(all.map((rows) => rows.reduce((s, e) => s + parseFloat(e.hour || '0'), 0))),
      )
  }, [authed, entries])

  // ─── Timer tick ────────────────────────────────────────────────────────
  useEffect(() => {
    if (tRun) tick.current = window.setInterval(() => setTSec((s) => s + 1), 1000)
    else if (tick.current) { clearInterval(tick.current); tick.current = null }
    return () => { if (tick.current) clearInterval(tick.current) }
  }, [tRun])

  // ─── Auto-save draft every 5 min while running ─────────────────────────
  // Only depend on tRun — we read the latest fields through a ref so typing
  // into the description doesn't restart the 5-minute clock.
  const autoSaveRef = useRef<() => Promise<void>>(() => Promise.resolve())
  useEffect(() => {
    if (!tRun) return
    const h = window.setInterval(() => { void autoSaveRef.current() }, 5 * 60 * 1000)
    return () => clearInterval(h)
  }, [tRun])

  // ─── Derived ───────────────────────────────────────────────────────────
  const todayI = useMemo(() => {
    const now = new Date()
    const mon = mondayOf(now)
    return Math.max(0, Math.min(4, Math.floor((+now - +mon) / 86400000)))
  }, [nowTick])
  const todayH = useMemo(
    () => entries.reduce((s, e) => s + parseFloat(e.hour || '0'), 0),
    [entries],
  )
  const weekTotal = useMemo(() => weekH.reduce((s, h) => s + h, 0), [weekH])
  const done = todayH >= GOAL
  const gpct = Math.min((todayH / GOAL) * 100, 100)

  // Lazy load projects for a company
  const ensureProjects = async (cid: string) => {
    if (projectCache[cid]) return projectCache[cid]
    const list = await loadProjects(cid)
    setProjectCache((c) => ({ ...c, [cid]: list }))
    return list
  }

  const addFloat = (txt: string, col: string) => {
    const id = ++fid.current
    setFloats((f) => [...f, { id, txt, col }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1500)
  }

  const saveNewEntry = async (
    cid: string, prid: string, hours: number, desc: string, inv: boolean, internalNote = '',
    entryDate: Date = selectedDate, existingId: string | null = null,
  ) => {
    if (!currentUser) return
    const co = companies.find((c) => c.id === cid)
    const pr = (projectCache[cid] || []).find((p) => p.id === prid)
    if (!co || !pr) return

    const payload = buildSavePayload({
      company: co, project: pr, hours,
      description: desc, internalNote,
      invoice: inv, user: currentUser,
      entryDate, existingId,
    })
    let saved: { success: boolean; id?: string } | undefined
    try {
      saved = await saveTimeEntry(payload)
    } catch (err: any) {
      if (err.message === 'NOT_AUTHENTICATED') { setAuthed(false); return }
      addFloat(t('form.saveFailed', { err: err.message || 'unknown' }), '#ef4444')
      return
    }

    // Refresh today's entries if the save landed on today.
    // History view refetches its own weeks/months on navigation.
    const savedDateISO = fmtDateISO(entryDate)
    const todayISOStr = fmtDateISO(new Date())
    if (savedDateISO === todayISOStr) {
      const fresh = await loadTimeEntries(new Date())
      setEntries(fresh)
    }
    // Only bump weekH for today's entries (weekH is current week Mon–Fri)
    setWeekH((w) => {
      if (savedDateISO !== todayISOStr) return w
      const n = [...w]
      n[todayI] = +(n[todayI] + hours).toFixed(2)
      return n
    })

    // Streak: bump if this is the first log of today.
    // "Previous" means the most recent working day before today
    // (so weekends and Swedish holidays don't break the streak).
    const nowDate = new Date()
    const todayISO = fmtDateISO(nowDate)
    const lastLogged = await window.electronAPI.storeGet('lastLoggedDate')
    let effectiveStreak = streak
    if (lastLogged !== todayISO) {
      const hols = getHolidays(nowDate.getFullYear())
      const prev = new Date(nowDate)
      do { prev.setDate(prev.getDate() - 1) } while (!isWorkingDay(prev, hols))
      const prevWDISO = fmtDateISO(prev)
      effectiveStreak = lastLogged === prevWDISO ? streak + 1 : 1
      setStreak(effectiveStreak)
      await window.electronAPI.storeSet('lastLoggedDate', todayISO)
    }

    const earned = Math.round(10 + hours * 8)
    setXp((x) => x + earned)
    addFloat(`${saveCheer(lang)} +${fmtHours(hours)}  +${earned} XP`, M.ac)

    // Skip achievement evaluation on edits — only fresh entries advance stats.
    if (existingId) return saved?.id || existingId || null

    // Build post-save stats snapshot and the evaluation context.
    const savedIsToday = savedDateISO === todayISOStr
    const savedDay = entryDate.getDay()
    const savedIsWeekend = savedDay === 0 || savedDay === 6
    const weekKey = isoWeekKey(nowDate)
    const nextStats: AchStats = {
      entriesCount: achStats.entriesCount + 1,
      totalH: +(achStats.totalH + hours).toFixed(2),
      totalBillableH: +(achStats.totalBillableH + (inv ? hours : 0)).toFixed(2),
      clientIds: achStats.clientIds.includes(cid) ? achStats.clientIds : [...achStats.clientIds, cid],
      projectIds: achStats.projectIds.includes(prid) ? achStats.projectIds : [...achStats.projectIds, prid],
      currentWeekKey: weekKey,
      currentWeekBillableH: +((achStats.currentWeekKey === weekKey ? achStats.currentWeekBillableH : 0) + (inv ? hours : 0)).toFixed(2),
    }
    setAchStats(nextStats)

    const todaysEntries = entries.filter((e) => fmtDateISO(new Date(e.task_date)) === todayISOStr)
    const clientsToday = new Set([...todaysEntries.map((e) => e._company_id), ...(savedIsToday ? [cid] : [])]).size
    const projectsToday = new Set([...todaysEntries.map((e) => e._project_id), ...(savedIsToday ? [prid] : [])]).size
    const postWeekH = savedIsToday ? (() => { const n = [...weekH]; n[todayI] = +(n[todayI] + hours).toFixed(2); return n })() : weekH
    const weekDaysAtGoal = postWeekH.filter((h) => h >= GOAL).length
    const daysSinceLastLog = lastLogged ? Math.max(0, Math.floor((+nowDate - +new Date(lastLogged)) / 86400000)) : 0

    const ctx: AchCtx = {
      stats: nextStats,
      streak: effectiveStreak,
      todayH: savedIsToday ? todayH + hours : todayH,
      clientsToday,
      projectsToday,
      hourOfDay: nowDate.getHours(),
      daysSinceLastLog,
      savedIsWeekend,
      savedIsToday,
      entryIsBillable: inv,
      entryHours: hours,
      weekDaysAtGoal,
    }

    // Fire any newly-passed predicates. Queue toasts so stacked unlocks don't
    // clobber each other.
    const newly: Ach[] = []
    for (const a of ACHS) {
      if (unlocked.includes(a.id)) continue
      const fn = CHECKS[a.id]
      if (fn && fn(ctx)) newly.push(a)
    }
    if (newly.length > 0) {
      setUnlocked((u) => [...u, ...newly.map((a) => a.id)])
      setXp((x) => x + newly.reduce((s, a) => s + a.xp, 0))
      setPendingAchs((q) => [...q, ...newly])
    }

    return saved?.id || existingId || null
  }

  // Silent background save for crash-safety. Upserts the current timer into a server
  // draft entry; later saves update the same id so we don't spawn duplicates.
  const draftIdRef = useRef<string | null>(null)
  useEffect(() => { draftIdRef.current = draftId }, [draftId])
  const autoSaveDraft = async () => {
    if (!currentUser) return
    if (!tCo || !tPr || !tD.trim()) return
    const co = companies.find((c) => c.id === tCo)
    const pr = (projectCache[tCo] || []).find((p) => p.id === tPr)
    if (!co || !pr) return
    const hours = Math.max(1, Math.ceil(tSec / 60)) / 60
    const payload = buildSavePayload({
      company: co, project: pr, hours,
      description: tD.trim(), internalNote: tNote.trim(),
      invoice: tInv, user: currentUser,
      entryDate: new Date(), existingId: draftIdRef.current,
    })
    try {
      const r = await saveTimeEntry(payload)
      if (!draftIdRef.current && r?.id) { draftIdRef.current = r.id; setDraftId(r.id) }
    } catch { /* silent: local state is still persisted */ }
  }
  useEffect(() => { autoSaveRef.current = autoSaveDraft })

  const delEntry = async (id: string) => {
    try {
      await deleteTimeEntry(id)
      setEntries((es) => es.filter((e) => e.id !== id))
    } catch (err: any) {
      addFloat(t('form.deleteFailed', { err: err.message || 'unknown' }), '#ef4444')
    }
  }

  // Group entries by company for Today view
  const groups = useMemo(() => {
    const g: Record<string, { cid: string; h: number; entries: TimeEntry[] }> = {}
    entries.forEach((e) => {
      const key = e.company
      if (!g[key]) g[key] = { cid: e._company_id, h: 0, entries: [] }
      g[key].h = +(g[key].h + parseFloat(e.hour || '0')).toFixed(2)
      g[key].entries.push(e)
    })
    return g
  }, [entries])

  // Vanilla-extract theme class — applied to every top-level return so CSS
  // custom properties resolve correctly in both early-return branches and the
  // main app render.
  const themeClass = mode === 'dark' ? darkTheme : lightTheme

  const spinner = (
    <div className={themeClass} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: 24, background: M.bg, minHeight: '100vh',
    }}>
      <div className="spinner" style={{ width: 28, height: 28, border: `3px solid ${M.b1}`, borderTopColor: M.ac, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <div style={{ color: M.tf, fontSize: 12, letterSpacing: 0.3 }}>{t('form.loadingProjects')}</div>
    </div>
  )
  if (authed === null) return spinner
  if (!authed) return <div className={themeClass}><LoginScreen onLogin={() => window.electronAPI.openAuth()} /></div>
  if (!currentUser) return spinner

  // ─── Shared UI helpers ────────────────────────────────────────────────
  const locale = lang === 'sv' ? 'sv-SE' : 'en-GB'
  // Live clock: weekday · day · month · hh:mm. Re-renders once per minute via
  // the nowTick state (which uses `nowTick` as a dep to force revaluation).
  void nowTick
  const now = new Date()
  const clockDate = now.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const clockTime = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

  // ─── Header ────────────────────────────────────────────────────────────
  const hdr = (
    <div style={{ padding: '12px 14px 0', background: M.bg, borderBottom: `1px solid ${M.b1}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: M.lo, letterSpacing: -0.4, whiteSpace: 'nowrap', flexShrink: 0 }}>DevCore Time</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 11, color: M.t3, height: 22 }}>
            <span style={{ whiteSpace: 'nowrap', color: M.t3 }}>{clockDate}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: M.t1, fontSize: 12 }}>{clockTime}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: done ? M.gn : todayH > 0 ? M.t1 : M.tf, fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', height: 22, lineHeight: 1 }}>{fmtHours(todayH)}</span>
          <button
            type="button"
            onClick={() => setTab('timer')}
            title={tRun ? t('status.timerRunning') : tSec > 0 ? t('status.timerPaused') : t('status.noTimer')}
            aria-label={tRun ? t('status.timerRunning') : tSec > 0 ? t('status.timerPaused') : t('status.noTimer')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
              background: tRun ? `${M.pk}1f` : 'transparent',
              border: `1px solid ${tRun ? `${M.pk}55` : M.b1}`,
              borderRadius: 100, padding: '0 7px', height: 22,
              font: 'inherit', color: 'inherit',
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: tRun ? M.pk : tSec > 0 ? '#f59e0b' : '#ef4444',
              boxShadow: tRun ? `0 0 6px ${M.pk}` : 'none',
              animation: tRun ? 'pulse 1.2s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: tRun ? M.pk : M.t3, fontFamily: 'monospace', letterSpacing: 0.3 }}>
              {tRun ? fmtClock(tSec) : tSec > 0 ? t('status.paused') : t('status.idle')}
            </span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: M.pb, border: `1px solid ${M.pp}`, borderRadius: 100, padding: '0 7px', height: 22 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: M.pv }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: M.pk, fontFamily: 'monospace' }}>{streak}d</span>
          </div>
          <button
            onClick={() => goSize('top')}
            title={t('header.minimizeTopBar')}
            aria-label={t('header.minimizeTopBar')}
            style={{ width: 24, height: 24, borderRadius: 7, background: M.s2, border: `1px solid ${M.b1}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, color: M.t3, fontWeight: 700 }}
          >▼</button>
        </div>
      </div>
      <div role="tablist" style={{ display: 'flex' }}>
        {([['today', t('tab.today')], ['timer', t('tab.timer')], ['history', t('tab.history')], ['xp', t('tab.xp')]] as const).map(([v, l]) => (
          <button
            key={v}
            data-tour={`tab-${v}`}
            role="tab"
            aria-selected={tab === v}
            onClick={() => setTab(v)}
            style={{ flex: 1, padding: '9px 0', border: 'none', borderBottom: `2px solid ${tab === v ? M.ac : 'transparent'}`, background: 'transparent', color: tab === v ? M.t1 : M.t3, fontSize: 12, fontWeight: tab === v ? 700 : 500, cursor: 'pointer', marginBottom: -1 }}
          >{l}</button>
        ))}
      </div>
    </div>
  )

  // Progress bar is about today — nothing in the header navigates anymore.
  const pbarDate = new Date()
  const pbarHolidays = getHolidays(pbarDate.getFullYear())
  const pbarDayOff = !isWorkingDay(pbarDate, pbarHolidays)
  const pbarHolidayName = pbarHolidays.get(
    `${pbarDate.getFullYear()}-${String(pbarDate.getMonth() + 1).padStart(2, '0')}-${String(pbarDate.getDate()).padStart(2, '0')}`,
  )

  const pbar = pbarDayOff ? (
    <div style={{ padding: '10px 14px 10px', borderBottom: `1px solid ${M.s2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: M.t3 }}>{t('today.hoursLogged', { hours: fmtHours(todayH) })}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: M.t3 }}>
        {pbarHolidayName ? `🎉 ${pbarHolidayName}` : `🌴 ${lang === 'sv' ? 'Ledig dag' : 'Day off'}`}
      </span>
    </div>
  ) : (
    <div style={{ padding: '10px 14px 10px', borderBottom: `1px solid ${M.s2}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: M.t3 }}>{t('today.hoursLogged', { hours: fmtHours(todayH) })}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: done ? M.gn : M.t2 }}>
          {done ? t('today.goalReached') : t('today.toGo', { hours: fmtHours(GOAL - todayH) })}
        </span>
      </div>
      <div style={{ height: 5, background: M.s2, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${gpct}%`, background: done ? M.gn : M.ac, borderRadius: 3, transition: 'width .5s' }} />
      </div>
    </div>
  )

  // ─── Today view ────────────────────────────────────────────────────────
  const todayView = (() => {
    const firstName = currentUser.username.trim().split(/\s+/)[0]
    const hr = new Date().getHours()
    const greeting =
      hr >= 5 && hr < 12 ? t('greet.morning') :
      hr >= 12 && hr < 17 ? t('greet.afternoon') :
      hr >= 17 && hr < 22 ? t('greet.evening') :
      t('greet.latenight')
    const todayDate = new Date()
    const holidayMap = getHolidays(todayDate.getFullYear())
    const holidayKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`
    const holidayName = holidayMap.get(holidayKey)
    const isDayOff = !isWorkingDay(todayDate, holidayMap)
    const isSat = todayDate.getDay() === 6
    const emoji = isDayOff ? (holidayName ? '🎉' : isSat ? '🌴' : '🌴')
      : hr >= 5 && hr < 12 ? '☀️'
        : hr >= 12 && hr < 17 ? '🌤️'
          : hr >= 17 && hr < 22 ? '🌆'
            : '🌙'
    const subtitle = isDayOff
      ? (holidayName ? t('today.dayOffHoliday', { holiday: holidayName }) : t('today.dayOff'))
      : (done ? t('today.goalReachedLine') : t('today.leftToHit', { hours: fmtHours(GOAL - todayH), goal: GOAL }))

    // Past-day inspection: when viewDate is set we show that day's entries
    // (loaded into viewDateEntries), skipping today-only widgets.
    const isPastDay = viewDate !== null
    const dispEntries = isPastDay ? viewDateEntries : entries
    const dispH = isPastDay ? dispEntries.reduce((s, e) => s + parseFloat(e.hour || '0'), 0) : todayH
    const dispLoading = isPastDay ? viewDateLoading : entriesLoading
    const dispGroups: Record<string, { cid: string; h: number; entries: TimeEntry[] }> = isPastDay
      ? (() => {
          const g: Record<string, { cid: string; h: number; entries: TimeEntry[] }> = {}
          dispEntries.forEach((e) => {
            const key = e.company
            if (!g[key]) g[key] = { cid: e._company_id, h: 0, entries: [] }
            g[key].h = +(g[key].h + parseFloat(e.hour || '0')).toFixed(2)
            g[key].entries.push(e)
          })
          return g
        })()
      : groups
    const dispDone = isPastDay ? dispH >= GOAL : done
    const viewLabel = viewDate ? viewDate.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }) : ''

    return (
      <div style={{ paddingBottom: 24 }}>
        {isPastDay ? (
          <div style={{ padding: '12px 14px 4px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: M.t3, letterSpacing: 1, textTransform: 'uppercase' }}>{t('today.viewing')}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: M.t1, letterSpacing: -0.3, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewLabel}</div>
              </div>
            </div>
            <button
              onClick={() => setViewDate(null)}
              style={{ background: M.s2, border: `1px solid ${M.b1}`, color: M.t2, borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >{t('today.backToToday')}</button>
          </div>
        ) : (
          firstName && (
            <div style={{ padding: '12px 14px 4px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 18, lineHeight: 1.1 }}>{emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: M.t1, letterSpacing: -0.3, lineHeight: 1.1 }}>{greeting}, {firstName}</div>
                <div style={{ fontSize: 11, color: M.t3, marginTop: 2 }}>{subtitle}</div>
                {greetingMsg && (
                  <div style={{ fontSize: 11, color: M.ac, marginTop: 4, fontStyle: 'italic', opacity: 0.85 }}>
                    {greetingMsg}
                  </div>
                )}
              </div>
            </div>
          )
        )}
        {!isPastDay && pbar}
        <div style={{ padding: '12px 14px 0', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {!isPastDay && (
            <div data-tour="today-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr 1fr', gap: 6 }}>
              <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 11, padding: '11px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: M.ac }}>{fmtHours(todayH)}</div>
                <div style={{ fontSize: 9, color: M.t3, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{t('today.stat.today')}</div>
              </div>
              <div style={{ background: M.pb, border: `2px solid ${M.pp}`, borderRadius: 11, padding: '10px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: M.pk, letterSpacing: -1, lineHeight: 1 }}>{streak}d</div>
                  <div style={{ fontSize: 9, color: M.pk, marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, opacity: .7 }}>{t('today.stat.streak')}</div>
                </div>
                <div style={{ fontSize: 20, lineHeight: 1, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>🔥</div>
              </div>
              <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 11, padding: '11px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: M.t3 }}>
                  {fmtHours(weekTotal)}
                </div>
                <div style={{ fontSize: 9, color: M.t3, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{t('today.stat.week')}</div>
              </div>
            </div>
          )}

          {!isPastDay && (
            <MeetingsWidget
              M={M}
              onStartForMeeting={(title) => {
                setTD(title)
                setTab('timer')
              }}
            />
          )}

          <div style={{ height: 1, background: M.s2 }} />

          <div data-tour="today-entries" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {(Object.entries(dispGroups) as [string, { cid: string; h: number; entries: TimeEntry[] }][]).map(([co, g], gi) => (
            <div key={co} style={{ paddingLeft: 11, borderLeft: `3px solid ${M.co[gi % M.co.length]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: M.co[gi % M.co.length] }}>{co}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: M.t3, fontFamily: 'monospace' }}>{fmtHours(g.h)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {g.entries.map((e) => {
                  const isPending = pendingDeleteId === e.id
                  return (
                    <div key={e.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        onDoubleClick={() => editEntry(e)}
                        title={t('entry.doubleClickEdit')}
                        style={{ background: M.s1, border: `1px solid ${isPending ? '#ef4444' : M.b1}`, borderRadius: 11, padding: '9px 11px', borderBottomLeftRadius: isPending ? 0 : 11, borderBottomRightRadius: isPending ? 0 : 11, borderBottom: isPending ? 'none' : `1px solid ${M.b1}`, transition: 'border-color .15s', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: M.t3, marginBottom: 2 }}>{e.project}</div>
                            <div style={{ fontSize: 12, color: M.t1, lineHeight: 1.4, wordBreak: 'break-word' }}>{e.description}</div>
                            {e.internal_description && (
                              <div style={{ fontSize: 11, color: M.t3, marginTop: 4, fontStyle: 'italic' }}>{e.internal_description}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 1 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: M.ac }}>
                              {fmtHours(parseFloat(e.hour))}
                            </span>
                            <span
                              title={e.invoice === '1' ? 'Billable — shows up on invoice' : 'Internal — not billed'}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                height: 16, padding: '0 6px', borderRadius: 4,
                                fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
                                background: e.invoice === '1' ? `${M.ac}26` : 'transparent',
                                color: e.invoice === '1' ? M.ac : M.tf,
                                border: `1px solid ${e.invoice === '1' ? `${M.ac}55` : M.b1}`,
                              }}
                            >{e.invoice === '1' ? 'Billable' : 'Internal'}</span>
                            {(() => {
                              const isActive = tRun && draftId === e.id
                              return (
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    if (isActive) { setTRun(false); return }
                                    if (draftId === e.id && tCo === e._company_id && tPr === e._project_id) {
                                      setTRun(true); setTab('timer'); return
                                    }
                                    switchTaskGuarded(e._company_id, e._project_id, e.description, {
                                      entryId: e.id,
                                      hours: parseFloat(e.hour) || 0,
                                      note: e.internal_description || '',
                                      invoice: e.invoice === '1',
                                    })
                                  }}
                                  title={isActive ? 'Pause the running timer' : 'Continue this task — timer resumes from logged hours'}
                                  style={{ width: 22, height: 22, borderRadius: '50%', background: isActive ? M.pk : M.btn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                                >
                                  {isActive ? (
                                    <svg width="8" height="10" viewBox="0 0 12 14" fill="none"><rect x="1" y="1" width="3" height="12" rx="1" fill="white" /><rect x="8" y="1" width="3" height="12" rx="1" fill="white" /></svg>
                                  ) : (
                                    <svg width="8" height="10" viewBox="0 0 13 15" fill="none" style={{ marginLeft: 1 }}><path d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z" fill="white" stroke="white" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                                  )}
                                </button>
                              )
                            })()}
                            <button
                              onClick={() => setPendingDeleteId(isPending ? null : e.id)}
                              style={{ background: 'none', border: 'none', color: isPending ? '#ef4444' : M.t3, fontSize: 12, cursor: 'pointer', padding: '2px 4px', fontWeight: isPending ? 700 : 400 }}
                            >✕</button>
                          </div>
                        </div>
                      </div>
                      <div style={{ maxHeight: isPending ? 44 : 0, overflow: 'hidden', transition: 'max-height .22s ease' }}>
                        <div style={{ display: 'flex', borderRadius: '0 0 11px 11px', overflow: 'hidden', border: `1px solid #ef4444`, borderTop: 'none' }}>
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            style={{ flex: 1, padding: '10px 0', background: M.s2, border: 'none', color: M.t2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >{t('entry.cancel')}</button>
                          <button
                            onClick={async () => { setPendingDeleteId(null); await delEntry(e.id) }}
                            style={{ flex: 1, padding: '10px 0', background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >{t('entry.delete')}</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {dispEntries.length === 0 && dispLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
              <div className="skeleton" style={{ height: 18, width: '40%', borderRadius: 6 }} />
              <div className="skeleton" style={{ height: 52, borderRadius: 11 }} />
              <div className="skeleton" style={{ height: 52, borderRadius: 11 }} />
            </div>
          )}
          {dispEntries.length === 0 && !dispLoading && (
            <div style={{ textAlign: 'center', padding: '28px 12px', fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ color: M.t2, fontWeight: 600, marginBottom: 4 }}>{isPastDay ? t('today.noEntriesForDay') : emptyMsg}</div>
              <div style={{ color: M.tf, fontSize: 11 }}>{t('today.noEntriesHeader', { date: (viewDate ?? new Date()).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }) })}</div>
            </div>
          )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: `1px solid ${M.s2}` }}>
            <span style={{ fontSize: 12, color: M.t3 }}>{t('today.totalLabel')}</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: dispDone ? M.gn : M.ac, fontFamily: 'monospace' }}>{fmtHours(dispH)}</span>
          </div>
        </div>
      </div>
    )
  })()

  // ─── Timer view ────────────────────────────────────────────────────────
  const timerView = (() => {
    const coObj = companies.find((c) => c.id === tCo)
    const prList = projectCache[tCo] || []
    const prObj = prList.find((p) => p.id === tPr)
    const hasCtx = !!(tCo && tPr)
    const sessXP = Math.round((tSec / 3600) * 8 + 2)

    const canStart = !!(tCo && tPr && tD.trim())
    const stop = async () => {
      if (!canStart) {
        addFloat(t('form.fillFirst'), '#ef4444')
        return
      }
      const h = Math.max(1, Math.ceil(tSec / 60)) / 60
      await saveNewEntry(tCo, tPr, h, tD.trim(), tInv, tNote.trim(), new Date(), draftId)
      resetTimer()
      setTab('today')
    }

    return (
      <div style={{ padding: '16px 14px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tRun && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: M.pk, animation: 'pulse 1.2s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: M.pk, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t('timer.recording')}</span>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: tRun ? '4px 0' : '8px 0 6px' }}>
          <div style={{ fontFamily: "'SF Mono','Cascadia Code',monospace", fontSize: tRun ? 50 : 44, fontWeight: 300, color: tRun ? M.ac : (M.id === 'dark' ? '#2e2e2e' : '#d4c8f5'), letterSpacing: 3, lineHeight: 1, marginBottom: 6 }}>
            {fmtClock(tSec)}
          </div>
          {(() => {
            const v = vibe(tSec, tRun, lang)
            return (
              <div style={{ position: 'relative', textAlign: 'center', fontSize: 12, color: tRun ? M.ac : M.tf, fontWeight: tRun ? 600 : 400, letterSpacing: 0.2 }}>
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  {v.text}
                  {v.icon && (
                    <span style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 }}>{v.icon}</span>
                  )}
                </span>
              </div>
            )
          })()}
          {timerInsight && (
            <div style={{ textAlign: 'center', fontSize: 11, color: M.t3, fontStyle: 'italic', marginTop: 4, padding: '0 14px', lineHeight: 1.3 }}>
              {timerInsight}
            </div>
          )}
        </div>

        {tRun && (
          <div style={{ background: M.ad, border: `1px solid ${M.am}`, borderRadius: 10, padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: M.t2 }}>{t('timer.xpSession')}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: M.ac, fontFamily: 'monospace' }}>+{sessXP} XP</span>
          </div>
        )}

        <div style={{ background: M.s2, border: `1px solid ${M.b1}`, borderRadius: 14, padding: '13px 13px 11px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {!tRun && (
              tSec > 0 && canStart ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => setTRun(true)}
                    style={{ padding: 13, background: M.btn, border: '1px solid transparent', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: M.bsh }}
                  >{t('timer.resume')}</button>
                  <button
                    onClick={() => void stopAndLogCurrent()}
                    style={{ padding: 13, background: M.gn, border: 'none', borderRadius: 11, color: M.id === 'dark' ? '#022c22' : '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${M.gn}55` }}
                  >{t('timer.stopLog')}</button>
                </div>
              ) : (
                <button
                  data-tour="timer-start"
                  onClick={() => setTRun(true)}
                  style={{ width: '100%', padding: 13, background: M.btn, border: '1px solid transparent', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: M.bsh }}
                >{tSec > 0 ? t('timer.resume') : t('timer.start')}</button>
              )
            )}
            {tRun && !canStart && (
              <div style={{ fontSize: 11, color: M.pk, fontWeight: 600, textAlign: 'center', padding: '4px 0' }}>
                Timer is running — fill in fields below to be able to save
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: M.b1 }} />
              <span style={{ fontSize: 10, color: M.t2, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t('timer.whatWorking')}</span>
              <div style={{ flex: 1, height: 1, background: M.b1 }} />
            </div>

            <div data-tour="timer-company">
              <Combobox
                value={tCo}
                items={companies}
                placeholder={`${t('form.searchClient')} (${companies.length})`}
                theme={M}
                onChange={async (id) => { setTCo(id); setTPr(''); if (id) await ensureProjects(id) }}
              />
            </div>

            {tCo && (
              <div data-tour="timer-project">
                <Combobox
                  value={tPr}
                  items={prList}
                  placeholder={prList.length ? `${t('form.searchProject')} (${prList.length})` : t('form.loadingProjects')}
                  theme={M}
                  onChange={setTPr}
                />
              </div>
            )}

            {tCo && tPr && (
              <>
                <input
                  data-tour="timer-description"
                  value={tD}
                  onChange={(e) => setTD(e.target.value)}
                  placeholder={t('timer.taskDescription')}
                  style={{ padding: '11px 12px', background: M.s1, border: `1.5px solid ${tD.trim() ? M.ac : M.b2}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', width: '100%' }}
                />
                <textarea
                  value={tNote}
                  onChange={(e) => setTNote(e.target.value)}
                  placeholder={t('timer.internalNotes')}
                  rows={2}
                  style={{ padding: '11px 12px', background: M.s1, border: `1.5px solid ${M.b2}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', width: '100%', resize: 'none' }}
                />
                <button
                  type="button"
                  role="switch"
                  aria-checked={tInv}
                  aria-label={t('timer.invoiceable')}
                  onClick={() => setTInv((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: M.bg, border: `1px solid ${M.b1}`, borderRadius: 9, cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}
                >
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: tInv ? M.ac : M.b1, display: 'flex', alignItems: 'center', padding: 2, transition: 'background .2s' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', transform: `translateX(${tInv ? 16 : 0}px)`, transition: 'transform .2s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                  </div>
                  <span style={{ fontSize: 12, color: M.t1 }}>{t('timer.invoiceable')}</span>
                </button>
              </>
            )}
          </div>

        {tRun && hasCtx && (
          <div style={{ background: M.s1, border: `1.5px solid ${M.am}`, borderRadius: 13, padding: '11px 13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>{t('timer.nowTracking')}</span>
              <button onClick={() => setTRun(false)} style={{ fontSize: 11, color: M.ac, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{t('timer.change')}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: M.co[0], flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: M.t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{coObj?.name}</div>
                <div style={{ fontSize: 11, color: M.t3, marginTop: 2 }}>{prObj?.name}</div>
                {tD && <div style={{ fontSize: 11, color: M.t1, marginTop: 2 }}>{tD}</div>}
                {tNote && <div style={{ fontSize: 11, color: M.tf, marginTop: 2, fontStyle: 'italic' }}>{tNote}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: tInv ? M.gb : M.s2, border: `1px solid ${tInv ? M.gd : M.b1}`, borderRadius: 6, padding: '3px 7px', flexShrink: 0 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: tInv ? M.gn : M.tf }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: tInv ? M.gn : M.t3, letterSpacing: 0.5 }}>
                  {tInv ? t('entry.billShort') : t('entry.noBillShort')}
                </span>
              </div>
            </div>
            {prObj && parseFloat(prObj.hour_price) > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${M.b1}`, display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 11, color: M.t3, fontFamily: 'monospace' }}>
                  {parseFloat(prObj.hour_price)}kr/h · {((tSec / 3600) * parseFloat(prObj.hour_price)).toFixed(0)}kr
                </span>
              </div>
            )}
          </div>
        )}

        {tRun && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => setTRun(false)} style={{ height: 46, background: M.s2, border: `1px solid ${M.b1}`, borderRadius: 12, color: M.t2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⏸  {t('timer.pause')}</button>
            <button onClick={stop} style={{ height: 46, background: M.gn, border: 'none', borderRadius: 12, color: M.id === 'dark' ? '#022c22' : '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${M.gn}55` }}>{t('timer.stopLog')}</button>
          </div>
        )}

        {(tRun || tSec > 0) && (
          <div style={{ borderRadius: 11, overflow: 'hidden', border: pendingCancelTimer ? `1px solid #ef4444` : '1px solid transparent' }}>
            <button
              onClick={() => setPendingCancelTimer((v) => !v)}
              style={{
                width: '100%', padding: '9px 0',
                background: 'none', border: 'none',
                color: pendingCancelTimer ? '#ef4444' : M.tf,
                fontSize: 11, fontWeight: pendingCancelTimer ? 700 : 500,
                cursor: 'pointer', letterSpacing: 0.3,
              }}
            >
              {t('timer.cancel')}
            </button>
            <div style={{ maxHeight: pendingCancelTimer ? 44 : 0, overflow: 'hidden', transition: 'max-height .22s ease' }}>
              <div style={{ display: 'flex' }}>
                <button
                  onClick={() => setPendingCancelTimer(false)}
                  style={{ flex: 1, padding: '10px 0', background: M.s2, border: 'none', color: M.t2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >{t('entry.cancel')}</button>
                <button
                  onClick={() => void cancelTimer()}
                  style={{ flex: 1, padding: '10px 0', background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >{t('timer.cancelDiscard')}</button>
              </div>
            </div>
          </div>
        )}

        {!logOpen && (
          <button
            data-tour="log-pill"
            onClick={() => setLogOpen(true)}
            style={{
              alignSelf: 'center', marginTop: 8,
              padding: '8px 18px', borderRadius: 999,
              background: 'transparent', border: `1px solid ${M.b1}`,
              color: M.t2, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >{t('timer.logPastTime')}</button>
        )}
        {logOpen && (() => {
          const recent: TimeEntry[] = []
          const seen = new Set<string>()
          entries.forEach((e) => {
            const k = e._company_id + ':' + e._project_id
            if (!seen.has(k) && recent.length < 3) { seen.add(k); recent.push(e) }
          })
          const logPrList = projectCache[fCo] || []
          const logPrObj = logPrList.find((p) => p.id === fPr)
          const logCo = companies.find((c) => c.id === fCo)
          const pickedDate = editingDate ?? selectedDate
          const saveLog = async () => {
            if (!fCo || !fPr || !logCo || !logPrObj || !fD.trim()) return
            await saveNewEntry(fCo, fPr, fH, fD, fInv, fNote.trim(), pickedDate, editingId)
            resetLogForm()
            setLogOpen(false)
          }
          const canSave = !!(fCo && fPr && fD.trim())
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 6, paddingTop: 14, borderTop: `1px solid ${M.s2}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: editingId ? M.ad : M.s2, border: `1px solid ${editingId ? M.am : M.b1}`, borderRadius: 10, padding: '9px 12px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: editingId ? M.at : M.t2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {editingId
                    ? t('form.editingEntryOn', { date: pickedDate.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }) })
                    : t('timer.logPastTime')}
                </span>
                <button
                  onClick={() => { resetLogForm(); setLogOpen(false) }}
                  style={{ background: 'none', border: 'none', color: editingId ? M.ac : M.t3, fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '2px 4px' }}
                >{editingId ? t('entry.cancel') : t('timer.hideLogForm')}</button>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{t('timer.logFormDate')}</div>
                <input
                  type="date"
                  value={formatLocalDate(pickedDate)}
                  onChange={(e) => {
                    const [y, m, d] = e.target.value.split('-').map(Number)
                    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return
                    const next = new Date(y, m - 1, d)
                    if (editingId) setEditingDate(next); else setSelectedDate(next)
                  }}
                  style={{ width: '100%', padding: '11px 12px', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none' }}
                />
              </div>

              {recent.length > 0 && !editingId && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>{t('today.recent')}</div>
                  <div style={{ fontSize: 11, color: M.tf, marginBottom: 8 }}>{t('today.opensTimer')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {recent.map((r, i) => (
                      <div key={r.id} style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: M.co[i % M.co.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: M.t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.company}</div>
                          <div style={{ fontSize: 11, color: M.t3, marginTop: 2 }}>{r.project}</div>
                        </div>
                        <button
                          onClick={() => switchTaskGuarded(r._company_id, r._project_id, r.description)}
                          style={{ width: 34, height: 34, borderRadius: '50%', background: M.btn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: M.bsh }}
                        >
                          <svg width="11" height="13" viewBox="0 0 13 15" fill="none" style={{ marginLeft: 2 }}><path d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z" fill="white" stroke="white" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: M.b1 }} />
                <span style={{ fontSize: 10, color: M.t3, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 1 }}>{t('today.orLogManually')}</span>
                <div style={{ flex: 1, height: 1, background: M.b1 }} />
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{t('form.client')}</div>
                <Combobox
                  value={fCo}
                  items={companies}
                  placeholder={`${t('form.searchClient')} (${companies.length})`}
                  theme={M}
                  onChange={async (id) => { setFCo(id); setFPr(''); if (id) await ensureProjects(id) }}
                />
              </div>

              {fCo && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{t('form.project')}</div>
                  <Combobox
                    value={fPr}
                    items={logPrList}
                    placeholder={logPrList.length ? `${t('form.searchProject')} (${logPrList.length})` : t('form.loadingProjects')}
                    theme={M}
                    onChange={setFPr}
                  />
                </div>
              )}

              <div data-tour="log-hours">
                <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{t('form.hours')}</div>
                <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                  <button onClick={() => setFH((h) => Math.max(0.25, +(h - 0.25).toFixed(2)))} style={{ width: 46, height: 46, background: 'transparent', border: 'none', borderRight: `1px solid ${M.b1}`, color: M.t3, fontSize: 20, fontWeight: 200, cursor: 'pointer' }}>−</button>
                  <input
                    value={fHInput}
                    onChange={(e) => setFHInput(e.target.value)}
                    onBlur={() => {
                      const parsed = parseHoursInput(fHInput)
                      if (parsed == null) { setFHInput(fmtHours(fH)); return }
                      const clamped = Math.max(0, Math.min(24, parsed))
                      setFH(clamped)
                      setFHInput(fmtHours(clamped))
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur() }}
                    onFocus={(e) => e.currentTarget.select()}
                    style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: M.t1, letterSpacing: -1, background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: 0 }}
                  />
                  <button onClick={() => setFH((h) => Math.min(24, +(h + 0.25).toFixed(2)))} style={{ width: 46, height: 46, background: 'transparent', border: 'none', borderLeft: `1px solid ${M.b1}`, color: M.t3, fontSize: 20, fontWeight: 200, cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: M.t3 }}>
                  {t('form.typeHoursHint')}
                </div>
                {logPrObj && parseFloat(logPrObj.hour_price) > 0 && (
                  <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: M.t3, fontFamily: 'monospace' }}>
                    {(fH * parseFloat(logPrObj.hour_price)).toFixed(0)} kr total · {parseFloat(logPrObj.hour_price)}kr/h
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                  {t('form.description')} *
                </div>
                <textarea
                  value={fD}
                  onChange={(e) => setFD(e.target.value)}
                  placeholder={t('form.descPlaceholder')}
                  rows={2}
                  style={{ width: '100%', padding: '11px 12px', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', resize: 'none' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                  {lang === 'sv' ? 'Interna anteckningar' : 'Internal notes'} <span style={{ color: M.tf, fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 10 }}>{t('form.internalOptional')}</span>
                </div>
                <textarea
                  value={fNote}
                  onChange={(e) => setFNote(e.target.value)}
                  placeholder={t('form.internalPlaceholder')}
                  rows={2}
                  style={{ width: '100%', padding: '11px 12px', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10 }}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={fInv}
                  aria-label={t('timer.invoiceable')}
                  onClick={() => setFInv((v) => !v)}
                  style={{ width: 40, height: 22, borderRadius: 11, background: fInv ? M.ac : M.b1, display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer', transition: 'background .2s', border: 'none' }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff', transform: `translateX(${fInv ? 18 : 0}px)`, transition: 'transform .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                </button>
                <span style={{ fontSize: 13, color: M.t1 }}>{t('timer.invoiceable')}</span>
              </div>

              <button
                onClick={saveLog}
                disabled={!canSave}
                style={{ width: '100%', height: 46, background: canSave ? M.btn : M.s3, border: 'none', borderRadius: 12, color: canSave ? '#fff' : M.t3, fontSize: 14, fontWeight: 700, cursor: canSave ? 'pointer' : 'default', boxShadow: canSave ? M.bsh : 'none' }}
              >{editingId ? t('form.saveChanges') : t('form.saveEntry')}</button>
            </div>
          )
        })()}
      </div>
    )
  })()

  // ─── XP view ───────────────────────────────────────────────────────────
  const xpView = (() => {
    const level = Math.floor(xp / 1000) + 1
    const xpBase = (level - 1) * 1000
    const xpNext = level * 1000
    const pct = Math.min(((xp - xpBase) / (xpNext - xpBase)) * 100, 100)

    return (
      <div style={{ padding: '14px 14px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div data-tour="xp-level" style={{ background: M.id === 'dark' ? M.s1 : 'linear-gradient(135deg,#ede9fe,#ddd6fe)', border: `1px solid ${M.id === 'dark' ? M.b1 : M.am}`, borderRadius: 14, padding: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 13 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: M.ac, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 3 }}>Level {level}</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: M.t1, letterSpacing: -.8, lineHeight: 1 }}>
                {level >= 5 ? 'Principal Dev' : level >= 3 ? 'Senior Dev' : 'Dev'}
              </div>
              <div style={{ fontSize: 11, color: M.t2, marginTop: 3 }}>{xp} / {xpNext} XP</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: M.id === 'dark' ? '#262626' : '#fff', border: `2px solid ${M.id === 'dark' ? M.b2 : M.am}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={M.ac} /></svg>
            </div>
          </div>
          <div style={{ height: 9, background: M.id === 'dark' ? '#0e0e0e' : '#fff', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: M.ac, borderRadius: 5 }} />
          </div>
          <div style={{ fontSize: 11, color: M.t3, fontStyle: 'italic', marginTop: 10, lineHeight: 1.4 }}>
            {xpCoachNote({
              xp, xpIntoLevel: xp - xpBase, xpPerLevel: xpNext - xpBase,
              streak, weekTotal,
              firstName: currentUser.username.trim().split(/\s+/)[0],
              lang,
            })}
          </div>
        </div>

        <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 13, padding: 13 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 11 }}>{t('xp.thisWeek')}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100, marginBottom: 8 }}>
            {weekH.map((h, i) => {
              const isFut = i > todayI, isToday = i === todayI, empty = !isFut && h === 0
              const p2 = isFut ? 0 : Math.min((h / GOAL) * 100, 100)
              const bc = h >= GOAL ? M.gn : M.ac
              return (
                <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ flex: 1, width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                    {isFut ? (
                      <div style={{ width: '100%', height: '100%', borderRadius: '5px 5px 3px 3px', border: `1.5px dashed ${M.b1}` }} />
                    ) : empty ? (
                      <div style={{ width: '100%', height: '100%', borderRadius: '5px 5px 3px 3px', border: '2px dashed #ef4444', background: M.id === 'dark' ? '#1a0808' : '#fff5f5' }} />
                    ) : (
                      <div style={{ width: '100%', height: `${p2}%`, background: bc, borderRadius: '5px 5px 3px 3px', border: isToday ? `2px solid ${M.at}` : 'none', minHeight: 4 }} />
                    )}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: empty ? '#ef4444' : isToday ? M.ac : isFut ? M.tf : M.t3 }}>{isFut ? '--' : fmtHours(h)}</span>
                  <span style={{ fontSize: 9, fontWeight: isToday ? 700 : 500, color: isToday ? M.ac : M.t3 }}>{DAYS[i]}</span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 9, borderTop: `1px solid ${M.s2}` }}>
            <span style={{ fontSize: 11, color: M.t3 }}>{t('xp.thisWeekLine', { hours: fmtHours(weekTotal) })}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.ac }}>+{Math.round(weekTotal * 8)} XP</span>
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>{t('xp.achievements')}</div>
        <div data-tour="xp-achievements" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {ACHS.map((a) => {
            const got = unlocked.includes(a.id)
            return (
              <div key={a.id} style={{ background: got ? (M.id === 'dark' ? `${a.co}18` : `${a.co}10`) : M.s2, border: `1px solid ${got ? a.co + '44' : M.b1}`, borderRadius: 12, padding: '11px 6px', textAlign: 'center', opacity: got ? 1 : 0.4 }}>
                <div style={{ fontSize: 22, marginBottom: 4, filter: got ? 'none' : 'grayscale(1)' }}>{a.e}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: got ? a.co : M.t3, lineHeight: 1.3 }}>{got ? achName(a.id, lang) : t('xp.locked')}</div>
                <div style={{ fontSize: 9, color: M.t3, marginTop: 2 }}>{achDescription(a.id, lang)}</div>
                {got && <div style={{ fontSize: 9, fontWeight: 700, color: a.co, marginTop: 3, fontFamily: 'monospace' }}>+{a.xp} XP</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  })()

  const pickDayForView = (d: Date) => {
    const isToday = fmtDateISO(d) === fmtDateISO(new Date())
    setViewDate(isToday ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    setTab('today')
  }
  const monthView = (
    <MonthView
      M={M}
      goal={GOAL}
      referenceDate={selectedDate}
      onPickDay={pickDayForView}
      onBackfillDay={(d) => {
        const [y, mo, da] = [d.getFullYear(), d.getMonth(), d.getDate()]
        setEditingDate(new Date(y, mo, da))
        setTab('timer')
        setLogOpen(true)
      }}
      firstName={currentUser.username.trim().split(/\s+/)[0]}
    />
  )
  const weekView = (
    <WeekView
      M={M}
      goal={GOAL}
      referenceDate={selectedDate}
      onPickDay={pickDayForView}
      onBackfillDay={(d) => {
        const [y, mo, da] = [d.getFullYear(), d.getMonth(), d.getDate()]
        setEditingDate(new Date(y, mo, da))
        setTab('timer')
        setLogOpen(true)
      }}
      firstName={currentUser.username.trim().split(/\s+/)[0]}
    />
  )

  const historyView = (
    <div style={{ padding: '16px 14px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div role="tablist" style={{ display: 'flex', gap: 2, background: M.s2, border: `1px solid ${M.b1}`, borderRadius: 8, padding: 2 }}>
          {(['week', 'month'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={historyScale === v}
              onClick={() => setHistoryScale(v)}
              style={{ padding: '5px 12px', border: 'none', borderRadius: 6, background: historyScale === v ? M.s1 : 'transparent', color: historyScale === v ? M.t1 : M.t3, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >{historyScale === v ? t(`history.${v === 'week' ? 'weekly' : 'monthly'}`) : t(`history.${v === 'week' ? 'weekly' : 'monthly'}`)}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => stepHistoryDate(-1)}
            aria-label={t('scale.prev', { scale: t(`scale.${historyScale}` as 'scale.week') })}
            style={{ background: 'none', border: 'none', color: M.tf, fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: '0 6px', lineHeight: 1 }}
          >‹</button>
          <button
            onClick={() => stepHistoryDate(1)}
            aria-label={t('scale.next', { scale: t(`scale.${historyScale}` as 'scale.week') })}
            style={{ background: 'none', border: 'none', color: M.tf, fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: '0 6px', lineHeight: 1 }}
          >›</button>
          {!historyIsOnCurrent && (
            <button
              onClick={jumpHistoryToCurrent}
              style={{ background: M.ac, border: 'none', color: '#fff', fontSize: 9, fontWeight: 700, cursor: 'pointer', padding: '0 7px', height: 18, marginLeft: 4, borderRadius: 9, letterSpacing: 0.3, textTransform: 'uppercase' }}
            >{t('header.now')}</button>
          )}
        </div>
      </div>
      {historyScale === 'week' ? weekView : monthView}
    </div>
  )

  const views = { today: todayView, timer: timerView, history: historyView, xp: xpView }

  const hasCtx = !!(tCo && tPr)
  const coObj = companies.find((c) => c.id === tCo)
  const prObj = (projectCache[tCo] || []).find((p) => p.id === tPr)

  const runningXpBonus = tRun ? Math.floor(tSec / 60) : 0
  const displaySessionXp = sessionXp + runningXpBonus

  const modeOverlay = (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, background: M.bg, zIndex: 999,
        pointerEvents: modeTransition === 'out' ? 'auto' : 'none',
        opacity: modeTransition === 'out' ? 1 : 0,
        transition: 'opacity 180ms ease-out',
      }}
    />
  )

  const warnColor = tRun ? null : tSec > 0 ? '#f59e0b' : '#ef4444'
  const topBarBg = tRun ? M.bg : tSec > 0 ? '#ff7a00' : '#ff1f1f'
  const topBarFg = tRun ? M.t1 : '#fff'
  const topBarMuted = tRun ? M.t3 : 'rgba(255,255,255,0.8)'

  if (size === 'top') {
    return (
      <>
      <div
        key="mode-top"
        className={`mode-root ${themeClass}`}
        onDoubleClick={() => goSize('full')}
        title={t('top.dblClickToOpen')}
        style={{
          height: '100vh', width: '100vw', background: M.bg,
          display: 'flex', alignItems: 'stretch', gap: 0,
          padding: 0, fontFamily: "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
          borderBottom: `1px solid ${M.b1}`, position: 'relative', overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 8px', position: 'relative', overflow: 'hidden',
            background: topBarBg,
            transition: 'background 200ms ease-out',
          }}
        >
        <div
          className="top-fill"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: `${gpct}%`,
            backgroundImage: done
              ? `linear-gradient(90deg, ${M.gn}12 0%, ${M.gn}22 50%, ${M.gn}12 100%)`
              : `linear-gradient(90deg, ${M.ac}0a 0%, ${M.ac}1c 50%, ${M.ac}0a 100%)`,
            pointerEvents: 'none',
          }}
        />

        <button
          onClick={() => setTRun((r) => !r)}
          title={tRun ? 'Pause' : 'Start'}
          style={{ width: 14, height: 14, borderRadius: '50%', background: tRun ? M.pk : M.btn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, cursor: 'pointer' }}
        >
          {tRun ? (
            <svg width="5" height="6" viewBox="0 0 12 14" fill="none"><rect x="1" y="1" width="3" height="12" rx="1" fill="white" /><rect x="8" y="1" width="3" height="12" rx="1" fill="white" /></svg>
          ) : (
            <svg width="5" height="7" viewBox="0 0 13 15" fill="none" style={{ marginLeft: 1 }}><path d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z" fill="white" stroke="white" strokeWidth="1.2" strokeLinejoin="round" /></svg>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, zIndex: 1 }}>
          <span
            style={{
              width: 5, height: 5, borderRadius: '50%',
              background: tRun ? M.pk : '#fff',
              boxShadow: tRun ? `0 0 5px ${M.pk}` : '0 0 4px rgba(255,255,255,0.6)',
              animation: 'pulse 1.2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: tRun ? M.ac : topBarFg, letterSpacing: 0.1, minWidth: 48 }}>
            {fmtClock(tSec)}
          </div>
        </div>

        <div style={{ width: 1, height: 12, background: M.b1, zIndex: 1 }} />

        <div style={{ flex: 1, minWidth: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {!tRun ? (
            (() => {
              const msg = tSec > 0 ? t('status.pausedTask') : t('status.notTracking')
              const sep = '   •   '
              const half = (msg + sep).repeat(30)
              return (
                <div className="status-marquee" style={{ zIndex: 1 }}>
                  <div
                    className="status-marquee-track"
                    style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: 1.4,
                      color: '#fff',
                      fontFamily: 'monospace',
                    }}
                  >
                    {half}{half}
                  </div>
                </div>
              )
            })()
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, maxWidth: '45%', minWidth: 0 }}>
                {hasCtx && coObj ? (
                  <>
                    <span style={{ fontSize: 10, fontWeight: 700, color: M.t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                      {coObj.name}
                    </span>
                    <span style={{ fontSize: 9, color: M.t3, flexShrink: 0 }}>·</span>
                    <span style={{ fontSize: 10, color: M.t2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                      {prObj?.name || ''}
                    </span>
                    {tD.trim() && (
                      <>
                        <span style={{ fontSize: 9, color: M.t3, flexShrink: 0 }}>—</span>
                        <span style={{ fontSize: 10, color: M.t3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                          {tD}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 10, color: M.t3, fontStyle: 'italic' }}>{t('timer.noTaskSelected')}</span>
                )}
              </div>

              {funMessage && (
                <span
                  key={funMessage}
                  className="fun-msg"
                  style={{ fontSize: 10, color: M.ac, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, flex: 1, minWidth: 0 }}
                >
                  {funMessage}
                </span>
              )}
            </>
          )}
        </div>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, padding: '0 8px', background: M.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {weekH.map((h, i) => {
              const p = Math.min(1, h / GOAL)
              const filled = p > 0
              const color = p >= 1 ? M.gn : p > 0 ? M.ac : M.b1
              return (
                <span
                  key={i}
                  title={`${DAYS[i]}: ${fmtHours(h)}h`}
                  style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: color,
                    opacity: filled ? 0.35 + p * 0.65 : 0.4,
                  }}
                />
              )
            })}
          </div>

          <div style={{ width: 1, height: 9, background: M.b1 }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, position: 'relative' }}>
            <span style={{ fontSize: 9, lineHeight: 1 }}>
              {gpct >= 100 ? '🚀' : gpct >= 75 ? '🎯' : gpct >= 50 ? '🔥' : gpct >= 25 ? '☕' : '🌱'}
            </span>
            <div style={{ fontSize: 9, fontWeight: 800, color: displaySessionXp > 0 ? M.ac : M.t3, fontFamily: 'monospace', opacity: displaySessionXp > 0 ? 1 : 0.55, position: 'relative' }}>
              +{displaySessionXp}
              {xpBump && (
                <span key={xpBump.id} className="xp-bump" style={{ color: M.ac }}>
                  +{xpBump.delta}
                </span>
              )}
            </div>
            <div style={{ fontSize: 8, color: M.t3, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>xp</div>
            <div style={{ width: 1, height: 9, background: M.b1, margin: '0 2px', alignSelf: 'center' }} />
            <div style={{ fontSize: 10, fontWeight: 800, color: done ? M.gn : M.t1, fontFamily: 'monospace', letterSpacing: -0.3 }}>{fmtHours(todayH)}</div>
            <div style={{ fontSize: 8, color: M.t3, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>/ {GOAL}h</div>
          </div>

          <div style={{ width: 1, height: 9, background: M.b1 }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: M.pk, fontFamily: 'monospace' }}>{streak}d</div>
            <div style={{ fontSize: 8, color: M.t3, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>streak</div>
          </div>

          <div style={{ width: 1, height: 9, background: M.b1 }} />

          <button
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}
            style={{ width: 14, height: 14, borderRadius: 3, background: 'transparent', border: `1px solid ${M.b1}`, color: M.t3, fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            {mode === 'light' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => goSize('full')}
            title={lang === 'sv' ? 'Öppna sidomenyn' : 'Open sidebar'}
            style={{ height: 14, padding: '0 6px', borderRadius: 3, background: M.s2, border: `1px solid ${M.b1}`, color: M.t2, fontSize: 8, fontWeight: 600, cursor: 'pointer' }}
          >
            {lang === 'sv' ? 'Öppna' : 'Open'}
          </button>
        </div>
      </div>
      {modeOverlay}
      </>
    )
  }

  return (
    <>
    <div key="mode-full" className={`mode-root ${themeClass} ${M.id === 'dark' ? 'app-dark-glow' : ''}`} style={{ height: '100vh', background: M.id === 'dark' ? undefined : M.bg, fontFamily: "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif", color: M.t1, position: 'relative', overflow: 'hidden', boxShadow: warnColor ? `inset 0 0 0 2px ${warnColor}` : undefined, transition: 'box-shadow 200ms ease-out', display: 'flex', flexDirection: 'column' }}>
      {hdr}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {views[tab]}
      </div>
      <div style={{ height: 40, flexShrink: 0, borderTop: `1px solid ${M.b1}`, background: M.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', gap: 10 }}>
        <div style={{ display: 'flex', gap: 2, background: M.s2, border: `1px solid ${M.b1}`, borderRadius: 7, padding: 2 }}>
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{ width: 22, height: 22, borderRadius: 5, border: mode === m ? `1px solid ${M.b2}` : 'none', background: mode === m ? M.s1 : 'transparent', fontSize: 11, cursor: 'pointer' }}
            >{m === 'light' ? '☀️' : '🌙'}</button>
          ))}
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'sv' : 'en')}
          title={t('lang.switchTo')}
          style={{ width: 22, height: 22, borderRadius: 5, background: M.s2, border: `1px solid ${M.b1}`, fontSize: 12, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {lang === 'en' ? '🇸🇪' : '🇬🇧'}
        </button>
        <button
          onClick={startIntroFresh}
          title={t('footer.showIntro')}
          style={{ width: 22, height: 22, borderRadius: 5, background: M.s2, border: `1px solid ${M.b1}`, color: M.t3, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
        >
          ?
        </button>
        <button
          onClick={confirmSignOut}
          title={t('footer.signOut')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: M.t3, fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}
        >
          <span>{t('footer.signOut')}</span>
          <span style={{ fontSize: 13 }}>⎋</span>
        </button>
      </div>

      {showIntro && (
        <IntroOverlay
          M={M}
          step={introStep}
          steps={introSteps}
          onAdvance={advanceIntro}
          onSkip={dismissIntro}
          canAdvance={introCanAdvance}
        />
      )}

      {confirmation && (
        <>
          <div
            onClick={() => setConfirmation(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }}
          />
          <div
            ref={confirmationRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            tabIndex={-1}
            style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: M.s1, border: `1.5px solid ${M.ac}`, borderRadius: 14, padding: '14px 16px', zIndex: 201, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}
          >
            <div id="confirmation-title" style={{ fontSize: 14, fontWeight: 700, color: M.t1, marginBottom: 6 }}>{confirmation.title}</div>
            <div style={{ fontSize: 12, color: M.t3, marginBottom: 12, lineHeight: 1.4 }}>{confirmation.body}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmation(null)}
                style={{ flex: 1, padding: '9px 0', background: M.s2, border: `1px solid ${M.b1}`, borderRadius: 9, color: M.t2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >{t('entry.cancel')}</button>
              <button
                onClick={async () => { const fn = confirmation.onConfirm; setConfirmation(null); await fn() }}
                style={{ flex: 1, padding: '9px 0', background: M.btn, border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >{confirmation.confirmLabel}</button>
            </div>
          </div>
        </>
      )}

      {floats.map((f) => (
        <div key={f.id} style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 13, padding: '9px 18px', fontSize: 15, fontWeight: 800, color: f.col, fontFamily: 'monospace', pointerEvents: 'none', animation: 'floatUp 1.5s ease-out forwards', whiteSpace: 'nowrap', zIndex: 99, boxShadow: `0 4px 24px ${f.col}44` }}>{f.txt}</div>
      ))}

      {ach && (
        <div style={{ position: 'absolute', bottom: 14, left: 12, right: 12, background: M.s1, border: `1.5px solid ${ach.co}55`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, zIndex: 100, animation: 'achIn .4s cubic-bezier(.34,1.56,.64,1)', boxShadow: `0 8px 32px ${ach.co}44` }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `${ach.co}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{ach.e}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: ach.co, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>{t('xp.achievementUnlocked')}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: M.t1, marginBottom: 2 }}>{achName(ach.id, lang)}</div>
            <div style={{ fontSize: 10, color: M.t3 }}>{achDescription(ach.id, lang)}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: ach.co, fontFamily: 'monospace', background: `${ach.co}18`, borderRadius: 7, padding: '4px 9px' }}>+{ach.xp} XP</div>
        </div>
      )}
    </div>
    {modeOverlay}
    </>
  )
}
