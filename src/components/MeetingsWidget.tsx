import { useEffect, useState } from 'react'
import { useTranslation } from '../lib/i18n'
import * as prim from '../primitives'

interface Props {
  onStartForMeeting?: (title: string) => void
}

const localeFor = (lang: string) => (lang === 'sv' ? 'sv-SE' : 'en-GB')

const fmtTime = (iso: string, locale: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

export function MeetingsWidget({ onStartForMeeting }: Props) {
  const { t, i18n } = useTranslation()
  const locale = localeFor(i18n.language)

  const [status, setStatus] = useState<GraphStatus | null>(null)
  const [meetings, setMeetings] = useState<GraphMeeting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    window.electronAPI.graphStatus().then((s) => { if (!cancelled) setStatus(s) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!status?.signedIn) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      const res = await window.electronAPI.graphMeetings({ hoursBack: 1, hoursForward: 12 })
      if (cancelled) return
      if (res.error) setError(res.error)
      else setMeetings((res.meetings || []).filter((m) => !m.isCancelled))
      setLoading(false)
    }
    load()
    const id = window.setInterval(load, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(id) }
  }, [status?.signedIn])

  const onSignIn = async () => {
    setSigningIn(true)
    setError(null)
    const res = await window.electronAPI.graphSignIn()
    setSigningIn(false)
    if (res.error) setError(res.error)
    else {
      const s = await window.electronAPI.graphStatus()
      setStatus(s)
    }
  }

  const onSignOut = async () => {
    await window.electronAPI.graphSignOut()
    setStatus(status ? { ...status, signedIn: false } : null)
    setMeetings([])
  }

  if (!status) return null

  if (!status.configured) {
    return (
      <prim.Stack
        background="surface"
        border="all"
        borderStyle="dashed"
        borderRadius="lg"
        paddingX="md"
        paddingY="sm"
      >
        <prim.Text size="sm" color="tertiary">{t('cal.notConfigured')}</prim.Text>
      </prim.Stack>
    )
  }

  if (!status.signedIn) {
    return (
      <prim.Stack
        background="surface"
        border="all"
        borderRadius="lg"
        padding="md"
        gap="sm"
      >
        <prim.Text size="base" weight="bold" color="primary">
          {t('cal.connectYourCalendar')}
        </prim.Text>
        <prim.Text size="sm" color="tertiary">{t('cal.connectPitch')}</prim.Text>
        <prim.Button
          variant="primary"
          size="sm"
          disabled={signingIn}
          onClick={onSignIn}
        >
          {signingIn ? t('cal.waitingSignIn') : t('cal.signInMs')}
        </prim.Button>
        {signingIn && <prim.Text size="xs" color="tertiary">{t('cal.browserOpens')}</prim.Text>}
        {error && <prim.Text size="xs" color="error">{error}</prim.Text>}
      </prim.Stack>
    )
  }

  const upcoming = meetings.filter((m) => new Date(m.end.dateTime).getTime() > now)
  const next = upcoming[0]
  const rest = upcoming.slice(1, 4)

  const showLoading = loading && upcoming.length === 0
  const showEmpty = !loading && upcoming.length === 0

  const renderRestRow = (m: GraphMeeting) => (
    <prim.Stack
      key={m.id}
      direction="row"
      justify="spaceBetween"
      align="center"
      gap="sm"
      paddingY="xs"
    >
      <prim.Text as="span" size="sm" color="secondary" truncate>
        {m.subject || t('cal.noSubject')}
      </prim.Text>
      <prim.MonoText size="sm" color="tertiary" weight="normal">
        {fmtTime(m.start.dateTime, locale)}
      </prim.MonoText>
    </prim.Stack>
  )

  return (
    <prim.Stack
      background="surface"
      border="all"
      borderRadius="lg"
      padding="md"
      gap="sm"
    >
      <prim.Stack direction="row" justify="spaceBetween" align="center">
        <prim.Text
          as="span"
          size="2xs"
          weight="bold"
          color="tertiary"
          tracking="looser"
          transform="uppercase"
        >
          {t('cal.label')}
        </prim.Text>
        <prim.Button
          variant="link"
          size="xs"
          onClick={onSignOut}
          title={t('cal.disconnect')}
        >
          {t('cal.disconnect')}
        </prim.Button>
      </prim.Stack>

      {error && <prim.Text size="xs" color="error">{error}</prim.Text>}
      {showLoading && <prim.Text size="sm" color="tertiary">{t('cal.loading')}</prim.Text>}
      {showEmpty && <prim.Text size="sm" color="tertiary" italic>{t('cal.noMeetings')}</prim.Text>}

      {next && (
        <NextMeetingCard
          meeting={next}
          now={now}
          onStartForMeeting={onStartForMeeting}
        />
      )}

      {rest.length > 0 && <prim.Stack gap="xs">{rest.map(renderRestRow)}</prim.Stack>}
    </prim.Stack>
  )
}

