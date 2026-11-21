export class ApiError extends Error {
  status: number
  code: string
  fields: Record<string, string>

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export interface ApiResult<T> {
  status: number
  data: T
}

function xsrfToken(): string | undefined {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("XSRF-TOKEN="))
    ?.slice("XSRF-TOKEN=".length)
}

async function send<T>(method: string, path: string, body?: unknown, retried = false): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" }
  if (body !== undefined) headers["Content-Type"] = "application/json"
  const token = xsrfToken()
  if (token) headers["X-XSRF-TOKEN"] = decodeURIComponent(token)

  let res: Response
  try {
    res = await fetch(path, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "NETWORK", "Cannot reach the server. Check your connection and try again.")
  }

  const text = await res.text()
  const json = text ? safeParse(text) : null

  // The CSRF cookie is created by the first GET. If a POST raced ahead of it, fetch one and retry once.
  if (res.status === 403 && !token && !retried && method !== "GET") {
    await fetch("/api/auth/me", { credentials: "same-origin" })
    return send<T>(method, path, body, true)
  }

  if (!res.ok) {
    const err = (json ?? {}) as { code?: string; message?: string; fields?: Record<string, string> }
    throw new ApiError(res.status, err.code ?? "ERROR", err.message ?? "Something went wrong. Try again.", err.fields ?? {})
  }
  return { status: res.status, data: json as T }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const api = {
  get: <T>(path: string) => send<T>("GET", path),
  post: <T>(path: string, body?: unknown) => send<T>("POST", path, body ?? {}),
  patch: <T>(path: string, body: unknown) => send<T>("PATCH", path, body),
  delete: <T>(path: string) => send<T>("DELETE", path),
}
