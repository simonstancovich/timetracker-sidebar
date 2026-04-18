import { useEffect, useRef, useState } from 'react'

type Theme = {
  bg: string
  s1: string
  s2: string
  b1: string
  b2: string
  t1: string
  t2: string
  t3: string
  ac: string
  ad: string
  at: string
  btn: string
  pk: string
  gn: string
  bsh: string
}

interface Props {
  M: Theme
  onStartForMeeting?: (title: string) => void
}

const fmtTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

const minutesUntil = (iso: string) => {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000)
}

export function MeetingsWidget({ M, onStartForMeeting }: Props) {
  const [status, setStatus] = useState<GraphStatus | null>(null)
  const [meetings, setMeetings] = useState<GraphMeeting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)
  const mounted = useRef(true)

  useEffect(() => () => { mounted.current = false }, [])

  useEffect(() => {
    window.electronAPI.graphStatus().then((s) => {
      if (mounted.current) setStatus(s)
    })
  }, [])

  useEffect(() => {
    if (!status?.signedIn) return
    const load = async () => {
      setLoading(true)
      setError(null)
      const res = await window.electronAPI.graphMeetings({ hoursBack: 1, hoursForward: 12 })
      if (!mounted.current) return
      if (res.error) setError(res.error)
      else setMeetings((res.meetings || []).filter((m) => !m.isCancelled))
      setLoading(false)
    }
    load()
    const id = window.setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [status?.signedIn])

  if (!status) return null
  if (!status.configured) {
    return (
      <div style={{ background: M.s1, border: `1px dashed ${M.b1}`, borderRadius: 11, padding: '10px 12px', fontSize: 11, color: M.t3 }}>
        Calendar integration not yet configured. Add <code>AZURE_CLIENT_ID</code> to enable.
      </div>
    )
  }

  if (!status.signedIn) {
    return (
      <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 11, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: M.t1 }}>Connect your calendar</div>
        <div style={{ fontSize: 11, color: M.t3, lineHeight: 1.4 }}>
          Pull upcoming meetings from Outlook so you can log meeting time in one click.
        </div>
        <button
          disabled={signingIn}
          onClick={async () => {
            setSigningIn(true)
            setError(null)
            const res = await window.electronAPI.graphSignIn()
            setSigningIn(false)
            if (res.error) setError(res.error)
            else if (mounted.current) {
              const s = await window.electronAPI.graphStatus()
              setStatus(s)
            }
          }}
          style={{ alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 8, background: signingIn ? M.s2 : M.btn, color: signingIn ? M.t3 : '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: signingIn ? 'default' : 'pointer', boxShadow: signingIn ? 'none' : M.bsh }}
        >
          {signingIn ? 'Waiting for sign-in…' : 'Sign in with Microsoft'}
        </button>
        {signingIn && (
          <div style={{ fontSize: 10, color: M.t3 }}>A browser window should open. Complete sign-in there.</div>
        )}
        {error && <div style={{ fontSize: 10, color: '#ef4444' }}>{error}</div>}
      </div>
    )
  }

  const upcoming = meetings.filter((m) => new Date(m.end.dateTime).getTime() > Date.now())
  const next = upcoming[0]
  const rest = upcoming.slice(1, 4)

  return (
    <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 11, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          Calendar
        </span>
        <button
          onClick={async () => { await window.electronAPI.graphSignOut(); setStatus({ ...status, signedIn: false }); setMeetings([]) }}
          title="Disconnect calendar"
          style={{ background: 'none', border: 'none', color: M.tf, fontSize: 10, cursor: 'pointer', padding: 0 }}
        >
          disconnect
        </button>
      </div>

      {loading && upcoming.length === 0 && <div style={{ fontSize: 11, color: M.t3 }}>Loading…</div>}

      {!loading && upcoming.length === 0 && (
        <div style={{ fontSize: 11, color: M.t3, fontStyle: 'italic' }}>No meetings coming up. Enjoy the focus window.</div>
      )}

      {next && (() => {
        const mins = minutesUntil(next.start.dateTime)
        const inProgress = mins <= 0 && new Date(next.end.dateTime).getTime() > Date.now()
        const soon = mins > 0 && mins <= 5
        return (
          <div style={{ background: inProgress ? `${M.gn}15` : soon ? `${M.pk}15` : M.bg, border: `1px solid ${inProgress ? `${M.gn}55` : soon ? `${M.pk}55` : M.b1}`, borderRadius: 9, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: inProgress ? M.gn : soon ? M.pk : M.ac }}>
                {inProgress ? 'Now' : soon ? `In ${mins} min` : mins < 60 ? `In ${mins} min` : `At ${fmtTime(next.start.dateTime)}`}
              </div>
              <div style={{ fontSize: 10, color: M.t3, fontFamily: 'monospace' }}>
                {fmtTime(next.start.dateTime)}–{fmtTime(next.end.dateTime)}
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: M.t1, lineHeight: 1.3 }}>
              {next.subject || '(no subject)'}
            </div>
            {next.organizer?.emailAddress?.name && (
              <div style={{ fontSize: 10, color: M.t3 }}>
                with {next.organizer.emailAddress.name}
              </div>
            )}
            {onStartForMeeting && (
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button
                  onClick={() => onStartForMeeting(next.subject || 'Meeting')}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, background: M.btn, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  Start timer for this
                </button>
                {next.onlineMeeting?.joinUrl && (
                  <button
                    onClick={() => window.open(next.onlineMeeting!.joinUrl, '_blank')}
                    style={{ padding: '6px 10px', borderRadius: 6, background: M.s2, color: M.t2, border: `1px solid ${M.b1}`, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Join
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {rest.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rest.map((m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 2px', fontSize: 11 }}>
              <span style={{ color: M.t2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                {m.subject || '(no subject)'}
              </span>
              <span style={{ color: M.t3, fontFamily: 'monospace', flexShrink: 0 }}>
                {fmtTime(m.start.dateTime)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
