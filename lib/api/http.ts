/**
 * Thin fetch wrapper for the Django REST API.
 *
 * Auth is Django's session cookie: requests are sent with credentials, and
 * unsafe methods carry the CSRF token from the `csrftoken` cookie in the
 * `X-CSRFToken` header. For a cross-origin backend, Django needs
 * `CORS_ALLOW_CREDENTIALS = True`, this origin in `CORS_ALLOWED_ORIGINS`, and
 * this origin in `CSRF_TRUSTED_ORIGINS`.
 */

/** Base URL of the Django API, e.g. https://api.example.com/api */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "")

/** False when no backend is configured — the UI then runs against in-memory data. */
export const isApiConfigured = API_BASE_URL.length > 0

export class ApiError extends Error {
  readonly status: number
  /** DRF field errors, e.g. { name: ["This field is required."] } */
  readonly fieldErrors: Record<string, string[]>

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[2]) : null
}

function messageFromBody(body: unknown, status: number): [string, Record<string, string[]>] {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>
    const detail = record.detail
    if (typeof detail === "string") return [detail, {}]

    const fieldErrors: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(record)) {
      if (Array.isArray(value)) fieldErrors[key] = value.map(String)
      else if (typeof value === "string") fieldErrors[key] = [value]
    }
    const first = Object.entries(fieldErrors)[0]
    if (first) return [first[0] + ": " + first[1][0], fieldErrors]
  }
  return ["Request failed (" + status + ")", {}]
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not set", 0)
  }

  const { json, headers, ...rest } = init
  const method = (rest.method ?? "GET").toUpperCase()
  const requestHeaders = new Headers(headers)
  requestHeaders.set("Accept", "application/json")

  if (json !== undefined) requestHeaders.set("Content-Type", "application/json")

  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    const csrfToken = readCookie("csrftoken")
    if (csrfToken) requestHeaders.set("X-CSRFToken", csrfToken)
  }

  let response: Response
  try {
    response = await fetch(API_BASE_URL + path, {
      ...rest,
      method,
      headers: requestHeaders,
      credentials: "include",
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    })
  } catch {
    throw new ApiError("Could not reach the API at " + API_BASE_URL, 0)
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  const body = text ? safeParse(text) : null

  if (!response.ok) {
    const [message, fieldErrors] = messageFromBody(body, response.status)
    throw new ApiError(message, response.status, fieldErrors)
  }

  return body as T
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** Unwraps DRF's paginated envelope when pagination is enabled. */
export function unwrapList<T>(body: T[] | { results: T[] }): T[] {
  return Array.isArray(body) ? body : (body?.results ?? [])
}
