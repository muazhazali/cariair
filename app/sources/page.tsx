import { WaterSourcesDisplay } from "@/components/water-sources-display"

export default function SourcesPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Water Sources</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Explore our complete registry of mineral and drinking water sources in Malaysia.
        </p>
      </div>
      <WaterSourcesDisplay />
    </div>
  )
}
