"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { pb } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"

export function WaterSourceMap() {
  // Center of Malaysia
  const center: [number, number] = [4.2105, 101.9758]
  const zoom = 6
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

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

    // Load products
    const loadProducts = async () => {
      try {
        const result = await pb.collection('products').getList<Product>(1, 50, {
          expand: 'source',
          requestKey: null,
        });
        setProducts(result.items);
      } catch (error) {
        console.error("Error loading products for map:", error);
      }
    };

    loadProducts();
  }, [])

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {products.map((product) => {
          const source = product.expand?.source;
          if (!source || !source.lat || !source.lng) return null;

          return (
            <Marker key={product.id} position={[source.lat, source.lng]}>
              <Popup>
                <div>
                  <h3 className="font-bold">{product.product_name}</h3>
                  <p>Source: {source.source_name || "Unknown"}</p>
                  <p>Type: {source.type || "Unknown"}</p>
                  {/* Link to product detail if we had it */}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  )
}
