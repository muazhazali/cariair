"use client"

import { ProductCard } from "./product-card"
import { Product } from "@/lib/types/db"

interface HomeContentProps {
  products: Product[]
}

export function HomeContent({ products }: HomeContentProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium mb-2">No water sources found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
