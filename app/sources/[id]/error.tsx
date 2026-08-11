"use client"
import { EditorialErrorState } from "@/components/editorial-error-state"
export default function SourceError({ reset }: { error: Error; reset: () => void }) { return <EditorialErrorState title="Source unavailable" description="We couldn't load this water-source record." reset={reset} backHref="/#sources" backLabel="Back to sources" /> }
