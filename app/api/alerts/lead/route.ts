import { timingSafeEqual } from "node:crypto";
import { leadAlertEmail } from "@/lib/admin/admin-email";
import { brevoConfigured, sendEmail } from "@/lib/admin/brevo";
import { leadFromPayload, secretMatches, validEmail } from "@/lib/admin/lead-alert-logic";
import { tables } from "@/lib/admin/schema";
import { createServiceSupabase } from "@/lib/admin/supabase-service";

/**
 * Supabase Database Webhook: leads INSERT → POST here with header x-webhook-secret.
 * Every way a lead gets in (contact form, Calendly, typed by hand) lands here, so there's one alert path.
 *
 * Server to server, no signed-in user, so like the Stripe webhook it uses the service role,
 * and only after the shared secret checks out.
 */


const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function POST(req: Request) {
  if (!secretMatches(req.headers.get("x-webhook-secret"), process.env.LEAD_ALERT_SECRET, (a, b) => timingSafeEqual(a, b))) {
    return json(401, { error: "bad secret" });
  }
  const lead = leadFromPayload(await req.json().catch(() => null));
  if (!lead) return json(200, { skipped: "not a new lead" });
  if (!brevoConfigured()) return json(200, { skipped: "Brevo not configured" });

  const db = createServiceSupabase();
  const A = tables.admins;

  // Claim this lead first. If the webhook retries, the second call finds the row and stops: no double emails.
  const claim = await db.from("lead_alerts_sent").upsert([{ lead_id: lead.id }], { onConflict: "lead_id", ignoreDuplicates: true }).select("lead_id");
  if (claim.error) {
    console.error("[lead-alert] claim:", claim.error.message);
    return json(500, { error: "couldn't log the alert" });
  }
  if (!claim.data?.length) return json(200, { skipped: "already alerted" });

  const { data: admins, error } = await db.from(A.table).select(`${A.columns.email}, ${A.columns.fullName}`).eq(A.columns.leadAlerts, true);
  if (error) {
    console.error("[lead-alert] admins:", error.message);
    await db.from("lead_alerts_sent").delete().eq("lead_id", lead.id);
    return json(500, { error: "couldn't load admins" });
  }

  const to = ((admins ?? []) as Record<string, unknown>[])
    .map((a) => ({ email: String(a[A.columns.email] ?? ""), name: (a[A.columns.fullName] as string | null) ?? null }))
    .filter((a) => validEmail(a.email));

  const base = process.env.ADMIN_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://webtechninjas.com";
  const mail = leadAlertEmail(lead, base);
  const replyTo = validEmail(lead.email) ? { email: lead.email, name: lead.name } : null;
  const results = await Promise.all(to.map((r) => sendEmail({ to: r, ...mail, replyTo, tags: ["lead-alert"] })));
  const sent = results.filter((r) => r.ok).length;

  if (to.length && sent === 0) {
    // Nothing went out: release the claim so Supabase's retry (or a manual resend) can try again.
    await db.from("lead_alerts_sent").delete().eq("lead_id", lead.id);
    const failed = results.find((r): r is { ok: false; error: string } => !r.ok);
    return json(502, { error: failed?.error ?? "send failed" });
  }
  await db.from("lead_alerts_sent").update({ recipients: sent }).eq("lead_id", lead.id);
  return json(200, { sent });
}
