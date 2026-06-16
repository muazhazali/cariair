"use client"

import dynamic from "next/dynamic"
import { Product } from "@/lib/types/db"

interface HomeMapProps {
  products: Product[]
}

// Dynamically import the actual map component to avoid SSR issues
const HomeMapClient = dynamic(() => import("./home-map-client").then((mod) => mod.HomeMapClient), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  ),
})

export function HomeMap({ products }: HomeMapProps) {
  return <HomeMapClient products={products} />
}
