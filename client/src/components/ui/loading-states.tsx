import { Skeleton } from "@/components/ui/skeleton";

export const CardSkeleton = () => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
    <Skeleton className="h-4 w-[250px]" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  </div>
);

export const PatientDetailSkeleton = () => (
  <div className="space-y-6 px-6">
    <div className="h-[100px] bg-gradient-to-r from-indigo-600/20 to-indigo-800/20 rounded-xl animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      <div className="md:col-span-2 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  </div>
);

export const VaccinationHistorySkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const MedicalRecordsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 border rounded-lg space-y-3">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    ))}
  </div>
);