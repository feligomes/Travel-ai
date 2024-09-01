import { Skeleton } from "./ui/skeleton"

export function ItinerarySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-3/4" />
      {[...Array(3)].map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          {[...Array(4)].map((_, activityIndex) => (
            <div key={activityIndex} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}