import type { IconType } from "react-icons";
import { TbAlertTriangle, TbCircleCheck, TbRepeat, TbScale, TbUsers } from "react-icons/tb";
import { clientsPage } from "@/content/admin";
import type { ClientStats as Stats } from "@/lib/admin/clients";
import { num, usd } from "@/lib/admin/format";
import { cn } from "@/lib/admin/utils";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/admin/ui/card";

type Tile = { label: string; value: string; note: string; Icon: IconType; tone?: "brass" | "alert" | "calm" };

export function ClientStats({ stats }: { stats: Stats }) {
  const s = clientsPage.stats;
  const tiles: Tile[] = [
    { label: s.active, value: num(stats.active), note: "On the books", Icon: TbUsers },
    { label: s.mrr, value: usd(stats.mrrCents), note: s.mrrHint, Icon: TbRepeat, tone: "brass" },
    { label: s.avg, value: usd(stats.avgCents), note: "Monthly value / paying clients", Icon: TbScale },
    {
      label: s.attention,
      value: num(stats.needsAttention),
      note: stats.needsAttention ? s.attentionSome : s.attentionNone,
      Icon: stats.needsAttention ? TbAlertTriangle : TbCircleCheck,
      tone: stats.needsAttention ? "alert" : "calm",
    },
  ];

  return (
    <section aria-label="Client numbers" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {tiles.map((t, i) => (
        <Card
          key={t.label}
          className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both gap-3 py-4 duration-500 sm:py-5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <CardHeader className="px-4 sm:px-5">
            <CardDescription className="text-xs font-medium sm:text-sm">{t.label}</CardDescription>
            <CardAction>
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-lg",
                  t.tone === "alert" ? "bg-negative-soft text-negative" : "bg-sea-foam text-primary",
                )}
              >
                <t.Icon aria-hidden="true" className="size-4" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 px-4 sm:px-5">
            <p
              className={cn(
                "font-display text-2xl leading-none font-semibold tracking-tight tabular-nums sm:text-3xl",
                t.tone === "brass" && "text-brass",
                t.tone === "alert" && "text-negative",
              )}
            >
              {t.value}
            </p>
            <p className="text-muted-foreground text-xs">{t.note}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
