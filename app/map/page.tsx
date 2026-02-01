"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Import the map component dynamically to avoid SSR errors
const WaterSourceMap = dynamic(() => import("@/components/water-source-map").then(mod => mod.WaterSourceMap), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
})

export default function MapPage() {
    return (
        <div className="container flex flex-col h-[calc(100vh-4rem)] py-8 md:py-12">
            <div className="flex flex-col gap-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Water Sources Map</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Geographic distribution of registered mineral and drinking water sources in Malaysia.
                </p>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <WaterSourceMap />
            </div>
        </div>
    )
}
