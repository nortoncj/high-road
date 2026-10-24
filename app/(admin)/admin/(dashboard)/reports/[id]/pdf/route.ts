import { requireAdmin } from "@/lib/admin/auth";
import { buildReportPdf, reportFileName } from "@/lib/admin/report-pdf";
import { getClientReport } from "@/lib/admin/reports";

/**
 * GET /admin/reports/:id/pdf?m=2026-09           downloads it
 * GET /admin/reports/:id/pdf?m=2026-09&inline=1  opens it in the browser tab (Preview)
 */

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const url = new URL(req.url);
  const loaded = await getClientReport(id, url.searchParams.get("m") ?? undefined);
  if (!loaded) return new Response("Client not found", { status: 404 });
  if (!loaded.ok) return new Response(`Couldn't load the report: ${loaded.issue.message}`, { status: 500 });

  const r = loaded.data;
  const pdf = await buildReportPdf(r);
  const name = reportFileName(r.client.name, r.month.key);
  // A fresh ArrayBuffer-backed copy: what Response wants under newer TypeScript lib types.
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${url.searchParams.get("inline") ? "inline" : "attachment"}; filename="${name}"`,
      "cache-control": "private, no-store",
    },
  });
}
