"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X, Scale } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"
import { Badge } from "@/components/ui/badge"

interface ProductComparisonProps {
  products: Product[]
  onRemove: (productId: string) => void
  onClear: () => void
}

export function ProductComparison({ products, onRemove, onClear }: ProductComparisonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (products.length === 0) {
    return null
  }

  const ComparisonTable = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-semibold">Property</th>
              {products.map((product) => (
                <th key={product.id} className="text-center p-2 font-semibold min-w-[150px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={getImageUrl(product, product.images[0])}
                          alt={product.product_name || "Product"}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {product.expand?.brand?.brand_name || "Unknown Brand"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.product_name || "Unknown Product"}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-medium">pH Level</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  {product.ph_level ?? "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">TDS (mg/L)</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  {product.tds ? `${product.tds} mg/L` : "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">Water Type</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  <Badge variant="outline">
                    {product.expand?.source?.type || "Unknown"}
                  </Badge>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">Location</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center text-sm">
                  {product.expand?.source?.location_address || "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">Brand Website</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  {product.expand?.brand?.website_url ? (
                    <a
                      href={product.expand.brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Visit
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <>
      {/* Floating Comparison Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="shadow-lg"
          size="lg"
        >
          <Scale className="h-5 w-5 mr-2" />
          Compare ({products.length}/3)
        </Button>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Comparison</DialogTitle>
            <DialogDescription>
              Compare up to 3 products side by side
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"} selected
              </div>
              <Button variant="outline" size="sm" onClick={onClear}>
                Clear All
              </Button>
            </div>

            {products.length > 0 && <ComparisonTable />}

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {products.map((product) => (
                <Card key={product.id} className="p-3 flex items-center gap-2">
                  <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={getImageUrl(product, product.images[0])}
                        alt={product.product_name || "Product"}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {product.expand?.brand?.brand_name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {product.product_name || "Unknown"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(product.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
