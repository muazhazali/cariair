"use client"
import { EditorialErrorState } from "@/components/editorial-error-state"
export default function AboutError({ reset }: { error: Error; reset: () => void }) { return <EditorialErrorState title="Page unavailable" description="We couldn't load the information about CariAir." reset={reset} /> }
