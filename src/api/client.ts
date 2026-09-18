/**
 * The fetch wrapper, written for Django specifically.
 *
 * Three things it does that a bare fetch does not:
 *  - sends the session cookie (`credentials: 'include'`), because Django's
 *    SessionAuthentication is cookie-based and cross-origin fetch drops cookies
 *    unless asked;
 *  - reads the CSRF token out of the `csrftoken` cookie and sends it back as
 *    `X-CSRFToken` on anything that is not a safe method, which Django rejects
 *    the request without;
 *  - turns a DRF error body into something catchable, keeping the field errors
 *    rather than flattening them to a status code.
 */

export const API_BASE: string = import.meta.env.VITE_API_URL ?? '/api';

/** A non-2xx response, with DRF's body kept intact. */
export class ApiError extends Error {
  readonly status: number;
  /** DRF returns `{ field: ["message"] }` on a 400, or `{ detail: "..." }` */
  readonly body: unknown;

  constructor(status: number, body: unknown, url: string) {
    super(`${status} from ${url}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /** Field errors from a 400, flattened to `field: message` for a form to show. */
  fieldErrors(): Record<string, string> {
    if (!this.body || typeof this.body !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.body as Record<string, unknown>)) {
      out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return out;
  }
}

function csrfToken(): string {
  const hit = document.cookie.split('; ').find((c) => c.startsWith('csrftoken='));
  return hit ? decodeURIComponent(hit.slice('csrftoken='.length)) : '';
}

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

export interface RequestOptions {
  method?: string;
  /** serialised as JSON; omit for GET */
  body?: unknown;
  /** appended as a query string, skipping undefined values */
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, signal } = options;
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!SAFE.has(method)) headers['X-CSRFToken'] = csrfToken();

  const res = await fetch(url.toString(), {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const parsed = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, parsed, url.pathname);
  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // an HTML error page from a proxy, or Django's debug traceback
    return text;
  }
}

/**
 * Walks DRF's pagination to the end.
 *
 * The schedule wants a whole day or week at once rather than a page of it, and
 * the counts here are small — a busy week is a few hundred rows. Anything that
 * could run long should take a filtered query instead of paging blindly.
 */
export async function requestAll<T>(path: string, options: RequestOptions = {}): Promise<T[]> {
  const first = await request<{ results?: T[]; next?: string | null } | T[]>(path, options);
  if (Array.isArray(first)) return first;

  const out = [...(first.results ?? [])];
  let next = first.next ?? null;
  while (next) {
    const page = await request<{ results?: T[]; next?: string | null }>(
      next.replace(API_BASE, '').replace(window.location.origin, ''),
      { signal: options.signal },
    );
    out.push(...(page.results ?? []));
    next = page.next ?? null;
  }
  return out;
}
