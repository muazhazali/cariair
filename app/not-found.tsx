import Link from "next/link"
import { ArrowIcon, RegistryGlyph } from "@/components/editorial-primitives"

export default function NotFound() {
  return <main id="main-content" className="editorial-texture grid min-h-[70dvh] place-items-center px-5 py-20"><section className="w-full max-w-xl border-y border-border py-12 text-center"><RegistryGlyph kind="map" className="mx-auto" /><p className="section-index mt-6">404 / Not found</p><h1 className="mt-3 font-display text-5xl tracking-[-0.04em]">This source ran dry.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">The page may have moved, or the address may be incorrect.</p><Link href="/" className="quiet-button mt-7"><ArrowIcon direction="left" />Return home</Link></section></main>
}
