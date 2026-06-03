import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import { StopwatchIcon } from "../icons/StopwatchIcon";
import * as s from "./LoginScreen.css";

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

  const onEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") submit();
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

      <prim.Stack className={s.form}>
        <prim.TextInput
          fullWidth
          invalid={!!error}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={onEnter}
          placeholder={t("login.username")}
          autoFocus
          autoComplete="username"
          aria-label={t("login.username")}
        />
        <prim.TextInput
          fullWidth
          invalid={!!error}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onEnter}
          placeholder={t("login.password")}
          autoComplete="current-password"
          aria-label={t("login.password")}
        />
        {error && (
          <prim.Text as="span" size="base" color="error" align="center">
            {error}
          </prim.Text>
        )}
        <prim.Button
          variant="primary"
          shape="pill"
          onClick={submit}
          disabled={!canSubmit}
          className={s.signInBtn}
        >
          {busy ? t("login.signingIn") : t("login.signIn")}
        </prim.Button>
        <prim.Button
          variant="link"
          onClick={onOpenBrowser}
          className={s.fallbackBtn}
        >
          {t("login.browserFallback")}
        </prim.Button>
      </prim.Stack>
    </prim.Stack>
  );
}
