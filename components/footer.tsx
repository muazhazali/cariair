"use client"

import Link from "next/link"
import { Droplet } from "lucide-react"

export function Footer() {
    return (
        <footer className="relative mt-12 overflow-hidden">
            {/* Glassy footer background */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-transparent dark:from-gray-950 dark:to-transparent" />
            <div className="relative border-t border-white/30 dark:border-white/20 bg-white/20 backdrop-blur-xl dark:bg-black/20">
                <div className="container flex flex-col gap-4 py-8 pb-32 md:pb-8 px-4 md:px-6 pb-safe">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md transition-transform group-hover:scale-110">
                                <Droplet className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">CariAir</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium text-center md:text-left">
                            © {new Date().getFullYear()} CariAir. Open-source project for the community.
                        </p>
                        <nav className="flex gap-4">
                            <a href="https://umami.muaz.app/share/XvHNxGlhP9U6iXKY" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium">
                                Analytics
                            </a>
                            <Link href="/about" className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium">
                                About
                            </Link>
                            <Link href="/contribute" className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium">
                                Contribute
                            </Link>
                            <Link href="/learn" className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium">
                                Learn
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    )
}
