import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { BrandMark } from "./main-nav"

export async function Footer() {
  const nav = await getTranslations("nav")
  const home = await getTranslations("home")
  const about = await getTranslations("about")

  return (
    <footer className="border-t border-border bg-[#ece9e1]">
      <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3">
              <BrandMark small />
              <span className="font-display text-2xl tracking-[-0.025em]">CariAir</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              {home("heroSubtitle")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer navigation">
            <Link href="/#sources" className="text-muted-foreground transition-colors hover:text-foreground">{nav("allSources")}</Link>
            <Link href="/learn/guide" className="text-muted-foreground transition-colors hover:text-foreground">{nav("learn")}</Link>
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">{nav("about")}</Link>
            <a href="https://github.com/muazhazali/cariair" target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">GitHub</a>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-foreground/10 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CariAir. Open-source project.</p>
          <p className="font-mono uppercase tracking-[0.1em]">{about("openSourceTitle")}</p>
        </div>
      </div>
    </footer>
  )
}
