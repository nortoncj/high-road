import Image from "next/image";
import type { ReactNode } from "react";
import { adminBrand, login } from "@/content/admin";

/**
 * Login and confirm screens: the tide gradient with a glass card on top.
 * This is the one place glass earns its keep, because there's a real background behind it.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-tide relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <span
        aria-hidden="true"
        className="bg-sea-glass/25 absolute -top-24 -right-24 -z-10 size-96 [clip-path:polygon(0_0,100%_0,100%_100%)]"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-[8%] -left-16 -z-10 size-56 bg-white/[0.06] [clip-path:polygon(0_0,100%_100%,0_100%)]"
      />

      <div className="mb-6 flex items-center gap-3 text-white">
        <div>
          <Image src={adminBrand.logo.onDark} alt={adminBrand.name} width={848} height={80} className="h-6 w-auto" priority />
          {/* <p className="font-display text-lg leading-none font-semibold">{adminBrand.name}</p> */}
          <p className="mt-1 font-mono text-[11px] tracking-[0.14em] text-white/85 uppercase">
            {adminBrand.product}
          </p>
        </div>
      </div>

      <div className="bg-card/95 text-card-foreground w-full max-w-sm rounded-2xl border border-white/15 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {children}
      </div>

      <p className="mt-6 max-w-sm text-center text-xs text-white">
        {login.footer}
      </p>
    </div>
  );
}
