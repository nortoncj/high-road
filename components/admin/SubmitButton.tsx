"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { TbLoader2 } from "react-icons/tb";
import { Button } from "@/components/admin/ui/button";

/** A submit button that knows when its form is busy. For forms that post straight to a server action. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className={className} disabled={pending} aria-disabled={pending}>
      {pending ? (
        <>
          <TbLoader2 aria-hidden="true" className="animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
