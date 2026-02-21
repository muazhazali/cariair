"use client"

import dynamic from "next/dynamic"
import { MapPin, Droplet } from "lucide-react"
import { useTranslations } from "next-intl"

function MapLoadingFallback() {
    const t = useTranslations("map")
    return (
        <div className="h-full w-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 animate-pulse rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <Droplet className="h-6 w-6 animate-pulse" />
                <span className="text-lg">{t("loadingMap")}</span>
            </div>
        </div>
    )
}

// Import the map component dynamically to avoid SSR errors
const WaterSourceMap = dynamic(() => import("@/components/water-source-map").then(mod => mod.WaterSourceMap), {
    ssr: false,
    loading: () => <MapLoadingFallback />,
})

export default function MapPage() {
    const t = useTranslations("map")

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container flex flex-col h-[calc(100vh-4rem)] py-12 md:py-16">
                {/* Hero Section */}
                <div className="flex flex-col gap-4 mb-8 md:mb-12">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-2">
                            <MapPin className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            {t("title")}
                        </h1>
                    </div>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                        {t("description")}
                    </p>
                </div>
                <div className="flex-1 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg min-h-[500px]">
                    <WaterSourceMap />
                </div>
            </div>
        </div>
    )
}
