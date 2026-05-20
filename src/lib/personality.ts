import type { Lang } from './i18n'

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

// ─── Empty Today state — no entries logged yet ───────────────────────
const EMPTY_EN_MORNING = [
  'Empty slate. What\'s the first move?',
  'No entries yet — start the timer and log your first task.',
  'Morning. Nothing tracked yet. Change that.',
  'Clean slate. The best hours haven\'t been logged yet.',
  'Zero entries. Zero excuses.',
]
const EMPTY_EN_MIDDAY = [
  'No entries yet today — time to catch up.',
  'The day is slipping. Log something real.',
  'Empty log. Let\'s fix that in the next hour.',
  'Still 0:00. You\'ve got the afternoon to make it count.',
]
const EMPTY_EN_EVENING = [
  'No entries today. Still time to log something.',
  'Late start is still a start.',
  'One entry is still better than zero.',
  'The day isn\'t done until you log it.',
]
const EMPTY_EN_NIGHT = [
  'Late night, no entries. Respect — also, log it.',
  'Night owl mode. Log what you did.',
  'Still awake? Still time to log.',
]

const EMPTY_SV_MORNING = [
  'Rent blad. Vad blir första draget?',
  'Inga poster än — starta timern och logga första uppgiften.',
  'Morgon. Inget spårat än. Ändra på det.',
  'Blankt papper. De bästa timmarna är inte loggade än.',
  'Noll poster. Noll ursäkter.',
]
const EMPTY_SV_MIDDAY = [
  'Inga poster idag ännu — dags att komma ikapp.',
  'Dagen smiter iväg. Logga något riktigt.',
  'Tom loggbok. Vi fixar det inom en timme.',
  'Fortfarande 0:00. Eftermiddagen är din att göra det värt.',
]
const EMPTY_SV_EVENING = [
  'Inga poster idag. Fortfarande tid att logga något.',
  'Sen start är fortfarande en start.',
  'En post är bättre än noll.',
  'Dagen är inte klar förrän du loggar den.',
]
const EMPTY_SV_NIGHT = [
  'Sen kväll, inga poster. Respekt — men logga det.',
  'Nattuggle-läge. Logga vad du gjorde.',
  'Fortfarande vaken? Fortfarande tid att logga.',
]

export function emptyTodayMessage(lang: Lang = 'en'): string {
  const h = new Date().getHours()
  const en = lang === 'en'
  if (h < 10) return pick(en ? EMPTY_EN_MORNING : EMPTY_SV_MORNING)
  if (h < 16) return pick(en ? EMPTY_EN_MIDDAY : EMPTY_SV_MIDDAY)
  if (h < 21) return pick(en ? EMPTY_EN_EVENING : EMPTY_SV_EVENING)
  return pick(en ? EMPTY_EN_NIGHT : EMPTY_SV_NIGHT)
}

// ─── Save confirmations — cheerful ───────────────────────────────────
const SAVE_EN = [
  'Nice.', 'Locked in.', 'Logged.', 'Got it.', 'Clocked.',
  'In the books.', 'Tracked.', 'Solid.', 'Nailed.', 'Stored.', 'On the record.',
]
const SAVE_SV = [
  'Snyggt.', 'Låst in.', 'Loggat.', 'Klart.', 'Stämplat.',
  'Bokfört.', 'Spårat.', 'Solitt.', 'Spikat.', 'Sparat.', 'På pränt.',
]
export function saveCheer(lang: Lang = 'en'): string {
  return pick(lang === 'sv' ? SAVE_SV : SAVE_EN)
}

