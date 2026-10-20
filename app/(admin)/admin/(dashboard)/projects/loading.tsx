import { Skeleton } from "@/components/admin/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading projects" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((col) => (
          <div key={col} className="flex w-[85%] shrink-0 flex-col gap-2 sm:w-[45%] lg:w-0 lg:flex-1">
            <Skeleton className="h-5 w-24" />
            <div className="bg-secondary/50 flex flex-col gap-2 rounded-xl p-2">
              {Array.from({ length: col === 3 ? 1 : 3 - (col % 2) }).map((_, i) => (
                <Skeleton key={i} className="bg-card h-28 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
