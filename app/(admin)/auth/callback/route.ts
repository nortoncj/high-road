import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

/** The magic link lands here. Swap the one-time code for a session, then go to the leads page. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? origin;

  if (code) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && isAdminEmail(data.user?.email)) {
      return NextResponse.redirect(`${site}/admin/leads`);
    }
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(`${site}/admin/login`);
}
