export type ApiErrorKind =
  | "offline"
  | "timeout"
  | "auth"
  | "server"
  | "notFound"
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  constructor(kind: ApiErrorKind, message?: string) {
    super(message ?? kind);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export function classifyApiError(err: unknown): ApiErrorKind {
  if (err instanceof ApiError) return err.kind;
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
  if (e.startsWith("NET::") || e.includes("ERR_")) return "offline";
  if (e.startsWith("HTTP_404")) return "notFound";
  if (/^HTTP_5\d\d/.test(e)) return "server";
  if (e.startsWith("HTTP_")) return "server";
  return "unknown";
}

export function apiErrorKey(kind: ApiErrorKind): string {
  return `error.api.${kind}`;
}
