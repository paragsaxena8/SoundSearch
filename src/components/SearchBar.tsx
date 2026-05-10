'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { LimitOption } from '@/types'

interface SearchBarProps {
  onSearch: (query: string, limit: LimitOption) => void
  isLoading: boolean
  recentSearches: string[]
  onClearRecentSearches: () => void
  defaultLimit?: LimitOption
}

export function SearchBar({ onSearch, isLoading, recentSearches, onClearRecentSearches, defaultLimit = 5 }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), defaultLimit)
      setIsDropdownOpen(false)
    }
  }

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery)
    onSearch(searchQuery, defaultLimit)
    setIsDropdownOpen(false)
  }

  const handleClearAll = () => {
    onClearRecentSearches()
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showDropdown = isDropdownOpen && recentSearches.length > 0 && !query.trim()

  return (
    <div className="w-full max-w-[600px]" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="flex items-center bg-surface border-2 border-border shadow-brutal overflow-hidden">
          {/* Search input */}
          <div className="flex-1 px-5 py-3 relative">
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest">
              Search
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Enter song name..."
                className="block w-full bg-transparent text-text-primary text-base font-medium outline-none placeholder:text-text-muted pr-6"
                aria-label="Search for songs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={cn(
              'w-12 h-12 m-2 border-2 border-border bg-primary flex items-center justify-center transition-all font-bold',
              'hover:shadow-brutal-hover hover:-translate-x-[1px] hover:-translate-y-[1px]',
              'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal disabled:hover:translate-x-0 disabled:hover:translate-y-0'
            )}
            aria-label="Search"
          >
            {isLoading ? (
              <svg
                className="animate-spin w-5 h-5 text-border"
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            )}
          </button>
        </div>

        {/* Recent searches dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border-2 border-border shadow-brutal-lg z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-border bg-surface-elevated">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Recent Searches</span>
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-error hover:text-error/80 uppercase tracking-wide"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {recentSearches.map((searchQuery) => (
                <button
                  key={searchQuery}
                  type="button"
                  onClick={() => handleRecentSearchClick(searchQuery)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary/10 transition-colors group border-b border-border/30 last:border-b-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-text-muted shrink-0">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <span className="text-sm font-medium text-text-primary truncate flex-1">{searchQuery}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      </form>
    </div>
  )
}