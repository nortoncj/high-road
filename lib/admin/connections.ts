import "server-only";

/**
 * Live checks for Settings > Connections. Each one answers "is this actually working?",
 * not just "is there a key in the env". Every call has a short timeout, and nothing here throws.
 */

export type Level = "ok" | "warn" | "error" | "off";
export type Check = { level: Level; label: string; detail?: string };
export type Connection = { id: "calendly" | "brevo"; name: string; level: Level; summary: string; checks: Check[]; manageUrl: string };

const TIMEOUT = 6_000;
const order: Level[] = ["error", "warn", "off", "ok"];
export const worst = (checks: Check[]): Level => order.find((l) => checks.some((c) => c.level === l)) ?? "ok";

async function getJson(url: string, headers: Record<string, string>): Promise<{ status: number; body: any } | { status: 0; error: string }> {
  try {
    const res = await fetch(url, { headers: { accept: "application/json", ...headers }, signal: AbortSignal.timeout(TIMEOUT), cache: "no-store" });
    return { status: res.status, body: await res.json().catch(() => null) };
  } catch (e) {
    return { status: 0, error: e instanceof Error && e.name === "TimeoutError" ? "timed out" : "couldn't connect" };
  }
}

const ago = (iso: string | null, now = Date.now()) => {
  if (!iso) return null;
  const d = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
};

/* Brevo */

export async function checkBrevo(data: { lastReport: string | null; lastAlert: string | null }): Promise<Connection> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.REPORT_FROM_EMAIL?.toLowerCase();
  const checks: Check[] = [];
  const base = { id: "brevo" as const, name: "Brevo", manageUrl: "https://app.brevo.com/settings/keys/api" };

  if (!key) {
    checks.push({ level: "off", label: "No API key", detail: "Add BREVO_API_KEY to send reports, invites and lead alerts." });
  } else {
    const acct = await getJson("https://api.brevo.com/v3/account", { "api-key": key });
    if (acct.status === 200) {
      const plan = (acct.body?.plan ?? []).find((p: { type?: string }) => p.type !== "sms") as { type?: string; credits?: number } | undefined;
      const credits = typeof plan?.credits === "number" ? Math.floor(plan.credits) : null;
      checks.push({
        level: credits !== null && credits < 20 ? "warn" : "ok",
        label: `Connected as ${acct.body?.email ?? "your account"}`,
        detail: plan ? `${plan.type === "free" ? "Free plan" : plan.type === "payAsYouGo" ? "Pay as you go" : "Paid plan"}${credits !== null ? `, ${credits.toLocaleString("en-US")} sends left` : ""}` : undefined,
      });
    } else if (acct.status === 401 || acct.status === 403) {
      checks.push({ level: "error", label: "API key rejected", detail: "Brevo turned the key down. Make a new one and update BREVO_API_KEY." });
    } else {
      checks.push({ level: "warn", label: "Couldn't reach Brevo", detail: "error" in acct ? acct.error : `Brevo returned ${acct.status}.` });
    }

    if (!from) {
      checks.push({ level: "error", label: "No from address", detail: "Set REPORT_FROM_EMAIL to a sender you've verified in Brevo." });
    } else if (acct.status === 200) {
      const senders = await getJson("https://api.brevo.com/v3/senders", { "api-key": key });
      const match = senders.status === 200 ? (senders.body?.senders ?? []).find((s: { email?: string }) => s.email?.toLowerCase() === from) : undefined;
      if (senders.status !== 200) checks.push({ level: "warn", label: `Couldn't check ${from}`, detail: "The key may not have sender access." });
      else if (!match) checks.push({ level: "error", label: `${from} isn't a sender`, detail: "Add and verify it in Brevo > Senders, or emails get blocked." });
      else if (!match.active) checks.push({ level: "error", label: `${from} isn't verified yet`, detail: "Click the link Brevo emailed to that address." });
      else checks.push({ level: "ok", label: `Sending as ${from}` });
    }
  }

  checks.push({
    level: "ok",
    label: "Sign-in codes",
    detail: "Sent by Supabase through Brevo SMTP. You're signed in, so it works.",
  });
  const last = [data.lastAlert && `last lead alert ${ago(data.lastAlert)}`, data.lastReport && `last report ${ago(data.lastReport)}`].filter(Boolean);
  if (last.length) checks.push({ level: "ok", label: "Recent sends", detail: `${last.join(", ")}.`.replace(/^./, (c) => c.toUpperCase()) });

  const level = worst(checks);
  return { ...base, level, checks, summary: level === "ok" ? "Working" : level === "off" ? "Not connected" : level === "warn" ? "Check this" : "Broken" };
}

