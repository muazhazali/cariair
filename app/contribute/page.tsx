import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitPullRequest, FileEdit, AlertTriangle, Github, Users } from "lucide-react"

export default function ContributePage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Contribute to the Registry</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Help us build the most comprehensive database of Malaysian water sources
          </p>
        </div>

        <Tabs defaultValue="how-to-contribute">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="how-to-contribute">How to Contribute</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="how-to-contribute" className="space-y-6 pt-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Contributing to the Registry</h2>
              <p className="text-gray-500 dark:text-gray-400">
                This project is open-source and community-driven. All data is stored in JSON files in our GitHub
                repository, making it easy for anyone to contribute.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GitPullRequest className="mr-2 h-5 w-5" />
                    GitHub Pull Request
                  </CardTitle>
                  <CardDescription>The standard way to contribute</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Fork the repository on GitHub</li>
                    <li>Create a new branch for your changes</li>
                    <li>Add or update water source data files</li>
                    <li>Submit a pull request with your changes</li>
                    <li>Wait for review and approval</li>
                  </ol>
                  <Link
                    href="https://github.com/your-username/malaysia-water-registry"
                    target="_blank"
                    className="inline-flex items-center text-sm font-medium text-blue-500 hover:underline"
                  >
                    <Github className="mr-1 h-4 w-4" />
                    View on GitHub
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileEdit className="mr-2 h-5 w-5" />
                    Issue Submission
                  </CardTitle>
                  <CardDescription>For those not familiar with Git</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Create a GitHub account if you don't have one</li>
                    <li>Open an issue in our repository</li>
                    <li>Use the appropriate issue template</li>
                    <li>Provide all required information</li>
                    <li>A maintainer will add your data</li>
                  </ol>
                  <Link
                    href="https://github.com/your-username/malaysia-water-registry/issues/new/choose"
                    target="_blank"
                    className="inline-flex items-center text-sm font-medium text-blue-500 hover:underline"
                  >
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    Create an Issue
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold">Join Our Community</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Connect with other contributors and maintainers to discuss improvements, coordinate efforts, and get
                    help with your contributions.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="https://github.com/your-username/malaysia-water-registry/discussions"
                      target="_blank"
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium dark:bg-gray-800"
                    >
                      GitHub Discussions
                    </Link>
                    <Link
                      href="#"
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium dark:bg-gray-800"
                    >
                      Telegram Group
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 pt-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Contribution Templates</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Use these templates to ensure your contributions follow the project's data structure.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>New Water Source Template</CardTitle>
                <CardDescription>Use this template when adding a new water source to the registry</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
                  {`{
  "id": "unique-id",
  "name": "Brand Name",
  "company": "Parent Company",
  "country": "Malaysia",
  "website": "https://example.com",
  "location": {
    "state": "State Name",
    "district": "District Name",
    "coordinates": [0.0000, 0.0000]
  },
  "type": "Mineral",
  "properties": {
    "ph": 7.0,
    "tds": 100,
    "hardness": "Soft"
  },
  "minerals": {
    "calcium": 0.0,
    "magnesium": 0.0,
    "potassium": 0.0,
    "sodium": 0.0,
    "bicarbonate": 0.0,
    "chloride": 0.0,
    "sulfate": 0.0
  },
  "bottleTypes": [
    {
      "size": "500ml",
      "material": "PET",
      "price": 0.00,
      "lastUpdated": "YYYY-MM-DD"
    }
  ],
  "image": "/placeholder.svg",
  "lastVerified": "YYYY-MM-DD",
  "verifiedBy": "your-github-username"
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Update Template</CardTitle>
                <CardDescription>Use this template when updating prices for an existing water source</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
                  {`{
  "id": "existing-id",
  "bottleTypes": [
    {
      "size": "500ml",
      "material": "PET",
      "price": 0.00,
      "lastUpdated": "YYYY-MM-DD",
      "retailers": ["Retailer Name"]
    }
  ],
  "lastVerified": "YYYY-MM-DD",
  "verifiedBy": "your-github-username"
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Correction Template</CardTitle>
                <CardDescription>Use this template when correcting errors in existing data</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
                  {`{
  "id": "existing-id",
  "fieldToCorrect": "corrected value",
  "reason": "Brief explanation of the correction",
  "source": "URL or reference for the correct information",
  "lastVerified": "YYYY-MM-DD",
  "verifiedBy": "your-github-username"
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-6 pt-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Contribution Guidelines</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Follow these guidelines to ensure your contributions meet our quality standards.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
                <h3 className="text-lg font-semibold">Data Quality Standards</h3>
                <ul className="mt-4 list-disc pl-5 space-y-2">
                  <li>All data must be accurate and verifiable</li>
                  <li>Include sources for your information when possible</li>
                  <li>Use official product labels or company websites as primary sources</li>
                  <li>Report actual measurements rather than marketing claims when possible</li>
                  <li>Include the date when the information was collected or verified</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
                <h3 className="text-lg font-semibold">Image Guidelines</h3>
                <ul className="mt-4 list-disc pl-5 space-y-2">
                  <li>Bottle images should be transparent PNG files with 500px height</li>
                  <li>Logo images should be 200x200px with transparent background</li>
                  <li>Images should be optimized for web (compressed without quality loss)</li>
                  <li>Only use images that you have the right to share or that are freely licensed</li>
                  <li>Include proper attribution for images when required</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
                <h3 className="text-lg font-semibold">Review Process</h3>
                <ol className="mt-4 list-decimal pl-5 space-y-2">
                  <li>All contributions are reviewed by project maintainers</li>
                  <li>Reviewers check for data accuracy, completeness, and formatting</li>
                  <li>You may be asked to provide additional information or make corrections</li>
                  <li>Once approved, your contribution will be merged into the main database</li>
                  <li>Your GitHub username will be credited in the contribution history</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

