// lib/api.ts — Data fetching helpers
import { REPO_BASE } from './constants'

export async function fetchSessionData(year: number, event: string, session: string) {
  const url = `${REPO_BASE}/${year}/${encodeURIComponent(event)}/${session}/session.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No data: ${url}`)
  return res.json()
}

export async function fetchLapTimes(year: number, event: string, session: string) {
  const url = `${REPO_BASE}/${year}/${encodeURIComponent(event)}/${session}/laptimes.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No lap times: ${url}`)
  return res.json()
}

export function buildDataUrl(year: number, event: string, session: string, file = 'session.json') {
  return `${REPO_BASE}/${year}/${encodeURIComponent(event)}/${session}/${file}`
}

// Parse URL search params into session state
export function parseUrlParams(searchParams: URLSearchParams) {
  return {
    year:    parseInt(searchParams.get('y') ?? '2026'),
    event:   searchParams.get('e') ?? 'Chinese Grand Prix',
    session: searchParams.get('s') ?? 'Q',
    drivers: (searchParams.get('d') ?? '').split(',').filter(Boolean),
    mode:    (searchParams.get('mode') ?? '1') === '2' ? 'expert' : 'essential',
    showTrackStatus: searchParams.get('trackStatus') !== 'false',
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
