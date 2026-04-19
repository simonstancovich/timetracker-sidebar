// Contextual timer insights. The goal is to make the app feel alive —
// aware of the time of day, the user's progress, and what state the
// timer is in. Keep messages short and punchy.

import { getHolidays, isWorkingDay } from './swedishHolidays'
import type { Lang } from './i18n'

export interface InsightCtx {
  tRun: boolean
  tSec: number
  tCo: string
  tPr: string
  tD: string
  todayH: number
  goal: number
  entriesToday: number
  lastProjectName?: string
  streak: number
  firstName?: string
  lang?: Lang
}

const fmt = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}:${String(mm).padStart(2, '0')}`
}

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export function getTimerInsight(ctx: InsightCtx): string {
  const now = new Date()
  const hour = now.getHours()
  const lang: Lang = ctx.lang || 'en'
  const en = lang === 'en'
  const name = ctx.firstName || (en ? 'you' : 'du')
  const holidays = getHolidays(now.getFullYear())
  const holidayName = holidays.get(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
  )
  const isDayOff = !isWorkingDay(now, holidays)
  const isSaturday = now.getDay() === 6
  const isSunday = now.getDay() === 0

  // ─── Day off — weekend or Swedish holiday ──────────────────────────
  if (isDayOff && !ctx.tRun) {
    if (holidayName) {
      return en
        ? pick([
            `${holidayName} — rest up, ${name}.`,
            `It's ${holidayName}. Nothing's due.`,
            `${holidayName} today. The timer can wait.`,
            `Holiday mode: ${holidayName}. Enjoy.`,
          ])
        : pick([
            `${holidayName} — vila upp dig, ${name}.`,
            `Det är ${holidayName}. Inget brådskar.`,
            `${holidayName} idag. Timern kan vänta.`,
            `Ledigt: ${holidayName}. Njut.`,
          ])
    }
    if (isSaturday) return en
      ? pick([
          `It's Saturday, ${name}. Log only if you must.`,
          'Saturday vibes — the app says take it easy.',
          'Weekend. The timer is off duty.',
          `Lördag. No hours expected, ${name}.`,
        ])
      : pick([
          `Det är lördag, ${name}. Logga bara om du måste.`,
          'Lördagsvibbar — appen säger ta det lugnt.',
          'Helg. Timern har ledigt.',
          `Lördag. Inga timmar förväntas, ${name}.`,
        ])
    if (isSunday) return en
      ? pick([
          `Sunday — rest, recharge, repeat.`,
          'Sunday. Monday-you will thank you for the break.',
          `It's Sunday, ${name}. Close the app. (Unless you want to log, no judgement.)`,
          `Söndag. Inga timmar förväntade.`,
        ])
      : pick([
          `Söndag — vila, ladda, upprepa.`,
          'Söndag. Måndags-du kommer tacka dig för pausen.',
          `Det är söndag, ${name}. Stäng appen. (Såvida du inte vill logga, ingen dömer.)`,
          `Söndag. Inga timmar förväntas.`,
        ])
  }

  if (isDayOff && ctx.tRun) {
    if (holidayName) return en ? `Working on ${holidayName}? Respect.` : `Jobbar på ${holidayName}? Respekt.`
    return en
      ? pick([
          `Logging time on a ${isSaturday ? 'Saturday' : 'Sunday'}? Hope it's worth it.`,
          'Weekend work — make sure the invoice reflects it.',
          'Overtime territory. Log it properly.',
        ])
      : pick([
          `Loggar tid på en ${isSaturday ? 'lördag' : 'söndag'}? Hoppas det är värt det.`,
          'Helgarbete — se till att fakturan speglar det.',
          'Övertidsterritorium. Logga det ordentligt.',
        ])
  }

  // ─── Critical: missing required fields ─────────────────────────────
  if (!ctx.tCo) {
    return en
      ? pick([
          'Pick a client to start tracking.',
          'Who are you working for today?',
          'Start by picking a client.',
          'Client first, then the rest falls into place.',
        ])
      : pick([
          'Välj en kund för att börja spåra.',
          'Vem jobbar du för idag?',
          'Börja med att välja en kund.',
          'Kunden först, resten faller på plats.',
        ])
  }
  if (!ctx.tPr) {
    return en
      ? pick([
          'Now pick a project.',
          'Which project is this under?',
          'Project next — pick one to keep it tidy.',
        ])
      : pick([
          'Välj ett projekt nu.',
          'Vilket projekt tillhör det här?',
          'Projekt härnäst — välj ett så blir det prydligt.',
        ])
  }
  if (!ctx.tD.trim()) {
    return en
      ? pick([
          "Give it a short description — future-you will thank you.",
          "One line about what you're doing.",
          'Describe the task. Even roughly.',
          'A rough description beats no description.',
        ])
      : pick([
          'Skriv en kort beskrivning — framtida-du kommer tacka.',
          'En rad om vad du gör.',
          'Beskriv uppgiften. Även grovt.',
          'En grov beskrivning slår ingen beskrivning.',
        ])
  }

  // ─── Running: pace / zone awareness ────────────────────────────────
  if (ctx.tRun) {
    const m = ctx.tSec / 60
    if (m < 3) return en
      ? pick([
          'Just started — find your rhythm.',
          'Settling in. Deep breath.',
          "Fresh timer. Let's see where this goes.",
          'Off you go. Stay with it.',
        ])
      : pick([
          'Precis startat — hitta din rytm.',
          'Kommer igång. Djup andning.',
          'Ny timer. Få se vart det tar vägen.',
          'Kör igång. Håll i det.',
        ])
    if (m < 15) return en
      ? pick([
          'Warming up — keep the momentum.',
          "Finding flow — don't break it.",
          'Great pace so far.',
          'In the zone. Stay off Slack.',
        ])
      : pick([
          'Värmer upp — håll momentumet.',
          'Hittar flowet — bryt det inte.',
          'Bra tempo så här långt.',
          'I zonen. Håll dig från Slack.',
        ])
    if (m < 30) return en
      ? pick([
          'Deep work territory. Nice.',
          '20+ minutes in — this is where magic happens.',
          "You're past the friction. Keep going.",
        ])
      : pick([
          'Djupt fokusläge. Fint.',
          '20+ minuter in — det är här magin händer.',
          'Du är förbi friktionen. Kör på.',
        ])
    if (m < 60) return en
      ? pick([
          'Crushing a long session. Respect.',
          'Half hour+. Strong focus.',
          'Nearly an hour of flow. Unusual and impressive.',
        ])
      : pick([
          'Krossar ett långt pass. Respekt.',
          'Halvtimme+. Starkt fokus.',
          'Nästan en timmes flow. Ovanligt och imponerande.',
        ])
    if (m < 120) return en
      ? pick([
          `${Math.floor(m)} min straight. Maybe stretch?`,
          'Over an hour. Water? Walk? Blink?',
          'Long session — eyes OK? Back OK?',
        ])
      : pick([
          `${Math.floor(m)} min i rad. Stretcha kanske?`,
          'Över en timme. Vatten? Promenad? Blinka?',
          'Långt pass — ögon okej? Rygg okej?',
        ])
    return en
      ? pick([
          `${Math.floor(m / 60)}h+ non-stop — you're a machine.`,
          'This is either brilliant or concerning. Both?',
          'Consider calling it soon. Your back knows.',
        ])
      : pick([
          `${Math.floor(m / 60)}h+ nonstop — du är en maskin.`,
          'Det här är antingen briljant eller oroande. Båda?',
          'Kanske lägga av snart. Din rygg vet.',
        ])
  }

  // ─── Not running: contextual nudges ────────────────────────────────
  const ratio = ctx.todayH / ctx.goal

  if (ctx.entriesToday === 0 && ctx.todayH === 0) {
    const morning = hour < 10
    const afternoon = hour >= 12 && hour < 17
    if (morning) return en
      ? pick([
          'First task of the day. Set the tone, ' + name + '.',
          'Fresh slate. Pick something important.',
          'Morning run — start strong.',
          `${name}, what's the one thing to finish before lunch?`,
        ])
      : pick([
          `Dagens första uppgift. Sätt tonen, ${name}.`,
          'Rent blad. Välj något viktigt.',
          'Morgonpass — börja starkt.',
          `${name}, vad är EN sak du vill klara innan lunch?`,
        ])
    if (afternoon) return en
      ? pick([
          'No entries yet today — time to catch up.',
          `Let's log some hours, ${name}.`,
          'Afternoon reset. Start your timer.',
        ])
      : pick([
          'Inga poster idag ännu — dags att komma ikapp.',
          `Vi loggar några timmar, ${name}.`,
          'Eftermiddags-reset. Starta din timer.',
        ])
    return en
      ? pick([
          'Late start? Log what you do, no judgement.',
          'Still time to log something meaningful.',
          `Go on, ${name}. One solid task.`,
        ])
      : pick([
          'Sen start? Logga det du gör, ingen dömer.',
          'Fortfarande tid att logga något meningsfullt.',
          `Kör, ${name}. En rejäl uppgift.`,
        ])
  }

  if (ratio >= 1) {
    return en
      ? pick([
          `Goal crushed — anything past this is bonus.`,
          `${fmt(ctx.todayH)}h logged. Take the W.`,
          'You hit 8h — everything else is frosting.',
          'Goal reached. Keep going or call it.',
          `${name}, the goal is done. You're playing with house money now.`,
        ])
      : pick([
          `Mål krossat — allt härefter är bonus.`,
          `${fmt(ctx.todayH)}h loggade. Ta poängen.`,
          'Du nådde 8h — allt annat är glasyr.',
          'Mål uppnått. Fortsätt eller lägg av.',
          `${name}, målet är klart. Nu spelar du med husets pengar.`,
        ])
  }

  if (ratio >= 0.75) {
    return en
      ? pick([
          `${fmt(ctx.goal - ctx.todayH)}h from goal. One focused session.`,
          "Nearly there — don't lose steam.",
          `You're ${Math.round(ratio * 100)}% of the way. Push.`,
          'The last stretch is where streaks are built.',
        ])
      : pick([
          `${fmt(ctx.goal - ctx.todayH)}h från målet. Ett fokuserat pass.`,
          'Nästan där — tappa inte fart.',
          `Du är ${Math.round(ratio * 100)}% framme. Pressa.`,
          'Slutspurten är där streaks byggs.',
        ])
  }

  if (ratio >= 0.4) {
    return en
      ? pick([
          `${fmt(ctx.todayH)}h logged, ${fmt(ctx.goal - ctx.todayH)}h to go.`,
          'Solid progress. Keep rolling.',
          `You're ahead of "nothing", which is the hardest to beat.`,
          'Halfway-ish. The afternoon is yours.',
        ])
      : pick([
          `${fmt(ctx.todayH)}h loggade, ${fmt(ctx.goal - ctx.todayH)}h kvar.`,
          'Bra framsteg. Fortsätt rulla.',
          'Du är före "inget", som är svårast att slå.',
          'Ungefär halvvägs. Eftermiddagen är din.',
        ])
  }

  if (ratio > 0) {
    return en
      ? pick([
          'Started the ball rolling. Keep it going.',
          `${fmt(ctx.todayH)}h down, more to come.`,
          'One done, more to come.',
          'Momentum is lighter than starting from zero.',
        ])
      : pick([
          'Satte igång bollen. Håll den i rörelse.',
          `${fmt(ctx.todayH)}h klara, mer på väg.`,
          'En klar, mer på väg.',
          'Momentum är lättare än att starta från noll.',
        ])
  }

  if (hour < 9) return en
    ? pick([
        'Early bird energy. Nice and quiet.',
        'Morning focus is the sharpest.',
        'Crisp morning — start something real.',
      ])
    : pick([
        'Morgonpigg och i gång. Härligt och tyst.',
        'Morgonfokus är skarpast.',
        'Frisk morgon — börja med något riktigt.',
      ])
  if (hour < 12) return en
    ? pick([
        'Morning hustle. This is prime time.',
        'Mid-morning — strongest focus window.',
      ])
    : pick([
        'Morgonhustle. Det är bästa tiden.',
        'Mitt på förmiddagen — starkaste fokusfönstret.',
      ])
  if (hour < 14) return en
    ? pick([
        'Lunch approaches — finish one thing first.',
        'Pre-lunch push is a cheat code.',
      ])
    : pick([
        'Lunchen närmar sig — klara av en sak först.',
        'Spurten innan lunch är en fuskkod.',
      ])
  if (hour < 17) return en
    ? pick([
        'Afternoon push — fight the slump.',
        'Post-lunch? Caffeine or a walk. Then go.',
      ])
    : pick([
        'Eftermiddagsspurt — slåss mot svackan.',
        'Efter lunch? Koffein eller en promenad. Sen kör.',
      ])
  if (hour < 20) return en
    ? pick([
        'Evening work. Wind down strong.',
        'Last solid session of the day — make it count.',
      ])
    : pick([
        'Kvällsarbete. Varva ner starkt.',
        'Dagens sista rejäla pass — gör det värt.',
      ])
  if (hour < 23) return en
    ? pick([
        'Night shift? Log it properly.',
        'Late hours — respect.',
      ])
    : pick([
        'Nattpass? Logga det ordentligt.',
        'Sena timmar — respekt.',
      ])
  return en
    ? pick([
        'Past midnight. Sure about this?',
        'You might be a vampire. Log your hours anyway.',
      ])
    : pick([
        'Efter midnatt. Säker på det här?',
        'Du kanske är en vampyr. Logga timmarna ändå.',
      ])
}
