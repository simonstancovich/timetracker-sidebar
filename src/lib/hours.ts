// Hour formatting + parsing helpers. Pure functions; no React, no IPC.
// Extracted from App.tsx so they're trivially unit-testable.

// Format elapsed seconds as "HH:MM:SS" (used by the running timer clock).
export function fmtClock(s: number): string {
  const safe = Number.isFinite(s) && s >= 0 ? Math.floor(s) : 0
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(safe / 3600))}:${pad(Math.floor((safe % 3600) / 60))}:${pad(safe % 60)}`
}

// Format decimal hours as "H:MM" (e.g. 1.5 → "1:30", 0.033 → "0:02").
export function fmtHours(h: number): string {
  if (!Number.isFinite(h) || h < 0) return '0:00'
  const total = Math.round(h * 60)
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${hh}:${String(mm).padStart(2, '0')}`
}

// Round decimal hours UP to the nearest 15-minute block (0.25 h). Minimum is
// 0.25 h (15 min) so any logged work is at least that. The billing convention
// for this team is "always round up" — a 16-minute task bills as 30 min, not
// 15.
export function roundUpToQuarter(h: number): number {
  if (!Number.isFinite(h) || h <= 0) return 0.25
  return Math.max(0.25, +((Math.ceil(h * 4) / 4).toFixed(2)))
}

// Accepts "1.5", "1,5", "1:30", "01:30:00", etc. Returns decimal hours or null.
export function parseHoursInput(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null
  if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(s)) {
    const [h, m, sec] = s.split(':').map((p) => parseInt(p, 10))
    if (isNaN(h) || isNaN(m)) return null
    if (m >= 60 || (sec != null && sec >= 60)) return null
    return +(h + m / 60 + (sec || 0) / 3600).toFixed(2)
  }
  const numeric = s.replace(',', '.')
  // Reject mixed alphanumeric ("1h 30m" used to pass through parseFloat as 1).
  if (!/^\d+(\.\d+)?$/.test(numeric)) return null
  const n = parseFloat(numeric)
  if (isNaN(n) || n < 0) return null
  return +n.toFixed(2)
}
