import JSZip from "jszip";
import { requireAdmin } from "@/lib/admin/auth";
import { viewUrl } from "@/lib/admin/storage";
import { createSupabase } from "@/lib/admin/supabase";

/** Every slide of a carousel in one zip, numbered in order, ready to drop into Instagram. */

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = await createSupabase();
  const { data } = await db.from("studio_assets").select("storage_key, slide_index").eq("group_id", id).eq("origin", "slide").order("slide_index");
  const slides = (data ?? []) as { storage_key: string; slide_index: number }[];
  if (!slides.length) return new Response("No slides", { status: 404 });
  const zip = new JSZip();
  await Promise.all(
    slides.map(async (s) => {
      const res = await fetch(viewUrl(s.storage_key, 120));
      if (res.ok) zip.file(`slide-${String(s.slide_index).padStart(2, "0")}.png`, new Uint8Array(await res.arrayBuffer()));
    }),
  );
  const out = await zip.generateAsync({ type: "uint8array", compression: "STORE" });
  return new Response(new Uint8Array(out), {
    headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="carousel-${id.slice(0, 6)}.zip"`, "cache-control": "private, no-store" },
  });
}
