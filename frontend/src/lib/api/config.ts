/**
 * Backend wiring.
 *
 * `VITE_API_BASE_URL` points at the Django service, e.g.
 *   VITE_API_BASE_URL=http://localhost:8000/api
 *
 * With no base URL configured the app falls back to the in-memory mock adapter
 * so the UI is fully clickable before the backend exists. Set
 * `VITE_USE_MOCK_API=false` to force real requests.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ""

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "")

const mockFlag = import.meta.env.VITE_USE_MOCK_API?.trim().toLowerCase()

export const USE_MOCK_API =
  mockFlag === "true" ? true : mockFlag === "false" ? false : !API_BASE_URL

/** Django session auth needs the cookie; token auth does not. */
export const WITH_CREDENTIALS =
  (import.meta.env.VITE_API_WITH_CREDENTIALS?.trim().toLowerCase() ?? "true") !==
  "false"

/** Name of Django's CSRF cookie (settings.CSRF_COOKIE_NAME). */
export const CSRF_COOKIE_NAME =
  import.meta.env.VITE_CSRF_COOKIE_NAME?.trim() || "csrftoken"

/** Header Django expects the CSRF token on (settings.CSRF_HEADER_NAME). */
export const CSRF_HEADER_NAME =
  import.meta.env.VITE_CSRF_HEADER_NAME?.trim() || "X-CSRFToken"

/**
 * Optional bearer/token auth. Supply a getter instead of a literal so the token
 * can come from wherever the host app keeps it.
 */
let authTokenGetter: (() => string | null) | null = null

export function setAuthTokenGetter(getter: (() => string | null) | null) {
  authTokenGetter = getter
}

export function getAuthToken(): string | null {
  return authTokenGetter?.() ?? null
}

/** DRF's TokenAuthentication uses "Token <key>"; JWT setups use "Bearer". */
export const AUTH_SCHEME =
  import.meta.env.VITE_AUTH_SCHEME?.trim() || "Token"
