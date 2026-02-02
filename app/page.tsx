"use client"

import Link from "next/link"
import { Search } from "@/components/search"
import dynamic from "next/dynamic"
import { WaterSourcesDisplay } from "@/components/water-sources-display"

const WaterSourceMap = dynamic(() => import("@/components/water-source-map").then(mod => mod.WaterSourceMap), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">Loading map...</div>
})

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Malaysia Mineral Water Source Registry
              </h1>
              <p className="max-w-[700px] te`xt-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                The definitive registry of all mineral and drinking water sources in Malaysia.
              </p>
              <div className="w-full max-w-md">
                <Search />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-8">Explore Water Sources</h2>
            <div className="h-[400px] mb-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <WaterSourceMap />
            </div>
            <WaterSourcesDisplay />
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Comprehensive Database</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Detailed information on water quality, sourcing, and pricing for all Malaysian mineral water brands.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Interactive Map</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Visualize water sources across Malaysia with our interactive geospatial interface.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Community Driven</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Open-source project with community contributions to ensure accurate and up-to-date information.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="container flex flex-col gap-2 py-6 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 CariAir. Open-source project.
            </p>
            <nav className="flex gap-4">
              <Link href="/privacy" className="text-xs text-gray-500 hover:underline dark:text-gray-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:underline dark:text-gray-400">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-xs text-gray-500 hover:underline dark:text-gray-400">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

