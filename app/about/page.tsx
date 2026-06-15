import Link from "next/link"
import { Droplet, Github } from "lucide-react"

export const metadata = {
  title: "About - CariAir",
  description: "About CariAir — Malaysia's Water Source Registry",
}

export default function AboutPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Droplet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-3">About CariAir</h1>
        <p className="text-muted-foreground">
          Malaysia&apos;s open registry for mineral and drinking water sources.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-2">What We Do</h2>
          <p className="text-muted-foreground leading-relaxed">
            CariAir is a community-driven platform that collects and presents data on
            mineral and drinking water brands in Malaysia. We believe consumers should
            have easy access to information about water quality, pH levels, TDS, and mineral
            composition.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Data Sources</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our data comes from public records, product labels, and direct submissions
            from manufacturers. All information is verified before publication.
            If you notice any inaccuracies, please let us know.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Open Source</h2>
          <p className="text-muted-foreground leading-relaxed">
            CariAir is an open-source project. The code is available on GitHub and
            we welcome contributions from the community.
          </p>
          <a
            href="https://github.com/muazhazali/cariair"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:underline"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contribute</h2>
          <p className="text-muted-foreground leading-relaxed">
            Want to add a water source or update information?
            Please open an issue or pull request on our GitHub repository.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t text-center">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
