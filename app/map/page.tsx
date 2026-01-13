"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Import the map component dynamically to avoid SSR errors
const Map = dynamic(() => import("@/components/map-component"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
})

export default function MapPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <main className="container mx-auto py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl font-bold tracking-tight">OpenStreetMap Demo</h1>
                <p className="text-muted-foreground">
                    This is a demonstration of Leaflet with OpenStreetMap integrated into a Next.js application.
                </p>
                {mounted ? <Map /> : <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Initializing...</div>}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow">
                        <h2 className="text-xl font-semibold mb-2">Location Data</h2>
                        <p className="text-sm text-muted-foreground">
                            Latitude: 51.505<br />
                            Longitude: -0.09
                        </p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow">
                        <h2 className="text-xl font-semibold mb-2">Features</h2>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                            <li>OpenStreetMap Tiling</li>
                            <li>Interactive Markers</li>
                            <li>Responsive Layout</li>
                            <li>Client-side Rendering</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    )
}