// ─── XP tab coach note — based on level progress ─────────────────────
export function xpCoachNote(ctx: {
  xp: number
  xpIntoLevel: number
  xpPerLevel: number
  streak: number
  weekTotal: number
  firstName?: string
  lang?: Lang
}): string {
  const { xpIntoLevel, xpPerLevel, streak, weekTotal, firstName } = ctx
  const lang: Lang = ctx.lang || 'en'
  const en = lang === 'en'
  const name = firstName || (en ? 'you' : 'du')
  const remaining = xpPerLevel - xpIntoLevel
  const pct = (xpIntoLevel / xpPerLevel) * 100

  if (remaining <= 50) {
    return en
      ? pick([
          `Only ${remaining} XP to the next level. So close.`,
          `${remaining} XP away from level up. One more session.`,
          `Push through — ${remaining} XP to level up.`,
        ])
      : pick([
          `Bara ${remaining} XP till nästa nivå. Så nära.`,
          `${remaining} XP från nästa nivå. Ett pass till.`,
          `Pressa på — ${remaining} XP till nivåhöjning.`,
        ])
  }

  if (pct >= 75) {
    return en
      ? pick([
          `${pct.toFixed(0)}% of the way to the next level.`,
          `You're in the final stretch — ${remaining} XP to go.`,
          `Almost there, ${name}. ${remaining} XP left.`,
        ])
      : pick([
          `${pct.toFixed(0)}% av vägen till nästa nivå.`,
          `Du är i slutspurten — ${remaining} XP kvar.`,
          `Nästan där, ${name}. ${remaining} XP kvar.`,
        ])
  }

  if (pct >= 40) {
    return en
      ? pick([
          `Halfway-ish. Keep logging, ${name}.`,
          `${pct.toFixed(0)}% to level ${Math.floor(ctx.xp / ctx.xpPerLevel) + 2}.`,
          'Every hour tracked adds up. Keep going.',
        ])
      : pick([
          `Ungefär halvvägs. Fortsätt logga, ${name}.`,
          `${pct.toFixed(0)}% till nivå ${Math.floor(ctx.xp / ctx.xpPerLevel) + 2}.`,
          'Varje spårad timme räknas. Kör på.',
        ])
  }

  if (xpIntoLevel > 0) {
    return en
      ? pick([
          'Fresh level — plenty of room to grow.',
          'Starting out at a new level. Keep the streak going.',
          `${remaining} XP to the next milestone.`,
        ])
      : pick([
          'Ny nivå — gott om plats att växa.',
          'Börjar på en ny nivå. Håll streaken igång.',
          `${remaining} XP till nästa milstolpe.`,
        ])
  }

  if (streak >= 7) return en ? `${streak}-day streak — XP is compounding.` : `${streak} dagars streak — XP ackumuleras.`
  if (weekTotal >= 30) return en ? `Strong week so far — ${weekTotal.toFixed(1)}h logged.` : `Stark vecka så här långt — ${weekTotal.toFixed(1)}h loggade.`
  return en
    ? pick([
        'XP builds quietly. Keep showing up.',
        'Level ups are a byproduct of consistency.',
        'Every minute tracked = +1 XP. It adds up.',
      ])
    : pick([
        'XP byggs tyst. Dyk upp.',
        'Nivåhöjningar är en biprodukt av konsekvens.',
        'Varje loggad minut = +1 XP. Det räknas.',
      ])
}

// ─── 8h goal hit — daily celebration ─────────────────────────────────
const GOAL_DONE_EN = [
  'Day done.',
  '8 hours. Locked.',
  'Goal cleared.',
  'That\'s a day.',
  'Eight hours in the books.',
  'Today, earned.',
  'Goal: hit.',
  'Full shift logged.',
]
const GOAL_DONE_SV = [
  'Dagen klar.',
  '8 timmar. Inlåst.',
  'Mål nått.',
  'Det var en dag.',
  'Åtta timmar bokförda.',
  'Idag, intjänat.',
  'Mål: träffat.',
  'Hel arbetsdag loggad.',
]
export function goalDoneCheer(lang: Lang = 'en'): string {
  return pick(lang === 'sv' ? GOAL_DONE_SV : GOAL_DONE_EN)
}

