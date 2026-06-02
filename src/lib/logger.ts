type Level = 'info' | 'warn' | 'error'

function format(level: Level, scope: string, msg: string, ctx?: unknown): string {
  const stamp = new Date().toISOString().slice(11, 23)
  const tag = `[${stamp}] [${level}] [${scope}]`
  if (ctx === undefined) return `${tag} ${msg}`
  let serialized: string
  try {
    serialized = typeof ctx === 'string' ? ctx : JSON.stringify(ctx)
  } catch {
    serialized = String(ctx)
  }
  return `${tag} ${msg} ${serialized}`
}

export function createLog(scope: string) {
  return {
    info: (msg: string, ctx?: unknown) => {
      console.info(format('info', scope, msg, ctx))
    },
    warn: (msg: string, ctx?: unknown) => {
      console.warn(format('warn', scope, msg, ctx))
    },
    error: (msg: string, ctx?: unknown) => {
      console.error(format('error', scope, msg, ctx))
    },
  }
}

export type Log = ReturnType<typeof createLog>
