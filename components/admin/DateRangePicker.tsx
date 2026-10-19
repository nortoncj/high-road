"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange as DayRange } from "react-day-picker";
import { TbCalendar, TbChevronDown, TbLoader2 } from "react-icons/tb";
import { DEFAULT_RANGE, rangePresets, type RangePresetId } from "@/lib/admin/range";
import { cn } from "@/lib/admin/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/admin/ui/button";
import { Calendar } from "@/components/admin/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/admin/ui/popover";

/** "2026-10-19" as a local Date at noon, so no time zone can push it to the wrong day. */
function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function DateRangePicker({
  preset,
  fromDay,
  toDay,
  label,
}: {
  preset: RangePresetId | "custom";
  fromDay: string;
  toDay: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DayRange | undefined>();
  const [pending, startTransition] = useTransition();

  function go(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const k of ["range", "from", "to", "page"]) sp.delete(k);
    for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v);
    const qs = sp.toString();
    setOpen(false);
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const end = fromKey(toDay);
  const twoMonths = !isMobile;
  const defaultMonth = twoMonths ? new Date(end.getFullYear(), end.getMonth() - 1, 1) : end;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft({ from: fromKey(fromDay), to: fromKey(toDay) });
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-card h-10 w-full justify-start gap-2 font-normal sm:w-auto">
          <TbCalendar aria-hidden="true" className="text-primary" />
          <span className="truncate">{label}</span>
          {pending ? (
            <TbLoader2 aria-hidden="true" className="ml-auto animate-spin" />
          ) : (
            <TbChevronDown aria-hidden="true" className="ml-auto opacity-60" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-0">
        <div className="flex flex-col sm:flex-row">
          <div
            role="group"
            aria-label="Quick ranges"
            className="flex gap-1 overflow-x-auto border-b p-2 sm:w-40 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0"
          >
            {rangePresets.map((p) => (
              <Button
                key={p.id}
                variant={preset === p.id ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={preset === p.id}
                className={cn("shrink-0 justify-start", preset === p.id && "font-semibold")}
                onClick={() => go({ range: p.id === DEFAULT_RANGE ? null : p.id })}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col">
            <Calendar
              mode="range"
              numberOfMonths={twoMonths ? 2 : 1}
              defaultMonth={defaultMonth}
              selected={draft}
              onSelect={setDraft}
              disabled={{ after: new Date() }}
              className="p-3"
            />
            <div className="flex items-center justify-between gap-3 border-t p-3">
              <span className="text-muted-foreground text-xs tabular-nums">
                {draft?.from
                  ? draft.to && toKey(draft.to) !== toKey(draft.from)
                    ? `${short.format(draft.from)} – ${short.format(draft.to)}`
                    : short.format(draft.from)
                  : "Pick a start day"}
              </span>
              <Button
                size="sm"
                disabled={!draft?.from}
                onClick={() => draft?.from && go({ from: toKey(draft.from), to: toKey(draft.to ?? draft.from) })}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