const GOAL_DONE_SUB_EN = [
  'Anything past this is a bonus.',
  'Rest is gravy.',
  'Coast from here.',
  'The clock can take a break.',
  'Extra hours = extra XP.',
  'You\'ve earned the rest of the day.',
]
const GOAL_DONE_SUB_SV = [
  'Allt efter det här är bonus.',
  'Resten är extra.',
  'Segla från här.',
  'Klockan kan ta paus.',
  'Extra timmar = extra XP.',
  'Du har förtjänat resten av dagen.',
]
export function goalDoneSub(lang: Lang = 'en'): string {
  return pick(lang === 'sv' ? GOAL_DONE_SUB_SV : GOAL_DONE_SUB_EN)
}

// ─── Timer start / stop flavor ───────────────────────────────────────
const START_EN = [ 'Focus time.', 'Game on.', 'Here we go.', 'Clock rolling.', 'Eyes on the task.', 'Tracker\'s ticking.' ]
const START_SV = [ 'Fokusdags.', 'Kör igång.', 'Nu kör vi.', 'Klockan rullar.', 'Ögonen på uppgiften.', 'Timern tickar.' ]
const STOP_EN = [ 'Clocked out.', 'Solid session.', 'In the books.', 'Session saved.', 'Nice work.' ]
const STOP_SV = [ 'Utstämplat.', 'Solitt pass.', 'Bokfört.', 'Pass sparat.', 'Snyggt jobbat.' ]

export function timerStartCheer(lang: Lang = 'en'): string { return pick(lang === 'sv' ? START_SV : START_EN) }
export function timerStopCheer(lang: Lang = 'en'): string { return pick(lang === 'sv' ? STOP_SV : STOP_EN) }

