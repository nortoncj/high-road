import { Card } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading reports" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-full sm:w-52" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Card className="gap-0 py-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </Card>
    </div>
  );
}
