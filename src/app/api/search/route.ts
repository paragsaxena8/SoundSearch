import { NextRequest, NextResponse } from 'next/server'
import { searchSongs } from '@/lib/gaana'

const MAX_QUERY_LENGTH = 200
const MAX_LIMIT = 50

// Simple in-memory rate limiter (per-IP, resets every 60s)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_WINDOW_MS = 60_000
const RATE_MAX_REQUESTS = 30

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetTime <= now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_MAX_REQUESTS
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const searchParams = request.nextUrl.searchParams
  const rawQuery = searchParams.get('q')

  // Validate query
  if (!rawQuery || !rawQuery.trim()) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }
  const query = rawQuery.trim()
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 })
  }

  // Validate and clamp limit
  const rawLimit = parseInt(searchParams.get('limit') || '10', 10)
  const limit = Number.isNaN(rawLimit) ? 10 : Math.min(Math.max(rawLimit, 1), MAX_LIMIT)

  try {
    const songs = await searchSongs(query, limit)
    return NextResponse.json(songs, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to search songs' }, { status: 500 })
  }
}