import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getProductById } from "@/lib/db/products"
import type { Product } from "@/lib/types/db"
import { MineralCompositionPanel } from "@/components/mineral-composition-panel"
import { HealthBenefitsPanel } from "@/components/health-benefits-panel"
import { WaterTypeBadge } from "@/components/water-type-badge"
import { ClientDate } from "@/components/client-date"
import { ClientMapWrapper } from "@/components/client-map-wrapper"
import { SafeImage } from "@/components/safe-image"
import { ArrowIcon, PanelHeading, RegistryGlyph } from "@/components/editorial-primitives"

export const dynamic = "force-dynamic"

type Mineral = { name: string; symbol?: string; amount: number; unit?: string }

async function getProduct(id: string) {
  try { return await getProductById(id) }
  catch (error) { console.error("[sources/[id]] Error fetching product:", id, error); return null }
}

export default async function SourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let product: Product | null = null
  let t: Awaited<ReturnType<typeof getTranslations<"product">>>
  try { [product, t] = await Promise.all([getProduct(id), getTranslations("product")]) }
  catch { product = await getProduct(id); t = ((key: string) => key) as typeof t }
  if (!product) notFound()

  const { brand, source } = product
  const image = product.images?.[0]
  const imageUrl = image?.url ?? "/placeholder.svg"
  const rawMinerals = product.minerals_json
  let minerals: Mineral[] = []
  if (typeof rawMinerals === "string") {
    try { const parsed = JSON.parse(rawMinerals); minerals = Array.isArray(parsed) ? parsed : Object.values(parsed) }
    catch (error) { console.error("Error parsing minerals JSON", error) }
  } else if (Array.isArray(rawMinerals)) minerals = rawMinerals as Mineral[]
  else if (rawMinerals && typeof rawMinerals === "object") minerals = Object.values(rawMinerals) as Mineral[]

  const hasCoordinates = source?.lat != null && source?.lng != null
  const productName = product.product_name || brand?.brand_name || t("unknown")

  return (
    <main id="main-content" className="min-h-screen bg-bone">
      <header className="editorial-texture border-b border-border">
        <div className="mx-auto max-w-[88rem] px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:px-12">
          <Link href="/#sources" className="text-link"><ArrowIcon direction="left" />{t("backToSources")}</Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16">
            <div>
              <p className="section-index">{t("sourceRecord")} / {product.id.slice(0, 8)}</p>
              <h1 className="mt-5 max-w-5xl text-pretty font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.94] tracking-[-0.04em]">{productName}</h1>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <WaterTypeBadge type={source?.type || "Mineral Water"} />
                {source?.location_address && <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"><RegistryGlyph kind="map" className="h-7 w-7 rounded-sm" /><span className="text-pretty">{source.location_address}</span></span>}
              </div>
            </div>
            <div className="relative h-72 overflow-hidden rounded-xl border border-border bg-specimen sm:h-80">
              <span className="absolute right-4 top-4 z-10 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{t("productImage")}</span>
              <SafeImage src={imageUrl} alt={productName} width={640} height={640} loading="eager" fetchPriority="high" className="h-full w-full object-contain p-7" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[88rem] gap-6 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start lg:px-12 lg:py-24">
        <aside className="space-y-5 lg:sticky lg:top-28">
          <InfoPanel title={t("companyInfo")} index="01">
            <InfoRow label={t("brand")} value={brand?.brand_name || t("unknown")} />
            {brand?.parent_company && <InfoRow label={t("parentCompany")} value={brand.parent_company} />}
            <InfoRow label={t("country")} value={source?.country || "Malaysia"} />
            {brand?.website_url && <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="text-link mt-1">{t("visitWebsite")}<ArrowIcon direction="up-right" /></a>}
          </InfoPanel>

          <InfoPanel title={t("verification")} index="02">
            <div><span className="section-index">{t("status")}</span><p className="mt-2 inline-flex rounded-full bg-source-pale px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-source-foreground">{product.status || t("pending")}</p></div>
            <InfoRow label={t("created")} value={<ClientDate date={product.created_at} />} />
            {source?.kkm_approval_number && <InfoRow label={t("kkmApproval")} value={<span className="font-mono text-xs">{source.kkm_approval_number}</span>} />}
          </InfoPanel>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <PanelHeading index="03" title={t("waterProperties")} description={t("waterPropertiesDesc")} />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Metric label={t("phLevel")} value={product.ph_level != null ? Number(product.ph_level).toFixed(1) : "—"} note={product.ph_level == null ? undefined : product.ph_level < 7 ? t("acidic") : product.ph_level > 7 ? t("alkaline") : t("neutral")} />
              <Metric label={t("tds")} value={product.tds != null ? Number(product.tds).toFixed(0) : "—"} unit={product.tds != null ? "mg/L" : undefined} note={t("totalDissolvedSolids")} />
            </div>
          </section>

          <MineralCompositionPanel minerals={minerals} productName={productName} />
          <HealthBenefitsPanel minerals={minerals} phLevel={product.ph_level} tds={product.tds} productName={productName} />

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="p-6 sm:p-8"><PanelHeading index="06" title={t("sourceLocation")} description={t("sourceLocationDesc")} /></div>
            {hasCoordinates ? (
              <ClientMapWrapper lat={Number(source!.lat)} lng={Number(source!.lng)} sourceName={source?.source_name || product.product_name} locationAddress={source?.location_address} height="30rem" />
            ) : (
              <div className="grid min-h-72 place-items-center border-t border-border bg-muted/50 p-8 text-center"><div><RegistryGlyph kind="map" className="mx-auto" /><p className="mt-4 text-sm text-muted-foreground">{t("locationNotAvailable")}</p>{source?.location_address && <p className="mt-1 text-xs text-muted-foreground">{source.location_address}</p>}</div></div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function InfoPanel({ title, index, children }: { title: string; index: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-border bg-card p-6"><div className="flex items-baseline justify-between border-b border-border pb-4"><h2 className="font-display text-2xl tracking-[-0.03em]">{title}</h2><span className="font-mono text-[10px] text-muted-foreground">{index}</span></div><div className="mt-5 space-y-5">{children}</div></section>
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><span className="section-index">{label}</span><p className="mt-1.5 text-sm font-medium leading-6">{value}</p></div>
}

function Metric({ label, value, unit, note }: { label: string; value: string; unit?: string; note?: string }) {
  return <article className="rounded-lg border border-border bg-bone p-6"><p className="section-index">{label}</p><p className="mt-4 font-display text-6xl leading-none tracking-[-0.04em] tabular-nums">{value}{unit && <span className="ml-2 font-sans text-xs tracking-normal text-muted-foreground">{unit}</span>}</p>{note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}</article>
}
