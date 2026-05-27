import { describe, it, expect } from "vitest";
import { classifyApiError, apiErrorKey } from "./apiError";

describe("classifyApiError", () => {
  it("maps not_authenticated to auth", () => {
    expect(classifyApiError(new Error("NOT_AUTHENTICATED"))).toBe("auth");
    expect(classifyApiError("not_authenticated")).toBe("auth");
  });

  it("maps timeout", () => {
    expect(classifyApiError("timeout")).toBe("timeout");
  });

  it("maps chromium network errors to offline", () => {
    expect(classifyApiError("net::ERR_INTERNET_DISCONNECTED")).toBe("offline");
    expect(classifyApiError("net::ERR_CONNECTION_REFUSED")).toBe("offline");
    expect(classifyApiError("net::ERR_NAME_NOT_RESOLVED")).toBe("offline");
  });

  it("maps http 5xx to server and 404 to notFound", () => {
    expect(classifyApiError("http_500: Internal")).toBe("server");
    expect(classifyApiError("http_503")).toBe("server");
    expect(classifyApiError("http_404")).toBe("notFound");
    expect(classifyApiError("http_403")).toBe("server");
  });

  it("falls back to unknown", () => {
    expect(classifyApiError("")).toBe("unknown");
    expect(classifyApiError(null)).toBe("unknown");
    expect(classifyApiError(undefined)).toBe("unknown");
    expect(classifyApiError("invalid_params")).toBe("unknown");
    expect(classifyApiError({ weird: true })).toBe("unknown");
  });

  it("builds the i18n key", () => {
    expect(apiErrorKey("offline")).toBe("error.api.offline");
    expect(apiErrorKey("auth")).toBe("error.api.auth");
  });
});
