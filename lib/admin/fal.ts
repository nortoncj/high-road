import "server-only";

/**
 * fal's queue API over plain fetch: submit, check, fetch the result, cancel. No SDK needed.
 * FAL_KEY stays on the server; the browser never sees it.
 */

const QUEUE = "https://queue.fal.run";

export const falReady = () => Boolean(process.env.FAL_KEY);

function headers(): Record<string, string> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY isn't set.");
  return { authorization: `Key ${key}`, "content-type": "application/json", accept: "application/json" };
}

/** fal's validation errors come back as { detail: [{ loc, msg }] }. Turn them into one readable line. */
export function falError(status: number, body: unknown): string {
  const d = (body as { detail?: unknown })?.detail;
  if (Array.isArray(d)) {
    const first = d[0] as { loc?: unknown[]; msg?: string } | undefined;
    if (first?.msg) return `fal rejected the request: ${first.loc?.slice(-1)[0] ?? "input"}: ${first.msg}`;
  }
  if (typeof d === "string") return `fal: ${d}`;
  if (status === 401 || status === 403) return "fal turned down the key. Check FAL_KEY.";
  if (status === 402) return "fal says the account is out of credit. Top up at fal.ai/dashboard/billing.";
  if (status === 429) return "fal is rate limiting. Wait a minute and try again.";
  return `fal returned ${status}.`;
}

export type Submitted = { requestId: string; statusUrl: string; responseUrl: string };

export async function falSubmit(endpoint: string, input: Record<string, unknown>): Promise<Submitted> {
  const res = await fetch(`${QUEUE}/${endpoint}`, {
    method: "POST",
    headers: {
      ...headers(),
      // We copy every output into your own bucket, so fal can delete its copy after 3 days.
      "X-Fal-Object-Lifecycle-Preference": JSON.stringify({ expiration_duration_seconds: 259_200 }),
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(30_000),
  });
  const body = (await res.json().catch(() => null)) as { request_id?: string; status_url?: string; response_url?: string } | null;
  if (!res.ok || !body?.request_id) throw new Error(falError(res.status, body));
  const base = `${QUEUE}/${endpoint.split("/").slice(0, 2).join("/")}/requests/${body.request_id}`;
  return { requestId: body.request_id, statusUrl: body.status_url ?? `${base}/status`, responseUrl: body.response_url ?? base };
}

export type FalStatus = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "UNKNOWN";

export async function falStatus(statusUrl: string): Promise<FalStatus> {
  const res = await fetch(statusUrl, { headers: headers(), signal: AbortSignal.timeout(15_000), cache: "no-store" });
  if (!res.ok) return "UNKNOWN";
  const body = (await res.json().catch(() => null)) as { status?: string } | null;
  const s = body?.status;
  return s === "IN_QUEUE" || s === "IN_PROGRESS" || s === "COMPLETED" ? s : "UNKNOWN";
}

export async function falResult(responseUrl: string): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  const res = await fetch(responseUrl, { headers: headers(), signal: AbortSignal.timeout(30_000), cache: "no-store" });
  const body = await res.json().catch(() => null);
  return res.ok ? { ok: true, data: body } : { ok: false, error: falError(res.status, body) };
}

export async function falCancel(statusUrl: string): Promise<void> {
  await fetch(statusUrl.replace(/\/status$/, "/cancel"), { method: "PUT", headers: headers(), signal: AbortSignal.timeout(15_000) }).catch(() => undefined);
}

export type FalFile = { url: string; contentType: string | null; width: number | null; height: number | null };

/** Every file in a result, whatever shape the model returns: images[], image, video, videos[]. */
export function filesFrom(data: unknown): FalFile[] {
  const d = (data ?? {}) as Record<string, unknown>;
  const pick = (v: unknown): FalFile | null => {
    const o = v as { url?: unknown; content_type?: unknown; width?: unknown; height?: unknown } | null;
    if (!o || typeof o.url !== "string" || !/^https:\/\//.test(o.url)) return null;
    return {
      url: o.url,
      contentType: typeof o.content_type === "string" ? o.content_type : null,
      width: typeof o.width === "number" ? o.width : null,
      height: typeof o.height === "number" ? o.height : null,
    };
  };
  const list = [...(Array.isArray(d.images) ? d.images : []), d.image, d.video, ...(Array.isArray(d.videos) ? d.videos : [])];
  return list.map(pick).filter((x): x is FalFile => x !== null);
}
