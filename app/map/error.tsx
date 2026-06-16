// ==========================================
// Map Page Error Boundary
// ==========================================

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, MapPin } from "lucide-react";

interface MapErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MapError({ error, reset }: MapErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center"
>
      <div className="text-center space-y-4 px-4"
>
        <div className="flex justify-center"
>
          <MapPin className="w-12 h-12 text-muted-foreground" /
>
        </div
>
        <h1 className="text-2xl font-bold"
>Map Unavailable</h1
>
        <p className="text-muted-foreground max-w-md"
>
          We couldn&apos;t load the map. This might be due to a network issue or the map service being temporarily unavailable.
        </p
>
        <div className="flex gap-3 justify-center"
>
          <Button variant="outline" asChild
>
            <Link href="/"
>
              <ArrowLeft className="mr-2 h-4 w-4" /
>
              Back to Home
            </Link
>
          </Button
>
          <Button onClick={() => reset()}
>
            <RefreshCw className="mr-2 h-4 w-4" /
>
            Try Again
          </Button
>
        </div
>
      </div
>
    </div
>
  );
}
