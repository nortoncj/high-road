import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs in middleware on every /admin request:
 *   1. Refreshes the Supabase session cookie so you don't get logged out mid-week.
 *   2. Bounces anyone without a session to /admin/login.
 *
 * This is the first lock, not the only one. Pages and server actions check admin_users
 * again, and RLS checks it a third time in the database.
 */

const PUBLIC_PATHS = ["/admin/login", "/admin/auth/"];
export const NEXT_COOKIE = "wtn_admin_next";

export async function updateAdminSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new NextResponse("Admin is not configured.", { status: 503 });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // Don't put code between createServerClient and getUser. Supabase's docs are loud about this:
  // it causes random logouts that are miserable to debug.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p));

  if (!user && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    if (path !== "/admin") login.searchParams.set("next", path + request.nextUrl.search);
    const redirect = NextResponse.redirect(login);
    // Carry over any refreshed cookies so the redirect doesn't drop them.
    for (const c of response.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }

  return response;
}

/** Only allow redirects back into the admin, never to another site. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.startsWith("/admin/login")) return "/admin";
  return next;
}
