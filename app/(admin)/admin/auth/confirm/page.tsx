import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TbLock } from "react-icons/tb";
import { login } from "@/content/admin";
import type { SearchParams } from "@/lib/admin/range";
import { confirmLink } from "@/lib/admin/auth-actions";
import { AuthShell } from "@/components/admin/AuthShell";
import { SubmitButton } from "@/components/admin/SubmitButton";

export const metadata: Metadata = { title: login.confirm.heading };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Where the email's link lands. It does NOT sign you in on page load.
 *
 * Outlook, Gmail and most corporate filters open every link in an email to scan it.
 * If loading this page used the token, the scanner would burn it and your tap would fail.
 * Scanners don't press buttons, so the token only gets used when you do.
 */
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tokenHash = one(params.token_hash);
  const type = one(params.type) ?? "email";
  if (!tokenHash) redirect("/admin/login?error=link");

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-primary font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">{login.eyebrow}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{login.confirm.heading}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{login.confirm.body}</p>
        </header>
        <form action={confirmLink}>
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <SubmitButton pendingLabel={login.confirm.working} className="h-11 w-full">
            <TbLock aria-hidden="true" />
            {login.confirm.submit}
          </SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}
