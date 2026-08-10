"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface SingleSourceMapProps {
  lat: number
  lng: number
  sourceName?: string | null
  locationAddress?: string | null
  height?: string
}

export function SingleSourceMap({ 
  lat, 
  lng, 
  sourceName, 
  locationAddress,
  height = "500px"
}: SingleSourceMapProps) {
  const [mounted, setMounted] = useState(false)

  const numLat = Number(lat)
  const numLng = Number(lng)

  useEffect(() => {
    setMounted(true)

    // Fix for default marker icons in Leaflet with Next.js
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    })

    L.Marker.prototype.options.icon = DefaultIcon
  }, [])

  if (!mounted) {
    return (
      <div 
        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  return (
    <div 
      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
      style={{ height }}
    >
      <MapContainer 
        center={[numLat, numLng]} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[numLat, numLng]}>
          <Popup>
            <div className="space-y-1">
              {sourceName && (
                <h3 className="font-semibold text-base">{sourceName}</h3>
              )}
              {locationAddress && (
                <p className="text-sm text-gray-600">{locationAddress}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {numLat.toFixed(6)}, {numLng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
