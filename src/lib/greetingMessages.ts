// Personalized daily greetings. Each entry uses {name} placeholder.
// Keep them short, warm, and occasionally unhinged.

export const GREETING_MESSAGES: string[] = [
  // Motivational
  "Let's make it a good one, {name}.",
  "{name}, you've got this.",
  "Another day, another chance to crush it, {name}.",
  "Rise and grind, {name}.",
  "{name}, ready to log some legendary hours?",
  "Focus mode: on. You ready, {name}?",
  "Your future self is watching, {name}. Make them proud.",
  "Small wins today, {name}. Keep stacking.",
  "{name}, momentum beats motivation. Start moving.",
  "Coffee's strong. So are you, {name}.",
  "{name}, deep work waits for no one.",
  "Today's the day, {name}. Or at least an above-average one.",
  "Quiet grind, big results. Let's go, {name}.",
  "{name}, one focused hour > four scattered ones.",
  "Make it boring and consistent, {name}.",
  "{name}, show up. The rest will follow.",
  "Discipline's cheaper than regret, {name}.",
  "{name}, the only bad hour is the unlogged one.",
  "Chip away at it, {name}. That's the whole trick.",
  "Done is a feature, {name}. Ship it.",

  // Playful / silly
  "Hello there, {name}. General Kenobi energy today?",
  "{name}, it's time to look busy AND be busy.",
  "Welcome back, {name}. The timer missed you.",
  "{name}, hope your backlog is as long as your patience.",
  "Greetings, {name}. Productivity requested.",
  "{name}, let's pretend we know what we're doing.",
  "{name}, Slack can wait. The timer cannot.",
  "Let's tame the inbox beast, {name}.",
  "{name}, you're 80% water and 20% unfulfilled todos.",
  "Roll initiative, {name}. Today rolls a 20.",
  "{name}, did you remember to save? Me neither.",
  "Hey {name}. Fun fact: time is still linear.",
  "{name}, there's no cheat code. Just hours.",
  "Power up, {name}. Tasks don't task themselves.",
  "{name}, your chair awaits its victim.",
  "{name}, turn pro-crash-tination into progress.",
  "Hello {name}. Please log time or the dashboard cries.",
  "{name}, channel your inner caffeine.",
  "{name}, this app is just peer pressure in disguise. Ready?",
  "Today's task: don't be boring. You in, {name}?",

  // Morning-specific
  "Good morning, {name}. Let's write some history today.",
  "Morning, {name}. The day's a blank canvas.",
  "{name}, first light, first focus hour. Go.",
  "Wake up, {name}. There's glory to log.",
  "{name}, the early timer catches the XP.",
  "Morning coffee: check. Morning commit: next, {name}.",
  "{name}, 8 hours don't fill themselves.",
  "Good morning, {name}. Stretch first, then ship.",
  "{name}, birds are singing. Clients are waiting.",
  "Rise, {name}. The JIRA board stirs.",
  "Morning, {name}. Let's make yesterday jealous.",
  "New day, clean slate, same {name}.",

  // Late morning / midday
  "Noon check-in, {name}. How are those hours looking?",
  "{name}, lunch is earned, not given. Log first.",
  "Halfway there, {name}. Second half's free real estate.",
  "{name}, the afternoon slump is a myth. Mostly.",
  "Midday hustle, {name}. You're doing fine.",
  "Hey {name}. Small reminder: you're allowed to take breaks.",

  // Evening / late
  "Good evening, {name}. Nearly there.",
  "{name}, wrapping up or just getting started?",
  "Evening mode, {name}. Finish what future-you needs.",
  "{name}, don't let the day sneak away.",
  "One more entry, {name}. Then call it.",
  "{name}, log it before you forget it.",
  "Night owl hours, {name}? Respect.",
  "{name}, the last hour of the day is sacred.",
  "Evening check, {name}. How'd we do?",

  // Streak / goal nudges
  "{name}, streak game strong today?",
  "Don't break the chain, {name}.",
  "{name}, 8 hours. You know the drill.",
  "Close the rings, {name}. Uh, close the hours.",
  "{name}, the goal is right there. Take it.",
  "{name}, one good week compounds into a good year.",
  "{name}, you vs. yesterday. That's the only scoreboard.",

  // Dev-themed
  "{name}, compile your will and commit your time.",
  "Rubber duck says: 'get to it, {name}.'",
  "{name}, Ctrl+S your focus.",
  "Refactor your day, {name}.",
  "{name}, may your tests be green and your hours be billed.",
  "{name}, deploy yourself to production.",
  "Debug the morning, {name}.",
  "{name}, no bugs today — only features.",
  "Commit often, {name}. Hours too.",
  "{name}, your IDE is warm. You're warmer.",
  "{name}, stand-up in 10. Or just stand up.",
  "{name}, log time like you log commits.",
  "{name}, the merge conflict is life. Resolve it.",

  // Absurd / philosophical
  "{name}, time is an illusion. The timer is not.",
  "{name}, every second logged is a second earned.",
  "{name}, you are the CEO of your own hours.",
  "Heavy is the head that wears the hoodie, {name}.",
  "{name}, we are all just meat logging time.",
  "{name}, in the vast universe, your hours matter. Apparently.",
  "{name}, the clock moves. So should you.",
  "{name}, today is a sample from a long dataset. Make it count.",

  // Friday / weekend
  "{name}, it's Friday somewhere. Maybe here.",
  "{name}, the weekend is coming. Earn it.",
  "Last push before the weekend, {name}.",
  "{name}, let Friday-you be proud of Monday-you.",

  // Encouragement after struggle
  "{name}, even a slow start still counts.",
  "{name}, one hour at a time. Literally.",
  "Bad day? Okay day? Either way, log it, {name}.",
  "{name}, you don't have to feel great to do great.",
  "{name}, showing up IS the work.",
  "{name}, rest is productive too. Sometimes.",
  "Take the W, {name}. Any size.",
  "{name}, progress isn't always pretty.",
  "{name}, one honest hour beats four fake ones.",

  // Celebratory / fun facts
  "{name}, did you know you've been alive for like a lot of hours?",
  "{name}, fun fact: logging time hasn't killed anyone. Yet.",
  "{name}, your XP is watching. Make it proud.",
  "{name}, achievements don't unlock themselves.",
  "{name}, one timer started = one vote for disciplined-you.",

  // Low-key / gentle
  "Easy does it, {name}.",
  "{name}, breathe. Then log.",
  "{name}, gentle start, good finish.",
  "No pressure, {name}. Just progress.",
  "{name}, the bar is on the floor. Just step over it.",
  "{name}, nothing fancy today. Just real work.",
  "{name}, slow is smooth. Smooth is fast.",
  "{name}, whatever you get done is enough.",

  // Snarky / real talk
  "{name}, emails aren't work. Let's do actual work.",
  "{name}, 'busy' is a choice. So is 'done'.",
  "{name}, deep work > shallow meetings.",
  "{name}, put your phone down. The timer's up here.",
  "{name}, nobody cares about your perfect system. Just log.",
  "{name}, the gym has nothing on tracked billable hours.",
  "{name}, ctrl+alt+delete your excuses.",
  "{name}, less tabs, more tracked time.",
  "{name}, fewer todos, more todones.",

  // Curious / wholesome
  "{name}, hope the coffee's right.",
  "{name}, may your focus be strong and your meetings few.",
  "{name}, what's one thing you'll be proud of by 5pm?",
  "{name}, pick the hard thing first.",
  "{name}, one deep breath, one open tab. Go.",
  "Good to see you, {name}.",
  "{name}, glad you're here.",
  "{name}, let's log something that matters today.",
  "{name}, a calm mind writes better code.",
  "{name}, stay curious. Log accurately.",

  // Weather-neutral
  "{name}, whatever the weather, the timer is on.",
  "{name}, it's always a good day to log time. Technically.",
  "{name}, rain or shine — tasks keep coming.",
  "{name}, hour one awaits.",
  "{name}, got 60 minutes? That's all we need.",

  // Reminders
  "{name}, 25 minutes. That's a pomodoro. That's a win.",
  "{name}, write what you did. Your past-self forgets fast.",
  "{name}, finish before you start the next thing.",
  "{name}, close some tabs. Breathe. Log.",
  "{name}, every Friday-you wishes Monday-you logged more.",

  // Self-deprecating humor
  "{name}, we're all faking it. You're faking it well.",
  "{name}, the trick is just showing up and not dying.",
  "{name}, progress is slow on purpose. Allegedly.",
  "{name}, if in doubt, log the doubt too.",
  "{name}, dread is just unfinished timers.",

  // Short & punchy
  "Let's go, {name}.",
  "Ready, {name}?",
  "You in, {name}?",
  "Go time, {name}.",
  "{name}, clock in.",
  "{name}, round one.",
  "{name}, show time.",
  "{name}, fire up.",
  "{name}, new day, same goal.",
  "{name}, get it.",

  // Observations
  "{name}, hours are the new cardio.",
  "{name}, the invoice waits. So does your lunch.",
  "{name}, you are your only competition.",
  "{name}, effort compounds. Apathy does too.",
  "{name}, most magic is just showing up daily.",
  "{name}, good work is just bad work iterated on.",

  // Encourage breaks
  "{name}, go drink water. Then log.",
  "{name}, stretch. Your back is a client too.",
  "{name}, 20-20-20 rule: every 20 min, look 20 ft away for 20 sec.",
  "{name}, take the break before you need it.",
  "{name}, walking is debugging.",

  // Light absurdity
  "{name}, today's theme: 'accidentally crush it.'",
  "{name}, the spreadsheet fears you.",
  "{name}, your todo list is basically fan fiction.",
  "{name}, energy drinks aren't a personality. But they help.",
  "{name}, the office plant believes in you.",
  "{name}, your mouse is ready. Are you?",
  "{name}, conquer the inbox. Leave no email unslain.",
  "{name}, one more standup and you're a monk.",
  "{name}, even your browser tabs deserve closure.",

  // Kind
  "{name}, you're doing better than you think.",
  "{name}, it doesn't have to be perfect.",
  "{name}, proud of you for opening this app.",
  "{name}, small steps still count as steps.",
  "{name}, rough day? Log anyway. You'll thank you.",
  "{name}, one imperfect hour > zero perfect ones.",
]

export function pickGreeting(name: string): string {
  const msg = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)]
  return msg.replace('{name}', name || 'friend')
}
