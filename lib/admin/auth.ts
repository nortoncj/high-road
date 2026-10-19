import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabase } from "./supabase";
import { tables } from "./schema";

export type Admin = { id: string; email: string; name: string; role: string };

type Session =
  | { state: "signed-out" }
  | { state: "not-admin"; email: string }
  | { state: "admin"; admin: Admin };

/**
 * Who's here. Cached per request, so the layout, page and actions can all ask without
 * hitting Supabase three times.
 *
 * Being signed in isn't enough: the user must also have a row in admin_users.
 * shouldCreateUser: false already stops strangers from getting an account, this is the backstop.
 */
export const getSession = cache(async (): Promise<Session> => {
  const supabase = await createSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { state: "signed-out" };

  const a = tables.admins.columns;
  const { data: row } = await supabase
    .from(tables.admins.table)
    .select(`fullName:${a.fullName}, role:${a.role}`)
    .eq(a.userId, user.id)
    .maybeSingle<{ fullName: string | null; role: string | null }>();

  if (!row) return { state: "not-admin", email: user.email };
  return {
    state: "admin",
    admin: { id: user.id, email: user.email, name: row.fullName || user.email.split("@")[0], role: row.role || "admin" },
  };
});

/**
 * Call at the top of every admin page and server action. Layouts alone aren't enough:
 * Next.js doesn't re-run a layout when you click between pages under it.
 */
export async function requireAdmin(): Promise<Admin> {
  const session = await getSession();
  if (session.state === "admin") return session.admin;
  redirect(session.state === "not-admin" ? "/admin/login?error=not-admin" : "/admin/login");
}
