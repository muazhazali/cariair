"use client"

import { useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Product } from "@/lib/types/db"
import Link from "next/link"

interface HomeMapProps {
  products: Product[]
}

// Custom icon for water sources
const waterIcon = new Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232563EB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22a8 8 0 0 0 8-8c0-3.5-2-6-4-8.5-1.5-1.5-3-3-4-6-1 3-2.5 4.5-4 6-2 2.5-4 5-4 8.5a8 8 0 0 0 8 8Z'/%3E%3C/svg%3E",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
})

export function HomeMap({ products }: HomeMapProps) {
  // Filter products that have coordinates (using lat/lng from database)
  const productsWithCoords = useMemo(() => {
    return products.filter((p) => {
      const source = p.source
      // Check for lat/lng (database column names) and ensure they're valid numbers
      const lat = source?.lat
      const lng = source?.lng
      return lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))
    })
  }, [products])

  // Always center on Malaysia
  const center = useMemo(() => {
    return [4.2105, 101.9758] // Center of Malaysia
  }, [])

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={6}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {productsWithCoords.map((product) => {
        const source = product.source!
        return (
          <Marker
            key={product.id}
            position={[Number(source.lat), Number(source.lng)]}
            icon={waterIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-semibold text-sm">{product.brand?.brand_name}</p>
                <p className="text-xs text-muted-foreground">{product.product_name}</p>
                {source.location_address && (
                  <p className="text-xs text-muted-foreground mt-1">{source.location_address}</p>
                )}
                <Link
                  href={`/sources/${product.id}`}
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
