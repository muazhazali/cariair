import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("learn")
    return {
        title: `${t("articleTitle")} | CariAir`,
        description: t("articleDesc"),
        keywords: ["mineral water Malaysia", "pH level guide", "water quality Malaysia", "Spritzer vs Cactus", "best mineral water"],
    }
}

export default async function GuidePage() {
    const t = await getTranslations("learn")

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container px-4 py-12 md:px-6 md:py-16">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        <Link href="/learn">{t("title")}</Link>
                    </div>

                    <div className="space-y-4 text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            {t("articleTitle")}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto italic">
                            {t("articleDesc")}
                        </p>
                    </div>

                    <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-blue-600 dark:bg-blue-900 py-4" />
                        <CardContent className="p-8 md:p-12 prose prose-blue dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                                    h4: ({ node, ...props }) => <h4 className="text-xl font-semibold mt-6 mb-3 text-blue-600 dark:text-blue-400" {...props} />,
                                    p: ({ node, ...props }) => <p className="leading-7 mb-4" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                                }}
                            >
                                {t("articleContent")}
                            </ReactMarkdown>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-12">
                        <h2 className="text-2xl font-bold mb-4">Ready to compare?</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/sources"
                                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300"
                            >
                                Browse All Sources
                            </Link>
                            <Link
                                href="/map"
                                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800"
                            >
                                Explore Map
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
