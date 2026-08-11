"use client"

import { useEffect } from "react"
import { EditorialErrorState } from "@/components/editorial-error-state"

export default function RootErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { if (process.env.NODE_ENV === "production") console.error("Root error boundary caught:", error) }, [error])
  return <EditorialErrorState title="Something went wrong" description="We couldn't load this page. Please try again or return to the registry." reset={reset} />
}
