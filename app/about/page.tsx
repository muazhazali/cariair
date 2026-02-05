import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplet, Info } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "About - Cariair",
  description: "About Cariair — the Water Source Registry for Malaysia.",
}

export default function AboutPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">About Cariair</h1>
          <p className="text-gray-500 dark:text-gray-400">
            The Water Source Registry for Malaysia
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-primary" />
              What we do
            </CardTitle>
            <CardDescription>
              Cariair is the definitive registry of mineral and drinking water sources in Malaysia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              We help you discover verified water sources, compare products, and learn about water quality,
              standards, and mineral composition — all in one place.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Explore the <Link href="/sources" className="font-medium text-primary hover:underline">sources</Link>,{" "}
              <Link href="/map" className="font-medium text-primary hover:underline">map</Link>, and{" "}
              <Link href="/learn" className="font-medium text-primary hover:underline">learn</Link> sections to get started.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Open source
            </CardTitle>
            <CardDescription>
              Built for transparency and community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Cariair is open source. You can view the code, contribute, or run your own instance.{" "}
              <a
                href="https://github.com/muazhazali/cariair"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                GitHub → cariair
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
