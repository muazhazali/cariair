"use client"
import { EditorialErrorState } from "@/components/editorial-error-state"
export default function DocsError({ reset }: { error: Error; reset: () => void }) { return <EditorialErrorState title="Documentation unavailable" description="We couldn't load the API reference." reset={reset} /> }
