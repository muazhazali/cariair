"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import "swagger-ui-react/swagger-ui.css"
import { ArrowIcon, PageIntro } from "@/components/editorial-primitives"

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main id="main-content" className="api-docs min-h-screen bg-bone">
      <PageIntro index="Developer reference / v1" title="CariAir API" description="Public endpoints for Malaysia’s mineral and drinking water source registry.">
        <div className="mt-6 flex flex-wrap gap-5"><Link href="/" className="text-link"><ArrowIcon direction="left" />Home</Link><a href="/api/openapi" className="text-link">OpenAPI JSON<ArrowIcon direction="up-right" /></a></div>
      </PageIntro>
      <div className="mx-auto max-w-[88rem] px-3 py-8 sm:px-8 sm:py-12 lg:px-12">
        {!mounted ? <DocsSkeleton /> : <SwaggerRenderer />}
      </div>
    </main>
  )
}

function SwaggerRenderer() {
  const SwaggerUIComponent = require("swagger-ui-react").default
  return <div className="overflow-hidden rounded-xl border border-border bg-card p-2 sm:p-5"><SwaggerUIComponent url="/api/openapi" /></div>
}

function DocsSkeleton() {
  return <div className="space-y-4 rounded-xl border border-border bg-card p-6" aria-label="Loading API documentation"><div className="h-10 w-56 animate-pulse rounded-md bg-muted" /><div className="h-24 animate-pulse rounded-md bg-muted" /><div className="h-24 animate-pulse rounded-md bg-muted" /></div>
}
