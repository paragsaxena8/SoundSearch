// Server-only configuration — contains secrets, NEVER import from client components

export const GAANA_ENDPOINTS = {
  search: 'https://gaana.com/apiv2',
  detail: 'https://gaana.com/apiv2',
} as const

export const GAANA_DEFAULTS = {
  country: 'IN',
  page: 0,
  secType: 'track',
  type: 'search',
  limit: 5,
  key: process.env.GAANA_KEY_BASE64 || '',
} as const