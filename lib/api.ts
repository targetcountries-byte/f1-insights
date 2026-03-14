// lib/api.ts — Data fetching helpers
import { REPO_BASE } from './constants'

// GitHub raw URLs: spaces become %20 in directory names
function encodeEvent(event: string): string {
  return event.replace(/ /g, '%20')
}

// Fetch session metadata (small: ~5KB)
export async function fetchSessionMeta(year: number, event: string, session: string) {
  const url = `${REPO_BASE}/${year}/${encodeEvent(event)}/${session}/session_meta.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No data: ${url}`)
  return res.json()
}

// Fetch single driver data (medium: ~200KB per driver)
export async function fetchDriverData(year: number, event: string, session: string, driver: string) {
  const url = `${REPO_BASE}/${year}/${encodeEvent(event)}/${session}/${driver}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No driver data: ${driver}`)
  return res.json()
}

// Fetch all drivers for a session (batched, parallel)
export async function fetchSessionData(year: number, event: string, session: string) {
  // First get metadata to know which drivers exist
  const meta = await fetchSessionMeta(year, event, session)
  const drivers: string[] = meta.drivers ?? []

  // Fetch all driver files in parallel
  const driverResults = await Promise.allSettled(
    drivers.map(d => fetchDriverData(year, event, session, d))
  )

  const data: Record<string, any> = {}
  driverResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      data[drivers[i]] = result.value
    }
  })

  return { ...meta, data }
}

// Fetch only specific drivers (faster for initial render)
export async function fetchDriversData(
  year: number, event: string, session: string, drivers: string[]
) {
  const results = await Promise.allSettled(
    drivers.map(d => fetchDriverData(year, event, session, d))
  )
  const data: Record<string, any> = {}
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') data[drivers[i]] = result.value
  })
  return data
}

export function buildDataUrl(year: number, event: string, session: string, file = 'session_meta.json') {
  return `${REPO_BASE}/${year}/${encodeEvent(event)}/${session}/${file}`
}

// Parse URL search params into session state
export function parseUrlParams(searchParams: URLSearchParams) {
  return {
    year:    parseInt(searchParams.get('y') ?? '2026'),
    event:   searchParams.get('e') ?? '',
    session: searchParams.get('s') ?? 'Q',
    drivers: (searchParams.get('d') ?? '').split(',').filter(Boolean),
    mode:    (searchParams.get('mode') ?? '1') === '2' ? 'expert' : 'essential',
  }
}

// Build shareable URL
export function buildShareUrl(params: {
  year: number, event: string, session: string, drivers?: string[], mode?: string
}) {
  const sp = new URLSearchParams({
    y: String(params.year),
    e: params.event,
    s: params.session,
    ...(params.drivers?.length ? { d: params.drivers.join(',') } : {}),
    ...(params.mode ? { mode: params.mode === 'expert' ? '2' : '1' } : {}),
  })
  return `/?${sp.toString()}`
}
