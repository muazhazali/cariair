import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Award, FlaskRoundIcon as Flask, Droplet, ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

export default async function LearnPage() {
  const t = await getTranslations("learn")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Hero Section */}
          <div className="space-y-4 text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          <Tabs defaultValue="water-types" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1">
              <TabsTrigger value="water-types" className="text-xs md:text-sm py-2 md:py-2.5">{t("tabWaterTypes")}</TabsTrigger>
              <TabsTrigger value="quality-standards" className="text-xs md:text-sm py-2 md:py-2.5">{t("tabQualityStandards")}</TabsTrigger>
              <TabsTrigger value="mineral-benefits" className="text-xs md:text-sm py-2 md:py-2.5">{t("tabMineralBenefits")}</TabsTrigger>
              <TabsTrigger value="testing-methods" className="text-xs md:text-sm py-2 md:py-2.5">{t("tabTestingMethods")}</TabsTrigger>
              <TabsTrigger value="articles" className="text-xs md:text-sm py-2 md:py-2.5">{t("tabArticles")}</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-6 pt-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("tabArticles")}</h2>
                <p className="text-gray-500 dark:text-gray-400">Deep dives into water quality and hydration</p>
              </div>
              <Link href="/learn/guide" className="block group">
                <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center gap-4 bg-blue-50/50 dark:bg-blue-900/20">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t("articleTitle")}</CardTitle>
                      <CardDescription>{t("articleDesc")}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                      {t("articleContent").replace(/[#*]/g, '').substring(0, 300)}...
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                      Read full article
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TabsContent>

            <TabsContent value="water-types" className="space-y-6 pt-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("waterTypesTitle")}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t("waterTypesDesc")}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("mineralWaterTitle")}</CardTitle>
                      <CardDescription>{t("mineralWaterDesc")}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("mineralWaterContent")}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("springWaterTitle")}</CardTitle>
                      <CardDescription>{t("springWaterDesc")}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("springWaterContent")}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("purifiedWaterTitle")}</CardTitle>
                      <CardDescription>{t("purifiedWaterDesc")}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("purifiedWaterContent")}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("drinkingWaterTitle")}</CardTitle>
                      <CardDescription>{t("drinkingWaterDesc")}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("drinkingWaterContent")}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quality-standards" className="space-y-6 pt-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("qualityStandardsTitle")}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t("qualityStandardsDesc")}</p>
              </div>

              <Card className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2 mr-3">
                      <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t("regulatoryFrameworkTitle")}
                  </CardTitle>
                  <CardDescription>{t("regulatoryFrameworkDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t("foodActTitle")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("foodActContent")}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t("mohGuidelinesTitle")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("mohGuidelinesContent")}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{t("msStandardTitle")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("msStandardContent")}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{t("keyParametersTitle")}</CardTitle>
                    <CardDescription>{t("keyParametersDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("tdsTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("tdsContent")}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("phTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("phContent")}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("microbiologicalTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("microbiologicalContent")}</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("labelingTitle")}</CardTitle>
                    <CardDescription>{t("labelingDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("sourceInfoTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("sourceInfoContent")}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("mineralCompTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("mineralCompContent")}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("treatmentTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("treatmentContent")}</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mineral-benefits" className="space-y-6 pt-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("mineralBenefitsTitle")}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t("mineralBenefitsDesc")}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Flask className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("calciumTitle")}</CardTitle>
                      <CardDescription>Ca</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("calciumContent")}</p>
                    <div className="mt-4">
                      <span className="text-xs font-medium">{t("typicalRange")}</span>
                      <p className="text-sm">10-150 mg/L</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Flask className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("magnesiumTitle")}</CardTitle>
                      <CardDescription>Mg</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("magnesiumContent")}</p>
                    <div className="mt-4">
                      <span className="text-xs font-medium">{t("typicalRange")}</span>
                      <p className="text-sm">1-70 mg/L</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Flask className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("potassiumTitle")}</CardTitle>
                      <CardDescription>K</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("potassiumContent")}</p>
                    <div className="mt-4">
                      <span className="text-xs font-medium">{t("typicalRange")}</span>
                      <p className="text-sm">1-5 mg/L</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Flask className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("sodiumTitle")}</CardTitle>
                      <CardDescription>Na</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("sodiumContent")}</p>
                    <div className="mt-4">
                      <span className="text-xs font-medium">{t("typicalRange")}</span>
                      <p className="text-sm">1-20 mg/L (low sodium) to &gt;200 mg/L (high sodium)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Flask className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("bicarbonateTitle")}</CardTitle>
                      <CardDescription>HCO₃</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("bicarbonateContent")}</p>
                    <div className="mt-4">
                      <span className="text-xs font-medium">{t("typicalRange")}</span>
                      <p className="text-sm">50-300 mg/L</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <Flask className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{t("silicaTitle")}</CardTitle>
                      <CardDescription>SiO₂</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("silicaContent")}</p>
                    <div className="mt-4">
                      <span className="text-xs font-medium">{t("typicalRange")}</span>
                      <p className="text-sm">5-40 mg/L</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="testing-methods" className="space-y-6 pt-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("testingMethodsTitle")}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t("testingMethodsDesc")}</p>
              </div>

              <Card className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-xl">{t("labTestingTitle")}</CardTitle>
                  <CardDescription>{t("labTestingDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <h3 className="font-semibold">{t("icpTitle")}</h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("icpContent")}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <h3 className="font-semibold">{t("ionChromatTitle")}</h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("ionChromatContent")}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <h3 className="font-semibold">{t("microbiologicalTestTitle")}</h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("microbiologicalTestContent")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("fieldTestingTitle")}</CardTitle>
                    <CardDescription>{t("fieldTestingDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("digitalTdsTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("digitalTdsContent")}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("phTestTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("phTestContent")}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("hardnessTestTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("hardnessTestContent")}</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("interpretingTitle")}</CardTitle>
                    <CardDescription>{t("interpretingDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("tdsInterpTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <strong>0-50 mg/L:</strong> Very low mineral content
                            <br />
                            <strong>50-150 mg/L:</strong> Low mineral content
                            <br />
                            <strong>150-500 mg/L:</strong> Medium mineral content
                            <br />
                            <strong>500+ mg/L:</strong> High mineral content
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("phScaleTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <strong>Below 6.5:</strong> Acidic (may taste sour)
                            <br />
                            <strong>6.5-7.5:</strong> Neutral (ideal range)
                            <br />
                            <strong>Above 7.5:</strong> Alkaline (may taste bitter)
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 p-1">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div>
                          <span className="font-medium">{t("waterHardnessTitle")}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <strong>0-60 mg/L:</strong> Soft water
                            <br />
                            <strong>61-120 mg/L:</strong> Moderately hard
                            <br />
                            <strong>121-180 mg/L:</strong> Hard
                            <br />
                            <strong>180+ mg/L:</strong> Very hard
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

