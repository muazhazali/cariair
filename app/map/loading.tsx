// ==========================================
// Map Page Loading State
// ==========================================

import { Skeleton } from "@/components/ui/skeleton";

export default function MapLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Map area skeleton */}
      <div className="flex-1 relative">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
