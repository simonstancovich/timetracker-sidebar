// Maps the raw error strings the main process / api.ts surface (net::ERR_*,
// timeout, http_NNN, not_authenticated) into a small set of scenarios so the UI
// can show a clear, human message instead of a leaked technical string.

export type ApiErrorKind =
  | "offline"
  | "timeout"
  | "auth"
  | "server"
  | "notFound"
  | "unknown";

export function classifyApiError(err: unknown): ApiErrorKind {
  const raw =
    typeof err === "string"
      ? err
      : err instanceof Error
        ? err.message
        : "";
  const e = raw.trim().toUpperCase();
  if (!e) return "unknown";
  if (e === "NOT_AUTHENTICATED") return "auth";
  if (e === "TIMEOUT") return "timeout";
  // Chromium network errors (refused / disconnected / DNS) — can't reach server.
  if (e.startsWith("NET::") || e.includes("ERR_")) return "offline";
  if (e.startsWith("HTTP_404")) return "notFound";
  if (/^HTTP_5\d\d/.test(e)) return "server";
  if (e.startsWith("HTTP_")) return "server";
  return "unknown";
}

// i18n key for the human-readable message of a classified error.
export function apiErrorKey(kind: ApiErrorKind): string {
  return `error.api.${kind}`;
}
