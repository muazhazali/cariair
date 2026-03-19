"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function SourceError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="text-center space-y-4 px-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600 dark:text-gray-400">
          We couldn&apos;t load this water source. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/sources">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sources
            </Link>
          </Button>
          <Button onClick={() => reset()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
