export type ApiErrorBody = { error?: string; detail?: string };

export type PostJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; detail?: string };

/** POST JSON and parse the response safely (handles Vercel plain-text error pages). */
export async function postJson<T>(url: string, body: unknown): Promise<PostJsonResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: 'Network error',
      detail: e instanceof Error ? e.message : String(e),
    };
  }

  const text = await res.text();
  let data: unknown = null;

  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      const snippet = text.replace(/\s+/g, ' ').slice(0, 200);
      const timedOut = /an error occurred|function_invocation_timeout|504|gateway timeout/i.test(text);
      return {
        ok: false,
        status: res.status,
        error: timedOut ? 'Request timed out' : 'Server returned a non-JSON response',
        detail: timedOut
          ? 'The request took too long (often with very long transcripts). Try a shorter excerpt or run again.'
          : snippet || `HTTP ${res.status}`,
      };
    }
  }

  if (!res.ok) {
    const err = (data ?? {}) as ApiErrorBody;
    return {
      ok: false,
      status: res.status,
      error: err.error ?? `Request failed (${res.status})`,
      detail: err.detail,
    };
  }

  return { ok: true, data: data as T };
}
