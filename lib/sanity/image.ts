import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImage } from "./types";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** What next/image needs. Built on the server so client components only get plain strings. */
export type Img = { src: string; alt: string; width: number; height: number; blurDataURL?: string };

/**
 * Sanity image → props for next/image. Pass `aspect` (width / height) to crop to a fixed shape,
 * respecting the hotspot set in the Studio. Without it the original shape is kept.
 */
export function toImg(image: SanityImage | null | undefined, opts: { width?: number; aspect?: number; alt?: string } = {}): Img | null {
  if (!image?.asset?._ref) return null;
  const width = opts.width ?? 1600;
  const natural = image.width && image.height ? image.width / image.height : 16 / 10;
  const aspect = opts.aspect ?? natural;
  const height = Math.round(width / aspect);

  let url = builder.image(image).width(width).auto("format").quality(80);
  if (opts.aspect) url = url.height(height).fit("crop");

  return {
    src: url.url(),
    alt: opts.alt ?? image.alt ?? "",
    width,
    height,
    blurDataURL: image.lqip ?? undefined,
  };
}