// ─── Weekly coach summary ────────────────────────────────────────────
export function weekInsight(ctx: {
  weekTotal: number
  weeklyGoal: number
  hit: number
  workDayCount: number
  billable: number
  prevWeekTotal: number | null
  bestDayName?: string | null
  bestDayHours?: number
  topClientName?: string
  topClientShare?: number
  firstName?: string
  isFinished: boolean
  lang?: Lang
}): string {
  const {
    weekTotal, weeklyGoal, hit, workDayCount, billable,
    prevWeekTotal, bestDayName, bestDayHours,
    topClientName, topClientShare, firstName, isFinished,
  } = ctx
  const lang: Lang = ctx.lang || 'en'
  const en = lang === 'en'
  const name = firstName || (en ? 'you' : 'du')
  const billRatio = weekTotal > 0 ? billable / weekTotal : 0

  if (weekTotal === 0) return en
    ? pick([
        `Blank week so far, ${name}. Nothing stopping you from changing that.`,
        'Zero hours logged this week — start one timer and roll.',
        `Fresh week, ${name}. The canvas is empty.`,
      ])
    : pick([
        `Tom vecka så här långt, ${name}. Inget stoppar dig från att ändra det.`,
        'Noll timmar loggade den här veckan — starta en timer och kör.',
        `Ny vecka, ${name}. Duken är tom.`,
      ])

  if (prevWeekTotal != null && prevWeekTotal > 0) {
    if (weekTotal >= prevWeekTotal * 1.1) return en
      ? pick([
          `Ahead of last week already. Momentum's with you, ${name}.`,
          `Up on last week — keep that pace going.`,
          `Week-over-week growth. Nice one, ${name}.`,
        ])
      : pick([
          `Före förra veckan redan. Momentum är med dig, ${name}.`,
          `Upp mot förra veckan — håll det tempot.`,
          `Vecka-mot-vecka-tillväxt. Bra jobbat, ${name}.`,
        ])
    if (isFinished && weekTotal < prevWeekTotal * 0.8) return en
      ? `A lighter week than last. That's okay — next one's a fresh shot.`
      : `Lättare vecka än förra. Det är okej — nästa är en ny chans.`
  }

  if (workDayCount > 0 && hit === workDayCount) return en
    ? pick([
        `You hit goal every working day so far. That's rare air, ${name}.`,
        'Clean sweep — goal hit every weekday this week.',
        `${hit} for ${workDayCount}. Immaculate.`,
      ])
    : pick([
        `Du har nått målet varje arbetsdag hittills. Sällsynt, ${name}.`,
        'Rent hus — mål varje vardag den här veckan.',
        `${hit} av ${workDayCount}. Felfritt.`,
      ])

  if (workDayCount >= 3 && hit === 0 && weekTotal > 0) return en
    ? pick([
        `Haven't hit goal yet this week. Plenty of week left.`,
        `Logging but not quite at 8h/day. Push one solid session.`,
      ])
    : pick([
        'Har inte nått målet den här veckan än. Gott om vecka kvar.',
        'Loggar men inte riktigt 8h/dag. Pressa in ett rejält pass.',
      ])

  if (weekTotal >= 20 && billRatio >= 0.85) return en
    ? pick([
        `${Math.round(billRatio * 100)}% billable — this is the healthy kind of week.`,
        `Mostly billable time this week. That's how invoices get fat.`,
      ])
    : pick([
        `${Math.round(billRatio * 100)}% fakturerbart — det är en hälsosam vecka.`,
        'Mest fakturerbar tid den här veckan. Så blir fakturor feta.',
      ])
  if (weekTotal >= 20 && billRatio < 0.4) return en
    ? pick([
        `Only ${Math.round(billRatio * 100)}% billable this week — lots of internal time.`,
        `Internal-heavy week. Remember to slot billable work in too.`,
      ])
    : pick([
        `Bara ${Math.round(billRatio * 100)}% fakturerbart den här veckan — mycket internt.`,
        'Intern-tung vecka. Kom ihåg att klämma in fakturerbart också.',
      ])

  if (topClientName && topClientShare != null && topClientShare >= 0.7) {
    return en
      ? `Heavy focus on ${topClientName} — ${Math.round(topClientShare * 100)}% of the week.`
      : `Mycket fokus på ${topClientName} — ${Math.round(topClientShare * 100)}% av veckan.`
  }

  if (bestDayName && bestDayHours && bestDayHours >= weeklyGoal / 5) {
    return en
      ? pick([
          `${bestDayName} carried this week with your strongest session.`,
          `Your ${bestDayName} set the tone — keep that energy.`,
        ])
      : pick([
          `${bestDayName} bar upp veckan med ditt starkaste pass.`,
          `Din ${bestDayName} satte tonen — behåll den energin.`,
        ])
  }

  const pct = weekTotal / weeklyGoal
  if (pct >= 1) return en
    ? pick([ `Weekly goal cleared, ${name}. Bonus territory.`, `Past 40h — the rest is gravy.` ])
    : pick([ `Veckomålet klart, ${name}. Bonusterritorium.`, `Över 40h — resten är bonus.` ])
  if (pct >= 0.75) return en
    ? pick([
        `${Math.round(pct * 100)}% of the way to the weekly goal. Coast it in.`,
        `Nearly at the weekly target. One good session left.`,
      ])
    : pick([
        `${Math.round(pct * 100)}% av vägen till veckomålet. Segla in.`,
        'Nästan framme vid veckomålet. Ett bra pass kvar.',
      ])
  if (pct >= 0.4) return en
    ? pick([
        `Halfway-ish to the weekly goal. Stay on rhythm.`,
        `You're pacing towards the weekly goal. Keep rolling.`,
      ])
    : pick([
        'Ungefär halvvägs till veckomålet. Håll rytmen.',
        'Du tempar dig mot veckomålet. Fortsätt rulla.',
      ])
  return en
    ? pick([
        `Warming up. Plenty of week to make up ground.`,
        `Early in the week — the best hours are still ahead.`,
      ])
    : pick([
        'Värmer upp. Gott om vecka kvar att ta igen.',
        'Tidigt i veckan — de bästa timmarna ligger framför dig.',
      ])
}

