"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { createSupabase } from "./supabase";
import { isLeadStatus, tables } from "./schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateLeadStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isLeadStatus(status)) return { ok: false, error: "Unknown status" };

  const L = tables.leads;
  const db = await createSupabase();
  const { error, count } = await db
    .from(L.table)
    .update({ [L.columns.status]: status }, { count: "exact" })
    .eq(L.columns.id, id);

  if (error) return { ok: false, error: error.message };
  // RLS doesn't error when it blocks an update, it just updates nothing. Say so instead of faking success.
  if (count === 0) return { ok: false, error: "Nothing was updated. Check the leads update policy in Supabase." };

  revalidatePath("/admin", "layout");
  return { ok: true };
}
