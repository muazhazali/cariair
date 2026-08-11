"use client"

import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export function SingleSourceMap({ lat, lng, sourceName, locationAddress, height = "500px" }: { lat: number; lng: number; sourceName?: string | null; locationAddress?: string | null; height?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const numLat = Number(lat), numLng = Number(lng)
  const marker = useMemo(() => L.icon({
    iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='34' viewBox='0 0 28 34'%3E%3Cpath fill='%232f382a' d='M14 0C6.27 0 0 6.27 0 14c0 9.63 14 20 14 20s14-10.37 14-20C28 6.27 21.73 0 14 0Z'/%3E%3Ccircle cx='14' cy='14' r='5' fill='%23dfe8d9'/%3E%3C/svg%3E",
    iconSize: [28, 34], iconAnchor: [14, 34], popupAnchor: [0, -31],
  }), [])

  if (!mounted) return <div className="grid w-full animate-pulse place-items-center border-t border-border bg-muted" style={{ height }}><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Loading map</p></div>

  return <div className="w-full overflow-hidden border-t border-border" style={{ height }}><MapContainer center={[numLat, numLng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom><TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={[numLat, numLng]} icon={marker}><Popup><article className="space-y-1">{sourceName && <h3 className="text-sm font-semibold">{sourceName}</h3>}{locationAddress && <p className="text-xs text-muted-foreground">{locationAddress}</p>}<p className="font-mono text-[10px] text-muted-foreground">{numLat.toFixed(5)}, {numLng.toFixed(5)}</p></article></Popup></Marker></MapContainer></div>
}
