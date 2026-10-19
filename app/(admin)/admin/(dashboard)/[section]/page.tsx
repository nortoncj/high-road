import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbArrowLeft, TbHammer, TbPointFilled } from "react-icons/tb";
import { comingSoon, comingSoonCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";

/**
 * Placeholder for nav items marked `soon` in content/admin.ts.
 * When you build one for real, add its own folder (app/(admin)/admin/(dashboard)/clients/page.tsx)
 * and drop `soon` from the nav item. The real folder wins over this catch-all.
 */

type Props = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  return { title: comingSoon[section]?.title ?? "Not found" };
}

export default async function ComingSoonPage({ params }: Props) {
  await requireAdmin();
  const { section } = await params;
  const page = comingSoon[section];
  if (!page) notFound();

  return (
    <>
      <PageHeader title={page.title} description={page.body} />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Badge variant="outline" className="bg-warning-soft text-warning mb-2 w-fit gap-1.5 border-transparent">
            <TbHammer aria-hidden="true" />
            {comingSoonCopy.badge}
          </Badge>
          <CardTitle className="font-display text-lg">{comingSoonCopy.plannedHeading}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2.5 text-sm">
            {page.planned.map((item) => (
              <li key={item} className="flex gap-2">
                <TbPointFilled aria-hidden="true" className="text-sea-glass mt-1 size-3 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/admin">
              <TbArrowLeft aria-hidden="true" />
              {comingSoonCopy.back}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
