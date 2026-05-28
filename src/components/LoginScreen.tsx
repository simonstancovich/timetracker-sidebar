import { useState, type CSSProperties } from "react";
import { vars } from "../theme";
import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import { StopwatchIcon } from "../icons/StopwatchIcon";

interface Props {
  onAuthed: () => void;
  onOpenBrowser: () => void;
}

export function LoginScreen({ onAuthed, onOpenBrowser }: Props) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const res = await window.electronAPI.login({
        username: username.trim(),
        password,
      });
      if (res.success) {
        onAuthed();
        return;
      }
      setError(
        res.error === "invalid_credentials"
          ? t("login.badCreds")
          : t("login.failed"),
      );
    } catch {
      setError(t("login.failed"));
    }
    setBusy(false);
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: vars.background.surface,
    border: `1px solid ${error ? vars.typography.error : vars.border.soft}`,
    borderRadius: 10,
    color: vars.typography.primary,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <prim.Stack align="center" justify="center" gap="lg" padding="xl" fullHeight>
      <prim.IconTile size="xl">
        <StopwatchIcon />
      </prim.IconTile>
      <prim.Stack align="center" gap="xs">
        <prim.Heading level={1}>DevCore TimeTracker</prim.Heading>
        <prim.Text color="tertiary" align="center" maxWidth="prose">
          {t("login.pitch")}
        </prim.Text>
      </prim.Stack>

      <div
        style={{
          width: "100%",
          maxWidth: 300,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("login.username")}
          autoFocus
          autoComplete="username"
          aria-label={t("login.username")}
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("login.password")}
          autoComplete="current-password"
          aria-label={t("login.password")}
          style={inputStyle}
        />
        {error && (
          <span style={{ color: vars.typography.error, fontSize: 12, textAlign: "center" }}>
            {error}
          </span>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 999,
            background: canSubmit ? vars.background.button : vars.background.raised,
            color: canSubmit ? vars.typography.onAccent : vars.typography.faint,
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            boxShadow: canSubmit ? vars.shadow.button : "none",
          }}
        >
          {busy ? t("login.signingIn") : t("login.signIn")}
        </button>
        <button
          type="button"
          onClick={onOpenBrowser}
          style={{
            background: "transparent",
            border: "none",
            color: vars.typography.tertiary,
            fontSize: 12,
            cursor: "pointer",
            textDecoration: "underline",
            marginTop: 2,
          }}
        >
          {t("login.browserFallback")}
        </button>
      </div>
    </prim.Stack>
  );
}
