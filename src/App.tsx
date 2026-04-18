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
import { pickRandomMessage } from './lib/funMessages'
import { pickGreeting } from './lib/greetingMessages'
import { getTimerInsight } from './lib/timerInsights'
import { emptyTodayMessage, saveCheer, xpCoachNote } from './lib/personality'
import { IntroOverlay, IntroStep } from './components/IntroOverlay'
import { MeetingsWidget } from './components/MeetingsWidget'
import { MonthView } from './components/MonthView'
import { WeekView } from './components/WeekView'

const INTRO_STEPS: IntroStep[] = [
  {
    target: null,
    title: "Time tracking shouldn't feel like homework.",
    body:
      "Run the timer as you work. Log entries in seconds. Earn XP for showing up.\n\nLet's get you rolling in under a minute.",
    nextLabel: "Let's go →",
  },
  {
    target: 'tab-timer',
    title: 'Open the Timer tab',
    body: 'This is where you live-track time. Tap it to continue.',
  },
  {
    target: 'timer-start',
    title: 'Start the clock',
    body:
      "Hit Start — don't worry about the details yet. You fill them in while the timer runs.",
  },
  {
    target: 'timer-company',
    title: 'Pick a client',
    body: "Tap the field, then type to filter. Try 'DevCore' for this first run.",
    hint: 'Start typing — the list narrows as you go.',
  },
  {
    target: 'timer-project',
    title: 'Pick a project',
    body: "Open the project menu and select 'Utbildning/Seminarium'.",
  },
  {
    target: 'timer-description',
    title: 'What are you doing?',
    body: "Type a short description. 'learning to track time!' works for now.",
    needsManualNext: true,
    nextLabel: 'Next →',
  },
  {
    target: 'tab-today',
    title: 'Your day at a glance',
    body: "Tap Today. It's your dashboard — stats, progress, everything you logged.",
  },
  {
    target: 'today-stats',
    title: "Today's numbers",
    body:
      "Hours logged today, your current streak, and this week's total. Streak resets if you skip a weekday.",
    needsManualNext: true,
    readOnly: true,
    nextLabel: 'Got it →',
  },
  {
    target: 'today-entries',
    title: "Entries live here",
    body:
      "Every entry you log shows up here grouped by client.\n\n▶ resumes a task · double-click to edit · ✕ deletes.",
    needsManualNext: true,
    readOnly: true,
    nextLabel: 'Next →',
  },
  {
    target: 'tab-log',
    title: 'Log past entries',
    body: 'Tap +Log. Use this tab to backfill time or log without the timer.',
  },
  {
    target: 'log-hours',
    title: 'Type hours directly',
    body:
      "No timer, no problem. Use +/- or type 1:30 / 1.5 to set the hours, then save.",
    needsManualNext: true,
    readOnly: true,
    nextLabel: 'Got it →',
  },
  {
    target: 'tab-xp',
    title: 'Achievements & XP',
    body: 'Tap XP. Every minute tracked earns XP.',
  },
  {
    target: 'xp-level',
    title: 'Level up',
    body:
      "Every 1000 XP gets you a new level. Higher levels unlock cooler titles — aim for Principal Dev.",
    needsManualNext: true,
    readOnly: true,
    nextLabel: 'Next →',
  },
  {
    target: 'xp-achievements',
    title: 'Unlock achievements',
    body:
      "Hit milestones like first entry, 7-day streak, or 10h in a day to unlock these badges.",
    needsManualNext: true,
    readOnly: true,
    nextLabel: 'Almost done →',
  },
  {
    target: null,
    title: "You're all set! 🎉",
    body:
      "Your timer is running and you know where everything lives.\n\nShake the window to hide it, dock it as a top bar from the footer, or just keep working.\n\nHave fun!",
    nextLabel: 'Start tracking',
  },
]

// Fallback used only if we can't resolve the real user from the server.
const FALLBACK_USER = { _user_id: '187', username: 'Simon Stancovich' }

// ─── Theme tokens ────────────────────────────────────────────────────────
const L = {
  id: 'light', bg: '#f8f7ff', s1: '#ffffff', s2: '#f1effc', s3: '#e8e4fa',
  b1: '#e2dff5', b2: '#c4bfec',
  ac: '#7c3aed', ad: '#ede9fe', at: '#4c1d95', am: '#c4b5fd',
  pk: '#be185d', pb: '#fdf2f8', pp: '#fce7f3', pv: '#f472b6',
  gn: '#16a34a', gb: '#f0fdf4', gd: '#bbf7d0',
  t1: '#1e1b4b', t2: '#524d96', t3: '#706aa2', tf: '#9d98c8',
  lo: '#7c3aed', btn: '#7c3aed', bsh: '0 4px 14px rgba(124,58,237,.35)',
  co: ['#7c3aed', '#0891b2', '#be185d', '#0d9488'],
}
// Dark mode — reference: JetBrains Toolbox
// Deep violet-black base with a soft gradient glow, glassy lifted surfaces.
const D = {
  id: 'dark',
  bg: '#0b0910',         // near-black violet base
  s1: 'rgba(255,255,255,0.04)', // glassy raised surface
  s2: 'rgba(255,255,255,0.025)',
  s3: 'rgba(255,255,255,0.07)',
  b1: 'rgba(255,255,255,0.06)',
  b2: 'rgba(255,255,255,0.12)',
  ac: '#9b8cff',         // vivid violet accent
  ad: 'rgba(155,140,255,0.12)',
  at: '#d5cdff',
  am: 'rgba(255,255,255,0.12)',
  pk: '#e89aae',
  pb: 'rgba(232,154,174,0.07)',
  pp: 'rgba(232,154,174,0.18)',
  pv: '#e89aae',
  gn: '#6fd4a0',
  gb: 'rgba(111,212,160,0.07)',
  gd: 'rgba(111,212,160,0.25)',
  t1: '#f5f3ff',
  t2: '#c4bedb',
  t3: '#8b85a3',
  tf: '#5a5470',
  lo: '#ffffff',
  btn: '#7e6bff',
  bsh: '0 8px 24px rgba(0,0,0,0.5)',
  co: ['#9b8cff', '#e89aae', '#6fd4a0', '#6ec0e8'],
}
type Theme = typeof L

