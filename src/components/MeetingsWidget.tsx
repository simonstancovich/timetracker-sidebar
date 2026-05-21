import { useEffect, useState } from 'react'
import { useTranslation } from '../lib/i18n'
import { Button, MonoText, Stack, Text } from '../primitives'
import type {
  StackBackground,
  StackBorderColor,
  TextColor,
} from '../primitives'

interface Props {
  onStartForMeeting?: (title: string) => void
}

type Translate = (key: string, vars?: Record<string, string | number>) => string

const fmtTime = (iso: string, locale: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

export function MeetingsWidget({ onStartForMeeting }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'sv' ? 'sv-SE' : 'en-GB'

  const [status, setStatus] = useState<GraphStatus | null>(null)
  const [meetings, setMeetings] = useState<GraphMeeting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)
  // Ticks so the "NOW" / "in N min" label and the upcoming list stay accurate
  // between the 5-minute refetches.
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
      <Stack
        background="surface"
        border="all"
        borderStyle="dashed"
        borderRadius="lg"
        paddingX="md"
        paddingY="sm"
      >
        <Text size="sm" color="tertiary">{t('cal.notConfigured')}</Text>
      </Stack>
    )
  }

  if (!status.signedIn) {
    return (
      <Stack
        background="surface"
        border="all"
        borderRadius="lg"
        padding="md"
        gap="sm"
      >
        <Text size="base" weight="bold" color="primary">
          {t('cal.connectYourCalendar')}
        </Text>
        <Text size="sm" color="tertiary">{t('cal.connectPitch')}</Text>
        <Button
          variant="primary"
          size="sm"
          disabled={signingIn}
          onClick={onSignIn}
        >
          {signingIn ? t('cal.waitingSignIn') : t('cal.signInMs')}
        </Button>
        {signingIn && <Text size="xs" color="tertiary">{t('cal.browserOpens')}</Text>}
        {error && <Text size="xs" color="error">{error}</Text>}
      </Stack>
    )
  }

  const upcoming = meetings.filter((m) => new Date(m.end.dateTime).getTime() > now)
  const next = upcoming[0]
  const rest = upcoming.slice(1, 4)

  const showLoading = loading && upcoming.length === 0
  const showEmpty = !loading && upcoming.length === 0

  const renderRestRow = (m: GraphMeeting) => (
    <Stack
      key={m.id}
      direction="row"
      justify="spaceBetween"
      align="center"
      gap="sm"
      paddingY="xs"
    >
      <Text inline size="sm" color="secondary" truncate>
        {m.subject || t('cal.noSubject')}
      </Text>
      <MonoText size="sm" color="tertiary" weight="normal">
        {fmtTime(m.start.dateTime, locale)}
      </MonoText>
    </Stack>
  )

  return (
    <Stack
      background="surface"
      border="all"
      borderRadius="lg"
      padding="md"
      gap="sm"
    >
      <Stack direction="row" justify="spaceBetween" align="center">
        <Text
          inline
          size="2xs"
          weight="bold"
          color="tertiary"
          tracking="looser"
          transform="uppercase"
        >
          {t('cal.label')}
        </Text>
        <Button
          variant="link"
          size="xs"
          onClick={onSignOut}
          title={t('cal.disconnect')}
        >
          {t('cal.disconnect')}
        </Button>
      </Stack>

      {error && <Text size="xs" color="error">{error}</Text>}
      {showLoading && <Text size="sm" color="tertiary">{t('cal.loading')}</Text>}
      {showEmpty && <Text size="sm" color="tertiary" italic>{t('cal.noMeetings')}</Text>}

      {next && (
        <NextMeetingCard
          meeting={next}
          now={now}
          locale={locale}
          t={t}
          onStartForMeeting={onStartForMeeting}
        />
      )}

      {rest.length > 0 && <Stack gap="xs">{rest.map(renderRestRow)}</Stack>}
    </Stack>
  )
}

interface NextMeetingCardProps {
  meeting: GraphMeeting
  now: number
  locale: string
  t: Translate
  onStartForMeeting?: (title: string) => void
}

function NextMeetingCard({ meeting, now, locale, t, onStartForMeeting }: NextMeetingCardProps) {
  const startMs = Date.parse(meeting.start.dateTime)
  const endMs = Date.parse(meeting.end.dateTime)
  const mins = Math.round((startMs - now) / 60000)
  const inProgress = mins <= 0 && endMs > now
  const soon = mins > 0 && mins <= 5

  const cardBackground: StackBackground = inProgress ? 'green' : soon ? 'pink' : 'page'
  const cardBorderColor: StackBorderColor = inProgress ? 'green' : soon ? 'pink' : 'soft'
  const labelColor: TextColor = inProgress ? 'green' : soon ? 'pink' : 'accent'

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
    <Stack
      background={cardBackground}
      border="all"
      borderColor={cardBorderColor}
      borderRadius="md"
      paddingX="md"
      paddingY="sm"
      gap="xs"
    >
      <Stack direction="row" justify="spaceBetween" align="center" gap="sm">
        <Text
          inline
          size="2xs"
          weight="black"
          color={labelColor}
          tracking="widest"
          transform="uppercase"
        >
          {labelText}
        </Text>
        <MonoText size="xs" color="tertiary" weight="normal">
          {timeRange}
        </MonoText>
      </Stack>
      <Text size="md" weight="bold" color="primary">{subject}</Text>
      {organizerName && (
        <Text size="xs" color="tertiary">
          {t('cal.withOrganizer', { name: organizerName })}
        </Text>
      )}
      {onStartForMeeting && (
        <Stack direction="row" gap="xs">
          <Button variant="primary" size="xs" grow onClick={onStart}>
            {t('cal.startForThis')}
          </Button>
          {joinUrl && (
            <Button variant="secondary" size="xs" onClick={onJoin}>
              {t('cal.join')}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  )
}
