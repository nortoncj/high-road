import type { IconType } from "react-icons";
import { TbAlertTriangle, TbArrowUpRight, TbCalendarEvent, TbCircleCheckFilled, TbCircleDashed, TbCircleXFilled, TbMail } from "react-icons/tb";
import { settingsPage } from "@/content/admin";
import type { Connection, Level } from "@/lib/admin/connections";
import { cn } from "@/lib/admin/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";

const levelIcon: Record<Level, IconType> = { ok: TbCircleCheckFilled, warn: TbAlertTriangle, error: TbCircleXFilled, off: TbCircleDashed };
const levelText: Record<Level, string> = { ok: "text-positive", warn: "text-warning", error: "text-negative", off: "text-muted-foreground" };
const pill: Record<Level, string> = {
  ok: "bg-positive-soft text-positive",
  warn: "bg-warning-soft text-warning",
  error: "bg-negative-soft text-negative",
  off: "bg-secondary text-secondary-foreground",
};
const logos: Record<Connection["id"], IconType> = { calendly: TbCalendarEvent, brevo: TbMail };

export function ConnectionCard({ c }: { c: Connection }) {
  const Logo = logos[c.id];
  return (
    <Card className="gap-4">
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="bg-sea-foam text-primary grid size-9 shrink-0 place-items-center rounded-lg">
          <Logo aria-hidden="true" className="size-4.5" />
        </span>
        <CardTitle className="font-display flex-1 text-lg">{c.name}</CardTitle>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", pill[c.level])}>{c.summary}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {c.checks.map((k, i) => {
            const Icon = levelIcon[k.level];
            return (
              <li key={i} className="flex gap-2.5 text-sm">
                <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", levelText[k.level])} />
                <span className="sr-only">{k.level === "ok" ? "OK:" : k.level === "off" ? "Not set up:" : k.level === "warn" ? "Warning:" : "Problem:"}</span>
                <span className="min-w-0">
                  <span className="block font-medium break-words">{k.label}</span>
                  {k.detail ? <span className="text-muted-foreground block text-xs leading-relaxed break-words">{k.detail}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
        <a href={c.manageUrl} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex w-fit items-center gap-1 text-sm font-medium hover:underline">
          {settingsPage.connections.manage(c.name)}
          <TbArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </CardContent>
    </Card>
  );
}
