import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplet, Info } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export const metadata = {
  title: "About - Cariair",
  description: "About Cariair — the Water Source Registry for Malaysia.",
}

export default async function AboutPage() {
  const t = await getTranslations("about")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Hero Section */}
          <div className="space-y-4 text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Droplet className="h-10 w-10 md:h-12 md:w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

        <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              {t("whatWeDoTitle")}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {t("whatWeDoDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("whatWeDoContent1")}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("whatWeDoContent2")}{" "}
              <Link href="/sources" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{t("sourcesLink")}</Link>,{" "}
              <Link href="/map" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{t("mapLink")}</Link>,{" "}
              {t("whatWeDoContent3") === "sections to get started." || t("whatWeDoContent3") === "untuk bermula." ? (
                <><span>{t("learnLink") === "pelajari" ? "dan " : "and "}</span><Link href="/learn" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{t("learnLink")}</Link>{" "}{t("whatWeDoContent3")}</>
              ) : (
                <>{t("whatWeDoContent3")}</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              {t("openSourceTitle")}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {t("openSourceDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("openSourceContent")}{" "}
              <a
                href="https://github.com/muazhazali/cariair"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                GitHub → cariair
              </a>
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
