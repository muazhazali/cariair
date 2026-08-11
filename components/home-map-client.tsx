"use client"

import { useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Product } from "@/lib/types/db"
import Link from "next/link"

interface HomeMapClientProps {
  products: Product[]
}

// Custom icon for water sources — droplet with pin tail
const waterIcon = new Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='25' viewBox='0 0 32 40'%3E%3Cpath fill='%232563EB' d='M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0Z'/%3E%3Cpath fill='%23ffffff' d='M16 8c-3.3 0-6 2.7-6 6 0 4 6 10 6 10s6-6 6-10c0-3.3-2.7-6-6-6Z'/%3E%3C/svg%3E",
  iconSize: [20, 25],
  iconAnchor: [10, 25],
  popupAnchor: [0, -23],
})

export function HomeMapClient({ products }: HomeMapClientProps) {
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
      scrollWheelZoom={"center"}
      className="h-full w-full"
      style={{ zIndex: 1 }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
