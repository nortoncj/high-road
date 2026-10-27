import { Skeleton } from "@/components/admin/ui/skeleton";

export default function StudioLoading() {
  return (
    <div aria-busy="true" aria-label="Loading Studio" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-56 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