/* Calendly */

type Sub = { uri?: string; callback_url?: string; state?: string; events?: string[] };

export async function checkCalendly(data: { lastBooking: string | null; anyLeads: boolean }): Promise<Connection> {
  const token = process.env.CALENDLY_TOKEN;
  const checks: Check[] = [];
  const base = { id: "calendly" as const, name: "Calendly", manageUrl: "https://calendly.com/integrations/api_webhooks" };
  const auth = { authorization: `Bearer ${token}` };

  if (!token) {
    checks.push({ level: "off", label: "No API token", detail: "Add CALENDLY_TOKEN (Integrations > API & Webhooks) to check the webhook from here." });
  } else {
    const me = await getJson("https://api.calendly.com/users/me", auth);
    if (me.status === 200) {
      const r = me.body?.resource ?? {};
      checks.push({ level: "ok", label: `Connected as ${r.name ?? r.email ?? "you"}`, detail: r.scheduling_url ? String(r.scheduling_url).replace(/^https?:\/\//, "") : undefined });

      // A subscription can live at either scope, so look at both.
      const q = (scope: "user" | "organization") =>
        getJson(
          `https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(r.current_organization)}&scope=${scope}${scope === "user" ? `&user=${encodeURIComponent(r.uri)}` : ""}&count=50`,
          auth,
        );
      const [u, o] = await Promise.all([q("user"), q("organization")]);
      const blocked = [u, o].every((x) => x.status === 403);
      const all: Sub[] = [u, o].flatMap((x) => (x.status === 200 ? (x.body?.collection ?? []) : []));
      const subs = [...new Map(all.map((s) => [s.uri ?? `${s.callback_url}|${s.state}`, s])).values()];
      const booking = subs.filter((s) => (s.events ?? []).includes("invitee.created"));

      if (blocked) checks.push({ level: "warn", label: "Webhooks need a paid plan", detail: "Calendly only offers webhooks on paid plans. Without one, bookings can't reach your leads automatically." });
      else if (!booking.length) checks.push({ level: "error", label: "No booking webhook", detail: "Nothing tells your site when someone books. Bookings won't show up as leads." });
      for (const s of booking) {
        const host = s.callback_url ? s.callback_url.replace(/^https?:\/\//, "").split("?")[0] : "unknown URL";
        checks.push(
          s.state === "active"
            ? { level: "ok", label: "Booking webhook on", detail: host }
            : { level: "error", label: "Calendly turned the webhook off", detail: `${host}. It stops after your site fails too many times. Fix the endpoint, then re-create the webhook.` },
        );
      }
    } else if (me.status === 401) {
      checks.push({ level: "error", label: "Token rejected", detail: "Expired or revoked. Make a new personal access token and update CALENDLY_TOKEN." });
    } else {
      checks.push({ level: "warn", label: "Couldn't reach Calendly", detail: "error" in me ? me.error : `Calendly returned ${me.status}.` });
    }
  }

  // The check that catches what a green API light can't: are bookings actually arriving?
  if (data.lastBooking) {
    const days = Math.floor((Date.now() - new Date(data.lastBooking).getTime()) / 86_400_000);
    checks.push({
      level: days > 30 ? "warn" : "ok",
      label: `Last booking came in ${ago(data.lastBooking)}`,
      detail: days > 30 ? "A month is a long time. Either it's slow, or bookings stopped reaching your leads. Book a test call to find out." : undefined,
    });
  } else {
    checks.push({ level: data.anyLeads ? "warn" : "off", label: "No bookings in your leads yet", detail: "Book a test call on your own page. It should show up in Leads within a minute." });
  }

  const level = worst(checks);
  return { ...base, level, checks, summary: level === "ok" ? "Working" : level === "off" ? "Not connected" : level === "warn" ? "Check this" : "Broken" };
}
