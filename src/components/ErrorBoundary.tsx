import React from "react";
import * as prim from "../primitives";
import * as s from "./ErrorBoundary.css";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

// Catches render-time crashes so a single bad render can't white-screen the
// whole app. Styles in ErrorBoundary.css.ts are hardcoded literals (not theme
// vars) because the thing that crashed might be the theme. The running timer
// is persisted locally, so a reload doesn't lose tracked time.
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
      <prim.Stack align="center" justify="center" className={s.root}>
        <prim.Text as="span" className={s.icon}>⚠️</prim.Text>
        <prim.Text as="span" className={s.title}>Something broke</prim.Text>
        <prim.Text as="span" className={s.body}>
          The app hit an unexpected error. Your tracked time is saved locally — reloading is safe.
        </prim.Text>
        <prim.Stack direction="row" className={s.actionRow}>
          <prim.Button onClick={() => window.location.reload()} className={s.primaryBtn}>
            Reload
          </prim.Button>
          <prim.Button onClick={this.copyDetails} className={s.ghostBtn}>
            Copy details
          </prim.Button>
        </prim.Stack>
      </prim.Stack>
    );
  }
}
