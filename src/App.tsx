import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { SearchBar } from './components/SearchBar'
import { SongCard } from './components/SongCard'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { useSearch } from './hooks/useSearch'

function App() {
  const { songs, isLoading, error, search } = useSearch()
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string, limit: typeof import('./types/song').LIMIT_OPTIONS[number]) => {
    setHasSearched(true)
    await search(query, limit)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="flex flex-col items-center px-6 py-16">
        <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.02em]">
          Find your music
        </h1>
        <p className="text-base text-text-secondary mt-2 mb-8">
          Search millions of songs from Gaana
        </p>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </main>

      <section className="px-6 pb-16">
        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : error ? (
          <ErrorState message={error} />
        ) : !hasSearched ? (
          <EmptyState />
        ) : songs.length === 0 ? (
          <ErrorState message="No songs found. Try a different search." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App