"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"

export function Search() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full group">
      {/* Glassy search container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-black/20">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10" />

        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
            <SearchIcon className="h-5 w-5" />
          </div>
          <Input
            type="search"
            placeholder="Search by brand, location, mineral content..."
            className="w-full pl-12 pr-24 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            size="default"
            className="absolute right-2 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 border-0 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  )
}

