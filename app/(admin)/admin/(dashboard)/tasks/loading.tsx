import { Skeleton } from "@/components/admin/ui/skeleton";

export default function TasksLoading() {
  return (
    <div aria-busy="true" aria-label="Loading tasks" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-11 w-full rounded-md" />
      <Skeleton className="h-10 w-80 rounded-lg" />
      <div className="bg-card divide-y rounded-xl border">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <Skeleton className="size-5 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
