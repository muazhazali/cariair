"use client"

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import SingleSourceMap to avoid SSR window issues
const SingleSourceMap = dynamic(
  () => import("@/components/single-source-map").then((mod) => mod.SingleSourceMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    ),
  }
);

interface ClientMapWrapperProps {
  lat: number;
  lng: number;
  sourceName?: string | null;
  locationAddress?: string | null;
  height?: string;
}

export function ClientMapWrapper(props: ClientMapWrapperProps) {
  return (
    <Suspense fallback={
      <div className="h-[500px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    }>
      <SingleSourceMap {...props} />
    </Suspense>
  );
}