interface NextMeetingCardProps {
  meeting: GraphMeeting
  now: number
  onStartForMeeting?: (title: string) => void
}

function NextMeetingCard({ meeting, now, onStartForMeeting }: NextMeetingCardProps) {
  const { t, i18n } = useTranslation()
  const locale = localeFor(i18n.language)
  const startMs = Date.parse(meeting.start.dateTime)
  const endMs = Date.parse(meeting.end.dateTime)
  const mins = Math.round((startMs - now) / 60000)
  const inProgress = mins <= 0 && endMs > now
  const soon = mins > 0 && mins <= 5

  const cardBackground: prim.StackBackground = inProgress ? 'green' : soon ? 'pink' : 'page'
  const cardBorderColor: prim.StackBorderColor = inProgress ? 'green' : soon ? 'pink' : 'soft'
  const labelColor: prim.TextColor = inProgress ? 'green' : soon ? 'pink' : 'accent'

  const labelText = inProgress
    ? t('cal.now')
    : mins < 60
      ? t('cal.inMin', { n: mins })
      : t('cal.atTime', { time: fmtTime(meeting.start.dateTime, locale) })

  const timeRange = `${fmtTime(meeting.start.dateTime, locale)}–${fmtTime(meeting.end.dateTime, locale)}`
  const subject = meeting.subject || t('cal.noSubject')
  const organizerName = meeting.organizer?.emailAddress?.name
  const joinUrl = meeting.onlineMeeting?.joinUrl

  const onStart = () => onStartForMeeting?.(meeting.subject || t('cal.noSubject'))
  const onJoin = () => { if (joinUrl) window.open(joinUrl, '_blank', 'noopener,noreferrer') }

  return (
    <prim.Stack
      background={cardBackground}
      border="all"
      borderColor={cardBorderColor}
      borderRadius="md"
      paddingX="md"
      paddingY="sm"
      gap="xs"
    >
      <prim.Stack direction="row" justify="spaceBetween" align="center" gap="sm">
        <prim.Text
          as="span"
          size="2xs"
          weight="black"
          color={labelColor}
          tracking="widest"
          transform="uppercase"
        >
          {labelText}
        </prim.Text>
        <prim.MonoText size="xs" color="tertiary" weight="normal">
          {timeRange}
        </prim.MonoText>
      </prim.Stack>
      <prim.Text size="md" weight="bold" color="primary">{subject}</prim.Text>
      {organizerName && (
        <prim.Text size="xs" color="tertiary">
          {t('cal.withOrganizer', { name: organizerName })}
        </prim.Text>
      )}
      {onStartForMeeting && (
        <prim.Stack direction="row" gap="xs">
          <prim.Button variant="primary" size="xs" grow onClick={onStart}>
            {t('cal.startForThis')}
          </prim.Button>
          {joinUrl && (
            <prim.Button variant="secondary" size="xs" onClick={onJoin}>
              {t('cal.join')}
            </prim.Button>
          )}
        </prim.Stack>
      )}
    </prim.Stack>
  )
}
