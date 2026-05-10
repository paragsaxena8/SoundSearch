// Server-only configuration — contains secrets, NEVER import from client components

export const GAANA_ENDPOINTS = {
  search: 'https://gaana.com/apiv2',
  detail: 'https://gaana.com/apiv2',
} as const

const GAANA_KEY = process.env.GAANA_KEY_BASE64
if (!GAANA_KEY) {
  throw new Error('GAANA_KEY_BASE64 environment variable is required')
}

export const GAANA_DEFAULTS = {
  country: 'IN',
  page: 0,
  secType: 'track',
  type: 'search',
  limit: 5,
  key: GAANA_KEY,
} as const