"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LayoutGrid, List, MapPin, ExternalLink, Loader2 } from "lucide-react"
import { pb, getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"

export function WaterSourcesDisplay() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await pb.collection('products').getList<Product>(1, 50, {
          expand: 'brand,source',
          sort: '-created',
        });
        setProducts(result.items);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
        <Button asChild className="mt-4">
          <Link href="/contribute">Submit a Product</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
        {products.map((product) => {
          const brand = product.expand?.brand;
          const source = product.expand?.source;
          const imageUrl = product.images && product.images.length > 0 
            ? getImageUrl(product, product.images[0])
            : '/placeholder.jpg';

          return (
              <Card key={product.id} className={`overflow-hidden ${viewMode === "list" ? "flex" : ""}`}>
                <Link href={`/sources/${product.id}`} className={`flex-1 block cursor-pointer`}>
                  <div className={viewMode === "list" ? "flex" : ""}>
                    <div className={`relative ${viewMode === "list" ? "w-48" : "aspect-video"}`}>
                    <Image
                      src={imageUrl}
                      alt={product.product_name || "Product Image"}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{product.product_name}</h3>
                    <p className="text-sm text-gray-500">{brand?.brand_name}</p>
                    {source && (
                      <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        {source.location_address || "Location Unknown"}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              {brand?.website_url && (
                <div className={`p-4 ${viewMode === "list" ? "flex items-center" : "border-t border-gray-200 dark:border-gray-800"}`}>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  )
}
