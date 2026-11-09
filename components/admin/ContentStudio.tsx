"use client";

import { NextStudio } from "next-sanity/studio";
import { useTheme } from "next-themes";
import config from "@/sanity.config";

/**
 * The Sanity Studio inside the admin shell. NextStudio sizes itself to the whole window (100vh),
 * so the overrides below make it fill this box instead and leave the top bar where it is.
 * Follows the admin's light/dark setting.
 */
export function ContentStudio() {
  const { resolvedTheme } = useTheme();

  return (
    <div
      data-bleed
      className="h-[calc(100svh-3.5rem-env(safe-area-inset-top))] [&_[data-ui=NextStudioLayout]]:h-full! [&_[data-ui=NextStudioLayout]]:max-h-full!"
    >
      <NextStudio config={config} scheme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  );
}
