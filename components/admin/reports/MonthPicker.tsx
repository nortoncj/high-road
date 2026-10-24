"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TbCalendarMonth, TbLoader2 } from "react-icons/tb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";

/** Month lives in the URL (?m=2026-09) like the date range does, so links and the back button work. */
export function MonthPicker({ value, options }: { value: string; options: { key: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      onValueChange={(v) => startTransition(() => router.replace(`${pathname}?m=${v}`, { scroll: false }))}
    >
      <SelectTrigger aria-label="Report month" className="bg-card w-full min-w-[12.5rem] sm:w-auto">
        {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbCalendarMonth aria-hidden="true" />}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.key} value={o.key}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
