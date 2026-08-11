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
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-muted">
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading map</span>
    </div>
  ),
})

export function HomeMap({ products }: HomeMapProps) {
  return <HomeMapClient products={products} />
}
