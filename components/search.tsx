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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
        <SearchIcon className="h-5 w-5" />
      </div>
      <Input
        type="search"
        placeholder="Search by brand, location, mineral content..."
        className="w-full pl-12 pr-24 h-14 text-base shadow-lg border-gray-200 dark:border-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 bg-white dark:bg-gray-950"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        size="default"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Search
      </Button>
    </form>
  )
}