const ACHS = [
  // First-time milestones
  { id: 'first', e: '🎯', n: 'First Steps', d: 'First entry logged', xp: 50, co: '#7c3aed' },
  { id: 'rookie', e: '📋', n: 'Rookie', d: '10 entries logged', xp: 75, co: '#8b5cf6' },
  { id: 'novice', e: '📝', n: 'Novice', d: '50 entries logged', xp: 150, co: '#6366f1' },
  { id: 'veteran', e: '🎖️', n: 'Veteran', d: '100 entries logged', xp: 250, co: '#4f46e5' },
  { id: 'prolific', e: '📚', n: 'Prolific', d: '500 entries logged', xp: 750, co: '#3730a3' },

  // Streaks
  { id: 'warmup', e: '☕', n: 'Warming Up', d: '3-day streak', xp: 50, co: '#f97316' },
  { id: 'fire', e: '🔥', n: 'On Fire', d: '7-day streak', xp: 100, co: '#ea580c' },
  { id: 'habit', e: '🔗', n: 'Habit Formed', d: '14-day streak', xp: 175, co: '#dc2626' },
  { id: 'lockin', e: '🔒', n: 'Locked In', d: '30-day streak', xp: 300, co: '#b91c1c' },
  { id: 'disciplined', e: '🧘', n: 'Disciplined', d: '60-day streak', xp: 500, co: '#991b1b' },
  { id: 'obsessed', e: '⚡', n: 'Obsessed', d: '100-day streak', xp: 800, co: '#eab308' },
  { id: 'unstoppable', e: '🚀', n: 'Unstoppable', d: '200-day streak', xp: 1200, co: '#ca8a04' },
  { id: 'legend', e: '👑', n: 'Legend', d: '365-day streak', xp: 2500, co: '#a16207' },

  // Hours accumulated
  { id: 'quarter', e: '🌱', n: 'First Quarter', d: '25h logged', xp: 100, co: '#22c55e' },
  { id: 'flow', e: '🌊', n: 'Finding Flow', d: '50h logged', xp: 150, co: '#0ea5e9' },
  { id: 'cent', e: '💯', n: 'Centurion', d: '100h logged', xp: 300, co: '#0891b2' },
  { id: 'dedicated', e: '💪', n: 'Dedicated', d: '250h logged', xp: 500, co: '#0e7490' },
  { id: 'halfgrand', e: '🏅', n: 'Half Grand', d: '500h logged', xp: 750, co: '#155e75' },
  { id: 'grand', e: '🏆', n: 'Grand Master', d: '1000h logged', xp: 1250, co: '#be185d' },
  { id: 'mythic', e: '💎', n: 'Mythic', d: '2500h logged', xp: 2500, co: '#9f1239' },
  { id: 'legacy', e: '🗿', n: 'Legacy', d: '5000h logged', xp: 5000, co: '#881337' },

  // Daily peaks
  { id: 'solid', e: '📈', n: 'Solid Day', d: '4h in one day', xp: 50, co: '#14b8a6' },
  { id: 'full', e: '✅', n: 'Full Day', d: '6h in one day', xp: 80, co: '#059669' },
  { id: 'goal', e: '⭐', n: 'Goal Crusher', d: 'Hit 8h in a day', xp: 120, co: '#16a34a' },
  { id: 'lord', e: '⏰', n: 'Time Lord', d: '10h in one day', xp: 175, co: '#15803d' },
  { id: 'midnight', e: '🌙', n: 'Midnight Oil', d: '12h in one day', xp: 275, co: '#166534' },
  { id: 'impossible', e: '🤯', n: 'Impossible Day', d: '16h in one day', xp: 500, co: '#14532d' },

  // Time of day
  { id: 'early', e: '🌅', n: 'Early Bird', d: 'Log before 9am', xp: 75, co: '#f59e0b' },
  { id: 'dawn', e: '🌄', n: 'Dawn Patrol', d: 'Log before 6am', xp: 150, co: '#d97706' },
  { id: 'night', e: '🦉', n: 'Night Owl', d: 'Log after 10pm', xp: 75, co: '#6366f1' },
  { id: 'vampire', e: '🦇', n: 'Vampire', d: 'Log after midnight', xp: 125, co: '#4f46e5' },
  { id: 'twilight', e: '🌇', n: 'Twilight', d: 'Log in the evening', xp: 40, co: '#c026d3' },
  { id: 'lunch', e: '🥪', n: 'Skipped Lunch', d: 'Log during 12–1pm', xp: 50, co: '#db2777' },

  // Variety
  { id: 'multi', e: '🎭', n: 'Multitasker', d: '3 clients in one day', xp: 100, co: '#9333ea' },
  { id: 'collector', e: '🗂️', n: 'Client Collector', d: '10 different clients', xp: 250, co: '#7e22ce' },
  { id: 'hopper', e: '🐸', n: 'Project Hopper', d: '5 projects in one day', xp: 125, co: '#6b21a8' },
  { id: 'renaissance', e: '🎨', n: 'Renaissance', d: '20 different projects', xp: 400, co: '#581c87' },
  { id: 'focused', e: '🎯', n: 'Laser Focus', d: 'One project all day', xp: 100, co: '#0d9488' },

  // Weekly / monthly
  { id: 'perfectweek', e: '🌟', n: 'Perfect Week', d: 'Goal hit Mon–Fri', xp: 350, co: '#fbbf24' },
  { id: 'perfectmonth', e: '✨', n: 'Perfect Month', d: 'Every weekday at goal', xp: 1500, co: '#f59e0b' },
  { id: 'king', e: '♛', n: 'Consistency King', d: '4 perfect weeks in a row', xp: 1000, co: '#d97706' },
  { id: 'comeback', e: '💫', n: 'Comeback', d: 'Log after a 7+ day break', xp: 75, co: '#06b6d4' },
  { id: 'weekend', e: '🌴', n: 'Weekend Warrior', d: 'Log on a weekend', xp: 60, co: '#10b981' },
  { id: 'break', e: '🏖️', n: 'Vacation Mode', d: 'Took a 7+ day break', xp: 25, co: '#22d3ee' },

  // Billing
  { id: 'firstinv', e: '💰', n: 'First Invoice', d: 'First billable hour', xp: 50, co: '#84cc16' },
  { id: 'bigweek', e: '💵', n: 'Big Week', d: '40+ billable hours in a week', xp: 300, co: '#65a30d' },
  { id: 'moneymaker', e: '💸', n: 'Money Maker', d: '1000 billable hours', xp: 1750, co: '#4d7c0f' },

  // Quirky
  { id: 'speed', e: '⚡', n: 'Speed Logger', d: '3 entries within 5 min', xp: 80, co: '#a855f7' },
  { id: 'overachiever', e: '🔥', n: 'Overachiever', d: '10h+ every day for a week', xp: 600, co: '#ef4444' },
  { id: 'editor', e: '✏️', n: 'Refined', d: 'Edit an entry 5 times', xp: 50, co: '#64748b' },
] as const
type Ach = (typeof ACHS)[number]

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr']
const GOAL = 8

