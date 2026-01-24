import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Add this skeleton component to your existing productCard.tsx file
// or import it from a separate file

export function ProductCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-none">
      {/* Image Skeleton */}
      <div className="relative aspect-square">
        <Skeleton className="w-full h-full" />
      </div>

      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title Skeleton */}
        <Skeleton className="h-4 sm:h-5 w-3/4" />

        {/* Price Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 sm:h-6 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-8 ml-1" />
        </div>

        {/* Vendor/Location Skeleton */}
        <Skeleton className="h-3 sm:h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

// Alternative minimal skeleton
export function ProductCardSkeletonMinimal() {
  return (
    <div className="w-full space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}