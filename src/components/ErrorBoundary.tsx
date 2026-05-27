import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

// Catches render-time crashes so a single bad render can't white-screen the
// whole app. Styles are intentionally self-contained (no theme/vars) because
// the thing that crashed might be the theme. The running timer is persisted
// locally, so a reload doesn't lose tracked time.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  private stack = "";

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
     
    console.error("[render-crash]", error, info?.componentStack);
    this.stack = info?.componentStack || "";
  }

  private copyDetails = () => {
    const e = this.state.error;
    const text = `${e?.name}: ${e?.message}\n${e?.stack || ""}\n${this.stack}`;
    void navigator.clipboard?.writeText(text);
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 24,
          textAlign: "center",
          background: "#0b0910",
          color: "#faf8ff",
          fontFamily:
            "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
        }}
      >
        <div style={{ fontSize: 30 }}>⚠️</div>
        <div
          style={{
            fontFamily: '"Instrument Serif","Georgia",serif',
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.2,
          }}
        >
          Something broke
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#d0c9e8",
            maxWidth: 300,
            lineHeight: 1.5,
          }}
        >
          The app hit an unexpected error. Your tracked time is saved locally —
          reloading is safe.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              background: "#c96442",
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          <button
            type="button"
            onClick={this.copyDetails}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              background: "transparent",
              color: "#d0c9e8",
              border: "1px solid rgba(166,146,214,0.3)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Copy details
          </button>
        </div>
      </div>
    );
  }
}
