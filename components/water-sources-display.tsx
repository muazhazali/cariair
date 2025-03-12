"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid, List, MapPin, ExternalLink } from "lucide-react"
import { waterSources } from "@/lib/data/water-sources"

export function WaterSourcesDisplay() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
        {Object.values(waterSources).map((source) => (
          <Card key={source.id} className={`overflow-hidden ${viewMode === "list" ? "flex" : ""}`}>
            <Link href={`/sources/${source.id}`} className="flex-1">
              <div className={viewMode === "list" ? "flex" : ""}>
                <div className={`relative ${viewMode === "list" ? "w-48" : "aspect-video"}`}>
                  <Image
                    src={source.image}
                    alt={source.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{source.name}</h3>
                  <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    {source.location.district}, {source.location.state}
                  </div>
                </div>
              </div>
            </Link>
            {source.website && (
              <div className={`p-4 ${viewMode === "list" ? "flex items-center" : "border-t border-gray-200 dark:border-gray-800"}`}>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={source.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 