"use client"

import { useState } from "react"

interface SafeImageProps {
  src: string
  alt: string
  fallback?: string
  className?: string
}

export function SafeImage({ src, alt, fallback = "/placeholder.jpg", className }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => setCurrentSrc(fallback)}
    />
  )
}