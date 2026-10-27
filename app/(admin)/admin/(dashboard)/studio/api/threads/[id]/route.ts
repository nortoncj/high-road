import { requireAdmin } from "@/lib/admin/auth";
import { getThreadState } from "@/lib/admin/studio";
import { advanceJobs } from "@/lib/admin/studio-jobs";

/** The chat polls this every few seconds while something's generating. It also moves jobs along. */

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await advanceJobs(id);
  const state = await getThreadState(id);
  if (!state) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(state, { headers: { "cache-control": "no-store" } });
}
