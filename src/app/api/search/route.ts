import { NextRequest, NextResponse } from 'next/server'
import { searchSongs } from '@/lib/gaana'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  try {
    const songs = await searchSongs(query, limit)
    return NextResponse.json(songs)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search songs' }, { status: 500 })
  }
}