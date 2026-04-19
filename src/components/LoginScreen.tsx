import { t as tr, type Lang } from '../lib/i18n'

interface Theme {
  id: string
  bg: string
  t1: string
  t3: string
  ac: string
  btn: string
  bsh: string
}

interface Props {
  onLogin: () => void
  lang?: Lang
  M: Theme
}

export function LoginScreen({ onLogin, lang = 'en', M }: Props) {
  const t = (k: Parameters<typeof tr>[0], v?: Parameters<typeof tr>[2]) => tr(k, lang, v)
  return (
    <div
      style={{
        minHeight: '100vh',
        background: M.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
        color: M.t1,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: M.ac,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          color: '#fff',
          boxShadow: M.bsh,
          marginBottom: 22,
        }}
      >
        ⏱
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
        DevCore TimeTracker
      </h1>
      <p style={{ fontSize: 13, color: M.t3, textAlign: 'center', maxWidth: 280, marginBottom: 22 }}>
        {t('login.pitch')}
      </p>
      <button
        onClick={onLogin}
        style={{
          padding: '12px 28px',
          background: M.btn,
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: M.bsh,
        }}
      >
        {t('login.signIn')}
      </button>
    </div>
  )
}
