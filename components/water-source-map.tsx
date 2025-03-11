"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the map components with no SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

export function WaterSourceMap() {
  // Center of Malaysia
  const center = [4.2105, 101.9758]
  const zoom = 6
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    // Only import Leaflet on the client side
    import("leaflet").then((L) => {
      // Fix for marker icons in production
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
      setMapReady(true)
    })

    // Import the CSS files
    import("leaflet/dist/leaflet.css")
  }, [])

  // Sample data - would be replaced with actual data from your JSON files
  const sampleSources = [
    { id: 1, name: "Spritzer", lat: 4.7729, lng: 101.1536, type: "mineral" },
    { id: 2, name: "Cactus", lat: 3.139, lng: 101.6869, type: "mineral" },
    { id: 3, name: "Bleu", lat: 5.4164, lng: 100.3327, type: "spring" },
  ]

  if (!mapReady) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <MapContainer center={center as [number, number]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sampleSources.map((source) => (
          <Marker key={source.id} position={[source.lat, source.lng]}>
            <Popup>
              <div>
                <h3 className="font-bold">{source.name}</h3>
                <p>Type: {source.type}</p>
                <a href={`/sources/${source.id}`} className="text-blue-500 hover:underline">
                  View details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