const pad = (n: number) => String(n).padStart(2, '0')

// Playful status under the timer clock — text and icon kept separate so the
// text can be centered without the icon pulling it off-center.
function vibe(tSec: number, tRun: boolean): { text: string; icon: string } {
  if (!tRun) return tSec > 0
    ? { text: 'On a break — press ▶ to resume', icon: '' }
    : { text: 'Ready when you are', icon: '✨' }
  const m = tSec / 60
  if (m < 2)   return { text: 'Warming up',            icon: '☕' }
  if (m < 10)  return { text: 'Finding flow',          icon: '🎯' }
  if (m < 25)  return { text: 'In the zone',           icon: '✨' }
  if (m < 50)  return { text: 'Deep focus',            icon: '🧘' }
  if (m < 90)  return { text: 'Crushing it',           icon: '🔥' }
  if (m < 150) return { text: 'Unstoppable',           icon: '⚡' }
  if (m < 240) return { text: 'Legendary',             icon: '🏆' }
  return       { text: 'Maybe stretch a little?',      icon: '🌱' }
}

// Format decimal hours as "H:MM" (e.g. 1.5 → "1:30", 0.033 → "0:02").
function fmtHours(h: number): string {
  if (!Number.isFinite(h) || h < 0) return '0:00'
  const total = Math.round(h * 60)
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${hh}:${String(mm).padStart(2, '0')}`
}

// Accepts "1.5", "1,5", "1:30", "01:30:00", etc. Returns decimal hours or null.
function parseHoursInput(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null
  if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(s)) {
    const [h, m, sec] = s.split(':').map((p) => parseInt(p, 10))
    if (isNaN(h) || isNaN(m)) return null
    if (m >= 60 || (sec != null && sec >= 60)) return null
    return +(h + m / 60 + (sec || 0) / 3600).toFixed(2)
  }
  const n = parseFloat(s.replace(',', '.'))
  if (isNaN(n) || n < 0) return null
  return +n.toFixed(2)
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
  const M: Theme = mode === 'light' ? L : D

  const [tab, setTab] = useState<'today' | 'timer' | 'log' | 'xp'>('today')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [scale, setScale] = useState<'day' | 'week' | 'month'>('day')

  const cycleScale = () => {
    setScale((s) => (s === 'day' ? 'week' : s === 'week' ? 'month' : 'day'))
    setTab('today')
  }
  const stepDate = (dir: 1 | -1) => {
    if (scale === 'day') {
      setSelectedDate((d) => { const n = new Date(d); n.setDate(n.getDate() + dir); return n })
    } else if (scale === 'week') {
      setSelectedDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 7 * dir); return n })
    } else {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1))
    }
  }
  const jumpToCurrent = () => setSelectedDate(new Date())
  const [size, setWindowSize] = useState<'full' | 'top'>('full')

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
    if (window.confirm('Are you sure you want to sign out?')) {
      window.electronAPI.signOut()
    }
  }

  const [currentUser, setCurrentUser] = useState<{ _user_id: string; username: string }>(FALLBACK_USER)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [projectCache, setProjectCache] = useState<Record<string, Project[]>>({})
  const [entries, setEntries] = useState<TimeEntry[]>([])
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
    const show = () => {
      setFunMessage(pickRandomMessage())
      hideId = window.setTimeout(() => setFunMessage(null), 18000)
    }
    const initialId = window.setTimeout(show, 5000)
    const rotateId = window.setInterval(show, 45000)
    return () => {
      clearTimeout(initialId)
      clearInterval(rotateId)
      if (hideId) clearTimeout(hideId)
    }
  }, [size])
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [floats, setFloats] = useState<{ id: number; txt: string; col: string }[]>([])
  const [ach, setAch] = useState<Ach | null>(null)
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
  const [draftId, setDraftId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<
    { title: string; body: string; confirmLabel: string; onConfirm: () => void | Promise<void> } | null
  >(null)

  const resetTimer = () => {
    setTRun(false); setTSec(0); setTCo(''); setTPr(''); setTD(''); setTNote(''); setTInv(true)
    setDraftId(null); draftIdRef.current = null
  }

  const resetLogForm = () => {
    setEditingId(null); setFCo(''); setFPr(''); setFH(1); setFD(''); setFNote(''); setFInv(true)
  }

  const stopAndLogCurrent = async () => {
    if (!tCo || !tPr || !tD.trim()) {
      addFloat('Fill client, project & task first', '#ef4444')
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
        title: 'Change project?',
        body: 'The current timer is still running. It will be saved to timetracker first, then we switch to the new one.',
        confirmLabel: 'Save & switch',
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
    setFCo(entry._company_id)
    await ensureProjects(entry._company_id)
    setFPr(entry._project_id)
    setFH(parseFloat(entry.hour) || 0)
    setFD(entry.description || '')
    setFNote(entry.internal_description || '')
    setFInv(entry.invoice === '1')
    setTab('log')
  }

  // ─── Auth gating ───────────────────────────────────────────────────────
  useEffect(() => {
    window.electronAPI.checkAuth().then(setAuthed)
    window.electronAPI.onAuthSuccess(() => setAuthed(true))
    window.electronAPI.onSignedOut(() => setAuthed(false))
    window.electronAPI.onSessionLost(() => setAuthed(false))
    window.electronAPI.onForcedSize((s) => {
      setWindowSize(s)
    })
  }, [])

  // ─── Persisted: mode, xp, unlocked, streak, timer ──────────────────────
  useEffect(() => {
    if (!authed) return
    ;(async () => {
      const [m, x, u, s, last, t] = await Promise.all([
        window.electronAPI.storeGet('mode'),
        window.electronAPI.storeGet('xp'),
        window.electronAPI.storeGet('unlocked'),
        window.electronAPI.storeGet('streak'),
        window.electronAPI.storeGet('lastLoggedDate'),
        window.electronAPI.storeGet('timer'),
      ])
      if (m === 'dark' || m === 'light') setMode(m)
      if (typeof x === 'number') setXp(x)
      if (Array.isArray(u)) setUnlocked(u)

      // streak is valid only if we've logged today or yesterday
      const today = fmtDateISO(new Date())
      const yd = new Date(); yd.setDate(yd.getDate() - 1)
      const yesterday = fmtDateISO(yd)
      if (typeof s === 'number' && (last === today || last === yesterday)) setStreak(s)
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

  const advanceIntro = () => {
    setIntroStep((s) => {
      const next = s + 1
      if (next >= INTRO_STEPS.length) {
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
    if (introStep === 1 && tab === 'timer') setIntroStep(2)
    if (introStep === 2 && tRun) setIntroStep(3)
    if (introStep === 3 && tCo) setIntroStep(4)
    if (introStep === 4 && tPr) setIntroStep(5)
    if (introStep === 6 && tab === 'today') setIntroStep(7)
    if (introStep === 9 && tab === 'log') setIntroStep(10)
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
    const first = currentUser.username.trim().split(/\s+/)[0] || 'friend'
    setGreetingMsg(pickGreeting(first))
    const id = window.setInterval(() => setGreetingMsg(pickGreeting(first)), 30 * 60 * 1000)
    return () => clearInterval(id)
  }, [currentUser.username])

  useEffect(() => {
    const first = currentUser.username.trim().split(/\s+/)[0] || ''
    const compute = () => setTimerInsight(getTimerInsight({
      tRun, tSec, tCo, tPr, tD,
      todayH, goal: GOAL,
      entriesToday: entries.length,
      streak,
      firstName: first,
    }))
    compute()
    const id = window.setInterval(compute, 2 * 60 * 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tRun, tCo, tPr, tD, entries.length, currentUser.username])

  useEffect(() => { if (authed) window.electronAPI.storeSet('xp', xp) }, [xp, authed])
  useEffect(() => { if (authed) window.electronAPI.storeSet('unlocked', unlocked) }, [unlocked, authed])
  useEffect(() => { if (authed) window.electronAPI.storeSet('streak', streak) }, [streak, authed])

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
        if (!uid) { setCurrentUser(FALLBACK_USER); return }
        const users = await loadUsers()
        const me = users.find((u) => u.id === uid)
        const resolved = me
          ? { _user_id: me.id, username: me.name || me.username }
          : FALLBACK_USER
        setCurrentUser(resolved)
        await window.electronAPI.storeSet('currentUser', resolved)
      } catch {
        setCurrentUser(FALLBACK_USER)
      }
    })()
  }, [authed])

  // ─── Load entries for selected date ────────────────────────────────────
  useEffect(() => {
    if (!authed) return
    loadTimeEntries(selectedDate)
      .then(setEntries)
      .catch((err) => {
        if (err.message === 'NOT_AUTHENTICATED') setAuthed(false)
      })
  }, [authed, selectedDate])

  // ─── Load week hours (Mon–Fri containing selectedDate) ─────────────────
  useEffect(() => {
    if (!authed) return
    const mon = mondayOf(selectedDate)
    const days = [0, 1, 2, 3, 4].map((i) => {
      const d = new Date(mon)
      d.setDate(d.getDate() + i)
      return d
    })
    Promise.all(days.map((d) => loadTimeEntries(d).catch(() => [])))
      .then((all) =>
        setWeekH(all.map((rows) => rows.reduce((s, e) => s + parseFloat(e.hour || '0'), 0))),
      )
  }, [authed, selectedDate])

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
    const mon = mondayOf(selectedDate)
    return Math.max(0, Math.min(4, Math.floor((+selectedDate - +mon) / 86400000)))
  }, [selectedDate])
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
      addFloat(`Save failed: ${err.message || 'unknown'}`, '#ef4444')
      return
    }

    // Refresh entries (server assigns id)
    const fresh = await loadTimeEntries(selectedDate)
    setEntries(fresh)
    setWeekH((w) => {
      const n = [...w]
      n[todayI] = +(n[todayI] + hours).toFixed(2)
      return n
    })

    // Streak: bump if this is the first log of today
    const todayISO = fmtDateISO(new Date())
    const lastLogged = await window.electronAPI.storeGet('lastLoggedDate')
    if (lastLogged !== todayISO) {
      const yd = new Date(); yd.setDate(yd.getDate() - 1)
      const yesterdayISO = fmtDateISO(yd)
      const newStreak = lastLogged === yesterdayISO ? streak + 1 : 1
      setStreak(newStreak)
      await window.electronAPI.storeSet('lastLoggedDate', todayISO)
    }

    const earned = Math.round(10 + hours * 8)
    setXp((x) => x + earned)
    addFloat(`${saveCheer()} +${fmtHours(hours)}  +${earned} XP`, M.ac)

    if (entries.length === 0 && !unlocked.includes('first')) {
      const a = ACHS[0]
      setUnlocked((u) => [...u, 'first'])
      setXp((x) => x + a.xp)
      setAch(a); setTimeout(() => setAch(null), 3200)
    }
    if (todayH + hours >= 10 && !unlocked.includes('lord')) {
      const a = ACHS.find((x) => x.id === 'lord')!
      setUnlocked((u) => [...u, 'lord'])
      setXp((x) => x + a.xp)
      setAch(a); setTimeout(() => setAch(null), 3200)
    }
    return saved?.id || existingId || null
  }

  // Silent background save for crash-safety. Upserts the current timer into a server
  // draft entry; later saves update the same id so we don't spawn duplicates.
  const draftIdRef = useRef<string | null>(null)
  useEffect(() => { draftIdRef.current = draftId }, [draftId])
  const autoSaveDraft = async () => {
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
      addFloat(`Delete failed: ${err.message || 'unknown'}`, '#ef4444')
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

  if (authed === null)
    return <div style={{ padding: 24, color: M.t2, background: M.bg, minHeight: '100vh' }}>Loading…</div>
  if (!authed) return <LoginScreen onLogin={() => window.electronAPI.openAuth()} />

  // ─── Shared UI helpers ────────────────────────────────────────────────
  const dateLabel = selectedDate.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })
  const isoWeek = (() => {
    const d = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((+d - +yearStart) / 86400000) + 1) / 7)
  })()
  const monthLabel = selectedDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })
  const scaleLabel = scale === 'day' ? dateLabel : scale === 'week' ? `Vecka ${isoWeek}` : monthLabel

  // ─── Header ────────────────────────────────────────────────────────────
  const hdr = (
    <div style={{ padding: '12px 14px 0', background: M.bg, borderBottom: `1px solid ${M.b1}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: M.lo, letterSpacing: -0.4 }}>DevCore Time</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: M.t3, height: 22, marginTop: -2 }}>
            <button
              onClick={() => stepDate(-1)}
              style={{ background: 'none', border: 'none', color: M.tf, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '0 4px', lineHeight: 1, height: 22, display: 'flex', alignItems: 'center' }}
            >‹</button>
            <button
              onClick={cycleScale}
              onDoubleClick={jumpToCurrent}
              title={`${scale === 'day' ? 'Day' : scale === 'week' ? 'Week' : 'Month'} view — click to switch, double-click for today`}
              style={{ background: 'none', border: 'none', color: M.t3, fontSize: 11, fontWeight: 500, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', lineHeight: 1, height: 22, display: 'flex', alignItems: 'center' }}
            >{scaleLabel}</button>
            <button
              onClick={() => stepDate(1)}
              style={{ background: 'none', border: 'none', color: M.tf, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '0 4px', lineHeight: 1, height: 22, display: 'flex', alignItems: 'center' }}
            >›</button>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: done ? M.gn : todayH > 0 ? M.t1 : M.tf, fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', height: 22, lineHeight: 1 }}>{fmtHours(todayH)}</span>
          <div
            onClick={() => setTab('timer')}
            title={tRun ? 'Timer running' : tSec > 0 ? 'Timer paused — resume on Timer tab' : 'No timer running — click to start'}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
              background: tRun ? `${M.pk}1f` : 'transparent',
              border: `1px solid ${tRun ? `${M.pk}55` : M.b1}`,
              borderRadius: 100, padding: '0 7px', height: 22,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: tRun ? M.pk : tSec > 0 ? '#f59e0b' : '#ef4444',
              boxShadow: tRun ? `0 0 6px ${M.pk}` : 'none',
              animation: tRun ? 'pulse 1.2s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: tRun ? M.pk : M.t3, fontFamily: 'monospace', letterSpacing: 0.3 }}>
              {tRun ? fmtClock(tSec) : tSec > 0 ? 'Paused' : 'Idle'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: M.pb, border: `1px solid ${M.pp}`, borderRadius: 100, padding: '0 7px', height: 22 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: M.pv }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: M.pk, fontFamily: 'monospace' }}>{streak}d</span>
          </div>
          <button
            onClick={() => goSize('top')}
            title="Dock as top bar"
            style={{ width: 24, height: 24, borderRadius: 7, background: M.s2, border: `1px solid ${M.b1}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, color: M.t3, fontWeight: 700 }}
          >▼</button>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        {([['today', 'Today'], ['timer', 'Timer'], ['log', '+ Log'], ['xp', 'XP']] as const).map(([v, l]) => (
          <button
            key={v}
            data-tour={`tab-${v}`}
            onClick={() => setTab(v)}
            style={{ flex: 1, padding: '9px 0', border: 'none', borderBottom: `2px solid ${tab === v ? M.ac : 'transparent'}`, background: 'transparent', color: tab === v ? M.t1 : M.t3, fontSize: 12, fontWeight: tab === v ? 700 : 500, cursor: 'pointer', marginBottom: -1 }}
          >{l}</button>
        ))}
      </div>
    </div>
  )

  const pbar = (
    <div style={{ padding: '10px 14px 10px', borderBottom: `1px solid ${M.s2}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: M.t3 }}>{fmtHours(todayH)} logged</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: done ? M.gn : M.t2 }}>
          {done ? '✓ Goal reached' : `${fmtHours(GOAL - todayH)} to go`}
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
      hr >= 5 && hr < 12 ? 'Good morning' :
      hr >= 12 && hr < 17 ? 'Good afternoon' :
      hr >= 17 && hr < 22 ? 'Good evening' :
      'Still up'
    const emoji =
      hr >= 5 && hr < 12 ? '☀️' :
      hr >= 12 && hr < 17 ? '🌤️' :
      hr >= 17 && hr < 22 ? '🌆' :
      '🌙'
    return (
      <div style={{ paddingBottom: 24 }}>
        {firstName && (
          <div style={{ padding: '12px 14px 4px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 18, lineHeight: 1.1 }}>{emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: M.t1, letterSpacing: -0.3, lineHeight: 1.1 }}>{greeting}, {firstName}</div>
              <div style={{ fontSize: 11, color: M.t3, marginTop: 2 }}>{done ? 'Goal reached — nice work.' : `${fmtHours(GOAL - todayH)} left to hit ${GOAL}:00.`}</div>
              {greetingMsg && (
                <div style={{ fontSize: 11, color: M.ac, marginTop: 4, fontStyle: 'italic', opacity: 0.85 }}>
                  {greetingMsg}
                </div>
              )}
            </div>
          </div>
        )}
        {pbar}
        <div style={{ padding: '12px 14px 0', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div data-tour="today-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr 1fr', gap: 6 }}>
            <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 11, padding: '11px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: M.ac }}>{fmtHours(todayH)}</div>
              <div style={{ fontSize: 9, color: M.t3, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Today</div>
            </div>
            <div style={{ background: M.pb, border: `2px solid ${M.pp}`, borderRadius: 11, padding: '10px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: M.pk, letterSpacing: -1, lineHeight: 1 }}>{streak}d</div>
                <div style={{ fontSize: 9, color: M.pk, marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, opacity: .7 }}>Streak</div>
              </div>
              <div style={{ fontSize: 20, lineHeight: 1, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>🔥</div>
            </div>
            <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 11, padding: '11px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: M.t3 }}>
                {fmtHours(weekTotal)}
              </div>
              <div style={{ fontSize: 9, color: M.t3, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Week</div>
            </div>
          </div>

          <MeetingsWidget
            M={M}
            onStartForMeeting={(title) => {
              setTD(title)
              setTab('timer')
            }}
          />

          <div style={{ height: 1, background: M.s2 }} />

          <div data-tour="today-entries" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {Object.entries(groups).map(([co, g], gi) => (
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
                        title="Double-click to edit"
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
                          >Cancel</button>
                          <button
                            onClick={async () => { setPendingDeleteId(null); await delEntry(e.id) }}
                            style={{ flex: 1, padding: '10px 0', background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >Delete</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '28px 12px', fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ color: M.t2, fontWeight: 600, marginBottom: 4 }}>{emptyTodayMessage()}</div>
              <div style={{ color: M.tf, fontSize: 11 }}>No entries yet for {dateLabel}.</div>
            </div>
          )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: `1px solid ${M.s2}` }}>
            <span style={{ fontSize: 12, color: M.t3 }}>Total:</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: done ? M.gn : M.ac, fontFamily: 'monospace' }}>{fmtHours(todayH)}</span>
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
        addFloat('Fill client, project & task first', '#ef4444')
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
            <span style={{ fontSize: 10, fontWeight: 700, color: M.pk, letterSpacing: 1.5, textTransform: 'uppercase' }}>Recording</span>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: tRun ? '4px 0' : '8px 0 6px' }}>
          <div style={{ fontFamily: "'SF Mono','Cascadia Code',monospace", fontSize: tRun ? 50 : 44, fontWeight: 300, color: tRun ? M.ac : (M.id === 'dark' ? '#2e2e2e' : '#d4c8f5'), letterSpacing: 3, lineHeight: 1, marginBottom: 6 }}>
            {fmtClock(tSec)}
          </div>
          {(() => {
            const v = vibe(tSec, tRun)
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
            <span style={{ fontSize: 11, color: M.t2 }}>⭐ XP this session</span>
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
                  >▶  Resume</button>
                  <button
                    onClick={() => void stopAndLogCurrent()}
                    style={{ padding: 13, background: M.gn, border: 'none', borderRadius: 11, color: M.id === 'dark' ? '#022c22' : '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${M.gn}55` }}
                  >Stop &amp; Log</button>
                </div>
              ) : (
                <button
                  data-tour="timer-start"
                  onClick={() => setTRun(true)}
                  style={{ width: '100%', padding: 13, background: M.btn, border: '1px solid transparent', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: M.bsh }}
                >{tSec > 0 ? '▶  Resume' : '▶  Start timer'}</button>
              )
            )}
            {tRun && !canStart && (
              <div style={{ fontSize: 11, color: M.pk, fontWeight: 600, textAlign: 'center', padding: '4px 0' }}>
                Timer is running — fill in fields below to be able to save
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: M.b1 }} />
              <span style={{ fontSize: 10, color: M.t2, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>What are you working on?</span>
              <div style={{ flex: 1, height: 1, background: M.b1 }} />
            </div>

            <div data-tour="timer-company">
              <Combobox
                value={tCo}
                items={companies}
                placeholder={`Search client… (${companies.length})`}
                theme={M}
                onChange={async (id) => { setTCo(id); setTPr(''); if (id) await ensureProjects(id) }}
              />
            </div>

            {tCo && (
              <div data-tour="timer-project">
                <Combobox
                  value={tPr}
                  items={prList}
                  placeholder={prList.length ? `Search project… (${prList.length})` : 'Loading…'}
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
                  placeholder="Task description *"
                  style={{ padding: '11px 12px', background: M.s1, border: `1.5px solid ${tD.trim() ? M.ac : M.b2}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', width: '100%' }}
                />
                <textarea
                  value={tNote}
                  onChange={(e) => setTNote(e.target.value)}
                  placeholder="Internal notes (optional) — not shown on invoice"
                  rows={2}
                  style={{ padding: '11px 12px', background: M.s1, border: `1.5px solid ${M.b2}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', width: '100%', resize: 'none' }}
                />
                <div
                  onClick={() => setTInv((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: M.bg, border: `1px solid ${M.b1}`, borderRadius: 9, cursor: 'pointer' }}
                >
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: tInv ? M.ac : M.b1, display: 'flex', alignItems: 'center', padding: 2, transition: 'background .2s' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', transform: `translateX(${tInv ? 16 : 0}px)`, transition: 'transform .2s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                  </div>
                  <span style={{ fontSize: 12, color: M.t1 }}>Invoiceable</span>
                </div>
              </>
            )}
          </div>

        {tRun && hasCtx && (
          <div style={{ background: M.s1, border: `1.5px solid ${M.am}`, borderRadius: 13, padding: '11px 13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>Now tracking</span>
              <button onClick={() => setTRun(false)} style={{ fontSize: 11, color: M.ac, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>change</button>
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
                  {tInv ? 'BILL' : 'NO BILL'}
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
            <button onClick={() => setTRun(false)} style={{ height: 46, background: M.s2, border: `1px solid ${M.b1}`, borderRadius: 12, color: M.t2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⏸  Pause</button>
            <button onClick={stop} style={{ height: 46, background: M.gn, border: 'none', borderRadius: 12, color: M.id === 'dark' ? '#022c22' : '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${M.gn}55` }}>Stop &amp; Log</button>
          </div>
        )}
      </div>
    )
  })()

  // ─── Log view ──────────────────────────────────────────────────────────
  const logView = (() => {
    const recent: TimeEntry[] = []
    const seen = new Set<string>()
    entries.forEach((e) => {
      const k = e._company_id + ':' + e._project_id
      if (!seen.has(k) && recent.length < 3) { seen.add(k); recent.push(e) }
    })

    const prList = projectCache[fCo] || []
    const prObj = prList.find((p) => p.id === fPr)
    const co = companies.find((c) => c.id === fCo)

    const save = async () => {
      if (!fCo || !fPr || !co || !prObj) return
      await saveNewEntry(fCo, fPr, fH, fD, fInv, fNote.trim(), selectedDate, editingId)
      resetLogForm()
      setTab('today')
    }

    return (
      <div style={{ padding: '15px 14px 24px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {editingId && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: M.ad, border: `1px solid ${M.am}`, borderRadius: 10, padding: '9px 12px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.at, letterSpacing: 0.5, textTransform: 'uppercase' }}>Editing entry</span>
            <button
              onClick={resetLogForm}
              style={{ background: 'none', border: 'none', color: M.ac, fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '2px 4px' }}
            >Cancel</button>
          </div>
        )}
        {recent.length > 0 && !editingId && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>Recent</div>
            <div style={{ fontSize: 11, color: M.tf, marginBottom: 8 }}>▶ opens timer with task pre-selected</div>
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
          <span style={{ fontSize: 10, color: M.t3, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 1 }}>or log manually</span>
          <div style={{ flex: 1, height: 1, background: M.b1 }} />
        </div>

        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Client *</div>
          <Combobox
            value={fCo}
            items={companies}
            placeholder={`Search client… (${companies.length})`}
            theme={M}
            onChange={async (id) => { setFCo(id); setFPr(''); if (id) await ensureProjects(id) }}
          />
        </div>

        {fCo && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Project *</div>
            <Combobox
              value={fPr}
              items={prList}
              placeholder={prList.length ? `Search project… (${prList.length})` : 'Loading…'}
              theme={M}
              onChange={setFPr}
            />
          </div>
        )}

        <div data-tour="log-hours">
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Hours *</div>
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
            Type <code>1:30</code> or <code>1.5</code>
          </div>
          {prObj && parseFloat(prObj.hour_price) > 0 && (
            <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: M.t3, fontFamily: 'monospace' }}>
              {(fH * parseFloat(prObj.hour_price)).toFixed(0)} kr total · {parseFloat(prObj.hour_price)}kr/h
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
            Description <span style={{ color: M.tf, fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 10 }}>optional</span>
          </div>
          <textarea
            value={fD}
            onChange={(e) => setFD(e.target.value)}
            placeholder="What did you work on?"
            rows={2}
            style={{ width: '100%', padding: '11px 12px', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', resize: 'none' }}
          />
        </div>

        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
            Internal notes <span style={{ color: M.tf, fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 10 }}>optional · not shown on invoice</span>
          </div>
          <textarea
            value={fNote}
            onChange={(e) => setFNote(e.target.value)}
            placeholder="Anything only internal to remember"
            rows={2}
            style={{ width: '100%', padding: '11px 12px', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, color: M.t1, fontSize: 13, outline: 'none', resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10 }}>
          <div
            onClick={() => setFInv((v) => !v)}
            style={{ width: 40, height: 22, borderRadius: 11, background: fInv ? M.ac : M.b1, display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer', transition: 'background .2s' }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff', transform: `translateX(${fInv ? 18 : 0}px)`, transition: 'transform .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
          </div>
          <span style={{ fontSize: 13, color: M.t1 }}>Invoiceable</span>
        </div>

        <button
          onClick={save}
          disabled={!fCo || !fPr}
          style={{ width: '100%', height: 46, background: fCo && fPr ? M.btn : M.s3, border: 'none', borderRadius: 12, color: fCo && fPr ? '#fff' : M.t3, fontSize: 14, fontWeight: 700, cursor: fCo && fPr ? 'pointer' : 'default', boxShadow: fCo && fPr ? M.bsh : 'none' }}
        >{editingId ? 'Save changes' : 'Save entry'}</button>
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
            })}
          </div>
        </div>

        <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 13, padding: 13 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 11 }}>This week</div>
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
            <span style={{ fontSize: 11, color: M.t3 }}>{fmtHours(weekTotal)} this week</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.ac }}>+{Math.round(weekTotal * 8)} XP</span>
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>Achievements</div>
        <div data-tour="xp-achievements" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {ACHS.map((a) => {
            const got = unlocked.includes(a.id)
            return (
              <div key={a.id} style={{ background: got ? (M.id === 'dark' ? `${a.co}18` : `${a.co}10`) : M.s2, border: `1px solid ${got ? a.co + '44' : M.b1}`, borderRadius: 12, padding: '11px 6px', textAlign: 'center', opacity: got ? 1 : 0.4 }}>
                <div style={{ fontSize: 22, marginBottom: 4, filter: got ? 'none' : 'grayscale(1)' }}>{a.e}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: got ? a.co : M.t3, lineHeight: 1.3 }}>{got ? a.n : 'Locked'}</div>
                <div style={{ fontSize: 9, color: M.t3, marginTop: 2 }}>{a.d}</div>
                {got && <div style={{ fontSize: 9, fontWeight: 700, color: a.co, marginTop: 3, fontFamily: 'monospace' }}>+{a.xp} XP</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  })()

  const monthView = (
    <MonthView
      M={M}
      goal={GOAL}
      onPickDay={(d) => { setSelectedDate(d); setScale('day') }}
      onBackfillDay={(d) => { setSelectedDate(d); setScale('day'); setTab('log') }}
      firstName={currentUser.username.trim().split(/\s+/)[0]}
    />
  )
  const weekView = (
    <WeekView
      M={M}
      goal={GOAL}
      referenceDate={selectedDate}
      onPickDay={(d) => { setSelectedDate(d); setScale('day') }}
      onBackfillDay={(d) => { setSelectedDate(d); setScale('day'); setTab('log') }}
      firstName={currentUser.username.trim().split(/\s+/)[0]}
    />
  )

  const todayScopeView = scale === 'day' ? todayView : scale === 'week' ? weekView : monthView

  const views = { today: todayScopeView, timer: timerView, log: logView, xp: xpView }

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
        className="mode-root"
        onDoubleClick={() => goSize('full')}
        title="Double-click to open full sidebar"
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
              const msg = tSec > 0 ? 'PAUSED TASK' : 'NO TASK BEING WORKED ON'
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
                  <span style={{ fontSize: 10, color: M.t3, fontStyle: 'italic' }}>No task selected</span>
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
            title="Open sidebar"
            style={{ height: 14, padding: '0 6px', borderRadius: 3, background: M.s2, border: `1px solid ${M.b1}`, color: M.t2, fontSize: 8, fontWeight: 600, cursor: 'pointer' }}
          >
            Open
          </button>
        </div>
      </div>
      {modeOverlay}
      </>
    )
  }

  return (
    <>
    <div key="mode-full" className={`mode-root ${M.id === 'dark' ? 'app-dark-glow' : ''}`} style={{ height: '100vh', background: M.id === 'dark' ? undefined : M.bg, fontFamily: "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif", color: M.t1, position: 'relative', overflow: 'hidden', boxShadow: warnColor ? `inset 0 0 0 2px ${warnColor}` : undefined, transition: 'box-shadow 200ms ease-out', display: 'flex', flexDirection: 'column' }}>
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
          onClick={startIntroFresh}
          title="Show intro"
          style={{ width: 22, height: 22, borderRadius: 5, background: M.s2, border: `1px solid ${M.b1}`, color: M.t3, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
        >
          ?
        </button>
        <button
          onClick={confirmSignOut}
          title="Sign out"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: M.t3, fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}
        >
          <span>Sign out</span>
          <span style={{ fontSize: 13 }}>⎋</span>
        </button>
      </div>

      {showIntro && (
        <IntroOverlay
          M={M}
          step={introStep}
          steps={INTRO_STEPS}
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
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: M.s1, border: `1.5px solid ${M.ac}`, borderRadius: 14, padding: '14px 16px', zIndex: 201, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: M.t1, marginBottom: 6 }}>{confirmation.title}</div>
            <div style={{ fontSize: 12, color: M.t3, marginBottom: 12, lineHeight: 1.4 }}>{confirmation.body}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmation(null)}
                style={{ flex: 1, padding: '9px 0', background: M.s2, border: `1px solid ${M.b1}`, borderRadius: 9, color: M.t2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
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
            <div style={{ fontSize: 9, fontWeight: 700, color: ach.co, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>Achievement unlocked</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: M.t1, marginBottom: 2 }}>{ach.n}</div>
            <div style={{ fontSize: 10, color: M.t3 }}>{ach.d}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: ach.co, fontFamily: 'monospace', background: `${ach.co}18`, borderRadius: 7, padding: '4px 9px' }}>+{ach.xp} XP</div>
        </div>
      )}
    </div>
    {modeOverlay}
    </>
  )
}
