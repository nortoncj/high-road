import type { NextRequest } from "next/server";
import { updateAdminSession } from "@/lib/admin/session";

/**
 * Next 16 "proxy" (formerly middleware). Only runs on /admin pages.
 * Refreshes the admin session cookie and sends signed-out visitors to /admin/login.
 */
export async function proxy(request: NextRequest) {
  return updateAdminSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
