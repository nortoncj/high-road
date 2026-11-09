import { Skeleton } from "@/components/admin/ui/skeleton";

/** The Studio fills the content area, so the placeholder does too. */
export default function ContentLoading() {
  return (
    <div data-bleed aria-busy="true" aria-label="Loading content" className="h-[calc(100svh-3.5rem-env(safe-area-inset-top))] p-4">
      <Skeleton className="size-full rounded-xl" />
    </div>
  );
}