// ─── Monthly coach summary ────────────────────────────────────────────
export function monthInsight(ctx: {
  monthTotal: number
  prevMonthTotal: number | null
  hit: number
  workDayCount: number
  billable: number
  bestWeekLabel?: string
  bestWeekHours?: number
  topClientName?: string
  topClientShare?: number
  firstName?: string
  isFinished: boolean
  lang?: Lang
}): string {
  const {
    monthTotal, prevMonthTotal, hit, workDayCount, billable,
    bestWeekLabel, bestWeekHours, topClientName, topClientShare,
    firstName, isFinished,
  } = ctx
  const lang: Lang = ctx.lang || 'en'
  const en = lang === 'en'
  const name = firstName || (en ? 'you' : 'du')
  const billRatio = monthTotal > 0 ? billable / monthTotal : 0
  const hitPct = workDayCount > 0 ? hit / workDayCount : 0

  if (monthTotal === 0) return en
    ? pick([ 'Nothing logged this month yet — give it a start.', `Blank month, ${name}. Time to fill it in.` ])
    : pick([ 'Inget loggat den här månaden ännu — sätt igång.', `Tom månad, ${name}. Dags att fylla den.` ])

  if (isFinished && prevMonthTotal != null && prevMonthTotal > 0) {
    if (monthTotal >= prevMonthTotal * 1.1) return en
      ? `Beat last month by ${((monthTotal / prevMonthTotal - 1) * 100).toFixed(0)}%. Strong month.`
      : `Slog förra månaden med ${((monthTotal / prevMonthTotal - 1) * 100).toFixed(0)}%. Stark månad.`
    if (monthTotal <= prevMonthTotal * 0.8) return en
      ? `A lighter month than last. Reset for next one.`
      : `Lättare månad än förra. Nollställ inför nästa.`
  }

  if (isFinished && hitPct >= 0.85) return en
    ? pick([
        `You hit goal on ${hit} of ${workDayCount} workdays — almost perfect.`,
        `${hit}/${workDayCount} workdays at 8h+. That's the rhythm.`,
      ])
    : pick([
        `Du nådde målet ${hit} av ${workDayCount} arbetsdagar — nästan perfekt.`,
        `${hit}/${workDayCount} arbetsdagar på 8h+. Det är rytmen.`,
      ])
  if (!isFinished && hitPct >= 0.85) return en
    ? `${hit}/${workDayCount} workdays on target so far. On a roll, ${name}.`
    : `${hit}/${workDayCount} arbetsdagar på mål så här långt. Du är igång, ${name}.`

  if (workDayCount >= 10 && hitPct < 0.3) return en
    ? `Hit rate is low — ${hit}/${workDayCount} workdays at goal so far.`
    : `Träffprocenten är låg — ${hit}/${workDayCount} arbetsdagar på mål hittills.`

  if (monthTotal >= 80 && billRatio >= 0.85) return en
    ? `${Math.round(billRatio * 100)}% billable this month — invoice-ready.`
    : `${Math.round(billRatio * 100)}% fakturerbart den här månaden — klart för faktura.`
  if (monthTotal >= 80 && billRatio < 0.4) return en
    ? `Lots of internal time this month — only ${Math.round(billRatio * 100)}% billable.`
    : `Mycket intern tid den här månaden — bara ${Math.round(billRatio * 100)}% fakturerbart.`

  if (topClientName && topClientShare != null && topClientShare >= 0.7) return en
    ? `${topClientName} took ${Math.round(topClientShare * 100)}% of the month. Deep client focus.`
    : `${topClientName} tog ${Math.round(topClientShare * 100)}% av månaden. Djupt kundfokus.`

  if (bestWeekLabel && bestWeekHours && bestWeekHours >= 30) return en
    ? `${bestWeekLabel} was your standout week at ${bestWeekHours.toFixed(0)}h.`
    : `${bestWeekLabel} var din toppvecka med ${bestWeekHours.toFixed(0)}h.`

  return en
    ? pick([
        `Steady month so far, ${name}. Keep the rhythm.`,
        'Month in motion — small consistent days compound fast.',
        `${Math.round(monthTotal)}h on the board. Keep going.`,
      ])
    : pick([
        `Stadig månad så här långt, ${name}. Håll rytmen.`,
        'Månad i rörelse — små konsekventa dagar ackumuleras snabbt.',
        `${Math.round(monthTotal)}h på tavlan. Kör på.`,
      ])
}
