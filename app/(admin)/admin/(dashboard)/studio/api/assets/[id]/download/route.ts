import { requireAdmin } from "@/lib/admin/auth";
import { downloadUrl, viewUrl } from "@/lib/admin/storage";
import { exportSize, type Ratio } from "@/lib/admin/studio-models";
import { createSupabase } from "@/lib/admin/supabase";

/**
 * GET ?size=original (default): straight from the bucket with a proper filename.
 * GET ?size=export: resized for where it's going. Thumbnails become 1280x720 JPEGs under 2 MB,
 * because YouTube refuses anything bigger.
 */

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "studio";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = await createSupabase();
  const { data } = await db.from("studio_assets").select("storage_key, mime, kind, format, ratio, label, slide_index, thread:studio_threads(title)").eq("id", id).maybeSingle();
  if (!data) return new Response("Not found", { status: 404 });
  const a = data as { storage_key: string; mime: string; kind: string; format: string | null; ratio: string | null; label: string | null; slide_index: number | null; thread: { title?: string } | null };
  const ext = a.storage_key.split(".").pop() ?? "bin";
  const name = `${slug(a.thread?.title ?? a.format ?? "studio")}${a.slide_index ? `-slide-${a.slide_index}` : ""}-${id.slice(0, 6)}`;
  const size = new URL(req.url).searchParams.get("size");

  if (size !== "export" || a.kind !== "image" || !a.ratio || !(a.ratio in exportSize)) {
    return Response.redirect(downloadUrl(a.storage_key, `${name}.${ext}`), 302);
  }

  const src = await fetch(viewUrl(a.storage_key, 120));
  if (!src.ok) return new Response("Couldn't read the file from storage.", { status: 502 });
  const sharp = (await import("sharp")).default;
  const input = new Uint8Array(await src.arrayBuffer());
  const thumb = a.format === "thumbnail" && a.ratio === "16:9";
  const box = thumb ? { w: 1280, h: 720 } : exportSize[a.ratio as Ratio];
  let img = sharp(input).resize(box.w, box.h, { fit: "cover", kernel: "lanczos3" });
  // Text-heavy formats stay PNG (crisp letters); photos and thumbnails go JPEG (small, accepted everywhere).
  const png = !thumb && a.mime === "image/png";
  let out = png ? await img.png({ compressionLevel: 9 }).toBuffer() : await img.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  if (thumb && out.byteLength > 1_950_000) {
    img = sharp(input).resize(box.w, box.h, { fit: "cover" });
    out = await img.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  }
  return new Response(new Uint8Array(out), {
    headers: {
      "content-type": png ? "image/png" : "image/jpeg",
      "content-disposition": `attachment; filename="${name}-${box.w}x${box.h}.${png ? "png" : "jpg"}"`,
      "cache-control": "private, no-store",
    },
  });
}
