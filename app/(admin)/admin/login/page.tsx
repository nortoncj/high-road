import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { login } from "@/content/admin";
import { getSession } from "@/lib/admin/auth";
import { safeNext } from "@/lib/admin/session";
import type { SearchParams } from "@/lib/admin/range";
import { AuthShell } from "@/components/admin/AuthShell";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: login.meta.title };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const next = safeNext(one(params.next));
  const session = await getSession();

  // Already in? Skip the form. (A signed-in non-admin stays here, which is why
  // the middleware never redirects away from this page: that would loop.)
  if (session.state === "admin") redirect(next);

  const error = one(params.error);
  // Signed in but not in admin_users beats any link error: that's the real reason you're here.
  const notice =
    error === "not-admin" || session.state === "not-admin"
      ? login.errors.notAdmin
      : error === "link"
        ? login.errors.link
        : undefined;

  return (
    <AuthShell>
      <LoginForm next={next} notice={notice} />
    </AuthShell>
  );
}
