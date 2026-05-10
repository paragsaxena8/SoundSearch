'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LIMIT_OPTIONS, type LimitOption } from '@/types'

interface SearchBarProps {
  onSearch: (query: string, limit: LimitOption) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState<LimitOption>(5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), limit)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
      <div className="flex items-center bg-surface border border-border-strong rounded-pill shadow-search overflow-hidden">
        {/* Search input segment */}
        <div className="flex-1 px-5 py-3">
          <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide">
            Search
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter song name..."
            className="block w-full bg-transparent text-text-primary text-base mt-1 outline-none placeholder:text-text-muted"
            aria-label="Search for songs"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border-strong" />

        {/* Limit segment */}
        <div className="px-5 py-3 min-w-[100px]">
          <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide">
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) as LimitOption)}
            className="block w-full bg-transparent text-text-primary text-base mt-1 outline-none cursor-pointer"
            aria-label="Number of results"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-surface">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Search orb */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={cn(
            'w-12 h-12 m-2 rounded-full bg-primary flex items-center justify-center transition-all',
            'hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Search"
        >
          {isLoading ? (
            <svg
              className="animate-spin w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}