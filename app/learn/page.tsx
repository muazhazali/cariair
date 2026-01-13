import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Award, FlaskRoundIcon as Flask, Droplet } from "lucide-react"

export default function LearnPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Learn About Mineral Water</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Educational resources about water quality, standards, and terminology
          </p>
        </div>

        <Tabs defaultValue="water-types">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="water-types">Water Types</TabsTrigger>
            <TabsTrigger value="quality-standards">Quality Standards</TabsTrigger>
            <TabsTrigger value="mineral-benefits">Mineral Benefits</TabsTrigger>
            <TabsTrigger value="testing-methods">Testing Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="water-types" className="space-y-6 pt-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Types of Bottled Water</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Understanding the different classifications of bottled water available in Malaysia
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Droplet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mineral Water</CardTitle>
                    <CardDescription>Natural water containing minerals</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mineral water comes from underground sources and contains naturally occurring minerals and trace
                    elements. In Malaysia, it must contain at least 150mg/L of total dissolved solids (TDS) to be
                    classified as mineral water. It cannot be treated except for filtration, ozonation, or carbonation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Droplet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Spring Water</CardTitle>
                    <CardDescription>Water from underground springs</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Spring water comes from underground formations and flows naturally to the surface. Unlike mineral
                    water, there's no minimum TDS requirement for spring water. It must be collected at the spring or
                    through a borehole tapping the underground formation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Droplet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Purified Water</CardTitle>
                    <CardDescription>Water treated to remove impurities</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Purified water can come from any source, including tap water, but undergoes processes like
                    distillation, deionization, reverse osmosis, or other suitable processes to meet purity standards.
                    Most minerals are removed during purification, resulting in very low TDS levels.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Droplet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Drinking Water</CardTitle>
                    <CardDescription>General category for potable water</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This is a broad category that includes water suitable for human consumption. In Malaysia, it must
                    meet the standards set by the Ministry of Health but doesn't have the specific source requirements
                    of mineral or spring water. It may be treated with various processes to ensure safety.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality-standards" className="space-y-6 pt-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Water Quality Standards in Malaysia</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Regulatory standards and requirements for bottled water in Malaysia
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Malaysian Regulatory Framework
                </CardTitle>
                <CardDescription>Key regulations governing bottled water in Malaysia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Food Act 1983 and Food Regulations 1985</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The primary legislation governing all food products in Malaysia, including bottled water. It sets
                    standards for safety, quality, labeling, and packaging requirements.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Ministry of Health Guidelines</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The Ministry of Health Malaysia (MOH) provides specific guidelines for natural mineral water and
                    packaged drinking water, covering microbiological, chemical, and physical parameters.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Malaysian Standard MS 2095:2014</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This standard specifies requirements for natural mineral water, including source protection,
                    exploitation techniques, treatments, and packaging operations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Quality Parameters</CardTitle>
                  <CardDescription>Important measurements for water quality</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <Droplet className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Total Dissolved Solids (TDS)</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mineral water must contain at least 150mg/L of TDS. Higher TDS generally indicates more
                          minerals in the water.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <Droplet className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">pH Level</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          The acceptable pH range for bottled water is typically 6.5 to 8.5, with 7.0 being neutral.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <Droplet className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Microbiological Parameters</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Strict limits on bacteria, pathogens, and other microorganisms to ensure safety.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Labeling Requirements</CardTitle>
                  <CardDescription>Mandatory information on bottled water labels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <Droplet className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Source Information</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Name and location of the water source must be clearly stated on the label.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <Droplet className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Mineral Composition</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mineral water labels must list the analytical composition showing mineral content.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <Droplet className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Treatment Methods</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Any treatments applied to the water must be disclosed on the label.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mineral-benefits" className="space-y-6 pt-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Health Benefits of Minerals in Water</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Understanding the potential health benefits of different minerals found in water
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Flask className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Calcium</CardTitle>
                    <CardDescription>Ca</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Essential for bone health, muscle function, and nerve transmission. Calcium-rich water may
                    contribute to daily calcium intake, potentially supporting bone density and cardiovascular health.
                  </p>
                  <div className="mt-4">
                    <span className="text-xs font-medium">Typical range in mineral water:</span>
                    <p className="text-sm">10-150 mg/L</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Flask className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Magnesium</CardTitle>
                    <CardDescription>Mg</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Involved in over 300 enzymatic reactions in the body. Magnesium supports muscle and nerve function,
                    blood glucose control, and blood pressure regulation. It may help prevent migraines and reduce
                    stress.
                  </p>
                  <div className="mt-4">
                    <span className="text-xs font-medium">Typical range in mineral water:</span>
                    <p className="text-sm">1-70 mg/L</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Flask className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Potassium</CardTitle>
                    <CardDescription>K</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Critical for heart function, muscle contractions, and nerve signaling. Potassium helps maintain
                    fluid balance and may help lower blood pressure by counteracting the effects of sodium.
                  </p>
                  <div className="mt-4">
                    <span className="text-xs font-medium">Typical range in mineral water:</span>
                    <p className="text-sm">1-5 mg/L</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Flask className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Sodium</CardTitle>
                    <CardDescription>Na</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Regulates fluid balance, blood pressure, and nerve and muscle function. While necessary for health,
                    those on sodium-restricted diets should check sodium content in mineral water.
                  </p>
                  <div className="mt-4">
                    <span className="text-xs font-medium">Typical range in mineral water:</span>
                    <p className="text-sm">1-20 mg/L (low sodium) to &gt;200 mg/L (high sodium)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Flask className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Bicarbonate</CardTitle>
                    <CardDescription>HCO₃</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Helps neutralize acid in the body and may aid digestion. Bicarbonate-rich waters are often
                    recommended for acid reflux and may help buffer lactic acid during exercise.
                  </p>
                  <div className="mt-4">
                    <span className="text-xs font-medium">Typical range in mineral water:</span>
                    <p className="text-sm">50-300 mg/L</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Flask className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Silica</CardTitle>
                    <CardDescription>SiO₂</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    May support bone health, skin elasticity, and hair strength. Some research suggests silica may help
                    protect against aluminum absorption and neurodegenerative diseases.
                  </p>
                  <div className="mt-4">
                    <span className="text-xs font-medium">Typical range in mineral water:</span>
                    <p className="text-sm">5-40 mg/L</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing-methods" className="space-y-6 pt-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Water Testing Methods</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Common techniques used to analyze and verify water quality
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Laboratory Testing Procedures</CardTitle>
                <CardDescription>Professional methods for comprehensive water analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                    <h3 className="font-semibold">Inductively Coupled Plasma (ICP) Analysis</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      A highly accurate method for measuring mineral content in water. ICP can detect multiple elements
                      simultaneously at very low concentrations, making it ideal for detailed mineral analysis.
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                    <h3 className="font-semibold">Ion Chromatography</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Used to measure anions like chloride, fluoride, and sulfate in water. This method separates ions
                      based on their interaction with a resin and provides precise measurements of their concentrations.
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                    <h3 className="font-semibold">Microbiological Testing</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Includes tests for total coliform bacteria, E. coli, and other microorganisms to ensure water
                      safety. Methods include membrane filtration, most probable number (MPN), and plate count
                      techniques.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Field Testing Methods</CardTitle>
                  <CardDescription>On-site testing techniques for quick analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Digital TDS Meters</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Handheld devices that measure the total dissolved solids in water by detecting electrical
                          conductivity. Quick and easy to use but less accurate than laboratory methods.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">pH Test Strips and Meters</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Used to measure the acidity or alkalinity of water. Digital pH meters provide more precise
                          readings than test strips but require calibration.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Hardness Test Kits</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Chemical tests that measure calcium and magnesium levels in water, indicating water hardness.
                          Usually involve titration with a color-changing indicator.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Understanding Test Results</CardTitle>
                  <CardDescription>How to interpret water quality measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">TDS Interpretation</span>
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
                      <span className="rounded-full bg-primary/10 p-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">pH Scale</span>
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
                      <span className="rounded-full bg-primary/10 p-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <span className="font-medium">Water Hardness</span>
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
  )
}

