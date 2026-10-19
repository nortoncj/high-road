"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { TbArrowLeft, TbLoader2, TbLock, TbMailForward } from "react-icons/tb";
import { login } from "@/content/admin";
import { sendCode, verifyCode, type LoginState } from "@/lib/admin/auth-actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/admin/ui/input-otp";

const RESEND_SECONDS = 60; // Supabase allows one email per address per 60 seconds by default.

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [sent, sendAction, sending] = useActionState<LoginState, FormData>(sendCode, { step: "email" });
  const [checked, verifyAction, verifying] = useActionState<LoginState, FormData>(verifyCode, { step: "code" });
  const [changingEmail, setChangingEmail] = useState(false);
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(0);
  const codeForm = useRef<HTMLFormElement>(null);

  // Reset when a server result comes back. Done during render, not in an effect, per React's
  // "adjusting state when a prop changes" pattern.
  const [seenSentAt, setSeenSentAt] = useState(sent.sentAt);
  const [seenChecked, setSeenChecked] = useState(checked);

  // A fresh send: back to the code screen, clear the old code, restart the countdown.
  if (sent.sentAt !== seenSentAt) {
    setSeenSentAt(sent.sentAt);
    if (sent.sentAt) {
      setChangingEmail(false);
      setCode("");
      setWait(RESEND_SECONDS);
    }
  }

  // A wrong code: clear the boxes so retyping is quick.
  if (checked !== seenChecked) {
    setSeenChecked(checked);
    if (checked.error) setCode("");
  }

  useEffect(() => {
    if (!sent.sentAt) return;
    const id = window.setInterval(() => setWait((s) => (s <= 1 ? (window.clearInterval(id), 0) : s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [sent.sentAt]);

  const onCodeStep = sent.step === "code" && !changingEmail;

  if (!onCodeStep) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-primary font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">{login.eyebrow}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{login.email.heading}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{login.email.body}</p>
        </header>

        {notice ? (
          <p role="status" className="bg-warning-soft text-warning rounded-lg px-3 py-2 text-sm">
            {notice}
          </p>
        ) : null}

        <form action={sendAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="next" value={next} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-email">{login.email.label}</Label>
            <Input
              id="admin-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              autoFocus
              defaultValue={sent.email}
              placeholder={login.email.placeholder}
              aria-invalid={sent.error ? true : undefined}
              aria-describedby={sent.error ? "admin-email-error" : undefined}
              className="h-11 text-base"
            />
            {sent.error ? (
              <p id="admin-email-error" role="alert" className="text-negative text-sm">
                {sent.error}
              </p>
            ) : null}
          </div>
          <Button type="submit" size="lg" className="h-11 w-full" disabled={sending}>
            {sending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbMailForward aria-hidden="true" />}
            {sending ? login.email.sending : login.email.submit}
          </Button>
        </form>
      </div>
    );
  }

  const email = sent.email ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-primary font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">{login.eyebrow}</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{login.code.heading}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{login.code.body(email)}</p>
      </header>

      <form ref={codeForm} action={verifyAction} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col items-center gap-2">
          <Label htmlFor="admin-code" className="sr-only">
            {login.code.label}
          </Label>
          <InputOTP
            id="admin-code"
            name="code"
            maxLength={login.codeLength}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={setCode}
            onComplete={() => codeForm.current?.requestSubmit()}
            aria-invalid={checked.error ? true : undefined}
            aria-describedby={checked.error ? "admin-code-error" : "admin-code-tip"}
          >
            <InputOTPGroup>
              {[0, 1, 2].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg sm:w-12" />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {[3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg sm:w-12" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {checked.error ? (
            <p id="admin-code-error" role="alert" className="text-negative text-center text-sm">
              {checked.error}
            </p>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="h-11 w-full" disabled={verifying || code.length < login.codeLength}>
          {verifying ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbLock aria-hidden="true" />}
          {verifying ? login.code.verifying : login.code.submit}
        </Button>
      </form>

      <p id="admin-code-tip" className="text-muted-foreground text-center text-xs leading-relaxed">
        {login.code.tip}
      </p>

      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={() => setChangingEmail(true)}>
          <TbArrowLeft aria-hidden="true" />
          {login.code.switchEmail}
        </Button>
        <form action={sendAction}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <Button type="submit" variant="link" size="sm" disabled={wait > 0 || sending}>
            {wait > 0 ? login.code.resendIn(wait) : login.code.resend}
          </Button>
        </form>
      </div>
    </div>
  );
}
