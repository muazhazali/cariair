import Link from "next/link"
import { Droplet } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">CariAir</span>
        </Link>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CariAir. Open-source project.
        </p>

        {/* Links */}
        <nav className="flex items-center gap-4 text-sm">
          <a
            href="https://github.com/muazhazali/cariair"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </footer>
  )
}
