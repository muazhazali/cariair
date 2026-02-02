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

    // Load products with related data for a richer popup description
    const loadProducts = async () => {
      try {
        const result = await pb.collection("products").getList<Product>(1, 50, {
          expand: "brand,manufacturer,source",
          requestKey: null,
        })
        setProducts(result.items)
      } catch (error) {
        console.error("Error loading products for map:", error)
      }
    }

    loadProducts()
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
          const source = product.expand?.source
          const brand = product.expand?.brand
          const manufacturer = product.expand?.manufacturer

          if (!source || !source.lat || !source.lng) return null

          return (
            <Marker key={product.id} position={[source.lat, source.lng]}>
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">
                    {brand?.brand_name || product.product_name || "Unnamed product"}
                  </h3>
                  {product.product_name && (
                    <p className="text-sm">
                      <span className="font-medium">Product:</span> {product.product_name}
                    </p>
                  )}
                  {brand && (
                    <p className="text-sm">
                      <span className="font-medium">Brand:</span> {brand.brand_name}
                    </p>
                  )}
                  {manufacturer && (
                    <p className="text-sm">
                      <span className="font-medium">Bottled by:</span> {manufacturer.name}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Source:</span> {source.source_name || "Unknown"}{" "}
                    {source.type && <span>({source.type})</span>}
                  </p>
                  {source.location_address && (
                    <p className="text-sm">
                      <span className="font-medium">Location:</span> {source.location_address}
                    </p>
                  )}
                  {(product.ph_level !== undefined || product.tds !== undefined) && (
                    <p className="text-sm">
                      <span className="font-medium">Water profile:</span>{" "}
                      {product.ph_level !== undefined && <>pH {product.ph_level}</>}
                      {product.ph_level !== undefined && product.tds !== undefined && " • "}
                      {product.tds !== undefined && <>TDS {product.tds} mg/L</>}
                    </p>
                  )}
                  {source.kkm_approval_number && (
                    <p className="text-xs text-muted-foreground">
                      KKM approval: {source.kkm_approval_number}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
