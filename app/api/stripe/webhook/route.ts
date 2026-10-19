import type Stripe from "stripe";
import { createServiceSupabase } from "@/lib/admin/supabase-service";
import { handleStripeEvent, stripe } from "@/lib/admin/stripe-sync";

/**
 * Stripe → Supabase sync for the admin. Point a Stripe webhook here (see ADMIN_SETUP.md).
 *
 * Already have a Stripe webhook route for checkout? Don't run two. Call
 * handleStripeEvent(createServiceSupabase(), event) from inside yours after you verify the signature.
 */
// No runtime/dynamic exports: cacheComponents rejects them. Node is the default runtime, and a
// POST handler that reads the request is always dynamic.

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    // Raw body, not JSON: the signature is over the exact bytes Stripe sent.
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  try {
    await handleStripeEvent(createServiceSupabase(), event);
  } catch (err) {
    // A 500 makes Stripe retry with backoff for up to 3 days, which is what we want.
    console.error("[stripe-webhook]", event.type, event.id, err);
    return new Response("Sync failed", { status: 500 });
  }

  return Response.json({ received: true });
}
