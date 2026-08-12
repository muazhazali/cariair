"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Icon, latLngBounds } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Product } from "@/lib/types/db"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowIcon } from "@/components/editorial-primitives"

const waterIcon = new Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='34' viewBox='0 0 28 34'%3E%3Cpath fill='%2324251f' d='M14 0C6.27 0 0 6.27 0 14c0 9.63 14 20 14 20s14-10.37 14-20C28 6.27 21.73 0 14 0Z'/%3E%3Ccircle cx='14' cy='14' r='5' fill='%23dfe8d9'/%3E%3C/svg%3E",
  iconSize: [28, 34], iconAnchor: [14, 34], popupAnchor: [0, -31],
})

function FitBounds({ products }: { products: Product[] }) {
  const map = useMap()
  useEffect(() => {
    if (products.length === 0) return
    const points = products.map((product) => [Number(product.source!.lat), Number(product.source!.lng)] as [number, number])
    if (points.length === 1) { map.setView(points[0], 12); return }
    map.fitBounds(latLngBounds(points), { padding: [40, 40] })
  }, [map, products])
  return null
}

export function HomeMapClient({ products }: { products: Product[] }) {
  const t = useTranslations("map")
  const tp = useTranslations("mapPopup")
  const productsWithCoords = useMemo(() => products.filter((product) => {
    const { lat, lng } = product.source ?? {}
    return lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))
  }), [products])

  return (
    <div className="h-full w-full" role="region" aria-label={t("title")}><MapContainer center={[4.2105, 101.9758]} zoom={6} scrollWheelZoom="center" className="h-full w-full" style={{ zIndex: 1 }}>
      <FitBounds products={productsWithCoords} />
      <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {productsWithCoords.map((product) => (
        <Marker key={product.id} position={[Number(product.source!.lat), Number(product.source!.lng)]} icon={waterIcon}>
          <Popup>
            <article className="p-1">
              <p className="text-sm font-semibold">{product.brand?.brand_name}</p>
              <p className="text-xs text-muted-foreground">{product.product_name}</p>
              {product.source!.location_address && <p className="mt-1 text-xs text-muted-foreground">{product.source!.location_address}</p>}
<<<<<<< HEAD
              <Link href={`/sources/${product.id}`} className="mt-2 inline-block border-b border-current text-xs font-semibold text-[#405039]">{tp("viewDetails")} →</Link>
=======
              <Link href={`/sources/${product.id}`} className="mt-2 inline-flex items-center gap-1 border-b border-current text-xs font-semibold text-survey-foreground">{t("viewDetails")}<ArrowIcon /></Link>
>>>>>>> 6f557c3b1bd383c199fae316538638869229d90b
            </article>
          </Popup>
        </Marker>
      ))}
    </MapContainer></div>
  )
}
