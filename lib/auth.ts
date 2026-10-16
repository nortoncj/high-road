import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

/** True only for the one email in ADMIN_EMAIL. */
export function isAdminEmail(email: string | undefined | null) {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(admin && email && email.trim().toLowerCase() === admin);
}

/** Use at the top of every admin page and admin server action. Sends anyone else to the login page. */
export async function requireAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) redirect("/admin/login");
  return user;
}
