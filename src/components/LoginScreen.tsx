interface Props {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8f7ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
        color: '#1e1b4b',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: '#7c3aed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          color: '#fff',
          boxShadow: '0 6px 20px rgba(124,58,237,.4)',
          marginBottom: 22,
        }}
      >
        ⏱
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
        DevCore TimeTracker
      </h1>
      <p style={{ fontSize: 13, color: '#5b56a0', textAlign: 'center', maxWidth: 280, marginBottom: 22 }}>
        Sign in with your DevCore account to start tracking time.
      </p>
      <button
        onClick={onLogin}
        style={{
          padding: '12px 28px',
          background: '#7c3aed',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(124,58,237,.35)',
        }}
      >
        Sign in
      </button>
    </div>
  )
}
