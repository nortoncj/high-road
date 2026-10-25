import { Skeleton } from "@/components/admin/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading settings" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-5">
        <Skeleton className="h-96 rounded-xl xl:col-span-3" />
        <Skeleton className="h-64 rounded-xl xl:col-span-2" />
      </div>
    </div>
  );
}
