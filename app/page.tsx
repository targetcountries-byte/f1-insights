'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SessionSelector } from '@/components/Selectors/SessionSelector'
import { LapTimesChart } from '@/components/Charts/LapTimesChart'
import { TyreStrategyChart } from '@/components/Charts/TyreStrategyChart'
import { SpeedTraceChart } from '@/components/Charts/SpeedTraceChart'
import { GGPlotChart } from '@/components/Charts/GGPlotChart'
import { PositionsChart } from '@/components/Charts/PositionsChart'
import { StintAnalysisChart } from '@/components/Charts/StintAnalysisChart'
import { SectorChart } from '@/components/Charts/SectorChart'
import { useSessionStore } from '@/lib/store'
import { fetchSessionData, buildShareUrl } from '@/lib/api'
import { Share2, RefreshCw } from 'lucide-react'

type Tab = 'lap-times' | 'tyre-strategy' | 'speed-trace' | 'gg-plot' | 'positions' | 'stints' | 'sectors'

const ESSENTIAL_TABS: Tab[] = ['lap-times', 'tyre-strategy', 'stints', 'sectors']
const EXPERT_TABS: Tab[] = [...ESSENTIAL_TABS, 'speed-trace', 'gg-plot', 'positions']

const TAB_LABELS: Record<Tab, string> = {
  'lap-times':     'Lap Times',
  'tyre-strategy': 'Tyre Strategy',
  'speed-trace':   'Speed Trace',
  'gg-plot':       'GG Plot',
  'positions':     'Positions',
  'stints':        'Stint Analysis',
  'sectors':       'Sector Times',
}

function buildStints(laps: any[]) {
  const stintMap = new Map<number, any>()
  laps.forEach((l: any) => {
    const n = l.stint ?? 1
    if (!stintMap.has(n)) stintMap.set(n, { stint: n, compound: l.compound, start_lap: l.lap, end_lap: l.lap, laps: 0, fresh: l.fresh_tyre ?? true })
    const s = stintMap.get(n)!
    s.end_lap = l.lap
    s.laps = s.end_lap - s.start_lap + 1
  })
  return Array.from(stintMap.values())
}

function DashboardInner() {
  const searchParams = useSearchParams()
  const store = useSessionStore()
  const { year, event, session, drivers, fuelCorr, showTrackStatus, mode,
          setYear, setEvent, setSession } = store

  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [activeTab, setActiveTab]     = useState<Tab>('lap-times')
  const [urlApplied, setUrlApplied]   = useState(false)

  // ── Apply URL params once on first load ──────────────────────────────
  useEffect(() => {
    if (urlApplied) return
    const y = searchParams.get('y')
    const e = searchParams.get('e')
    const s = searchParams.get('s')
    if (y) setYear(parseInt(y))
    if (e) setEvent(e)
    if (s) setSession(s)
    setUrlApplied(true)
  }, [searchParams, urlApplied, setYear, setEvent, setSession])

  // ── Fetch session data when year/event/session changes ───────────────
  const loadData = useCallback(async () => {
    if (!event || !session) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSessionData(year, event, session)
      setSessionData(data)
    } catch {
      setError('No data yet — data is published ~30 min after each session ends.')
    } finally {
      setLoading(false)
    }
  }, [year, event, session])

  useEffect(() => { loadData() }, [loadData])

  // ── Auto-select all drivers if none selected and data is loaded ───────
  useEffect(() => {
    if (sessionData && drivers.length === 0 && sessionData.drivers?.length) {
      // Auto-select first 5 drivers
      const top5 = sessionData.drivers.slice(0, 5)
      top5.forEach((d: string) => store.addDriver(d))
    }
  }, [sessionData])

  // ── Filter to selected drivers ────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredData: Record<string, any> = sessionData ? Object.fromEntries(
    Object.entries(sessionData.data ?? {}).filter(([k]) =>
      drivers.length === 0 || drivers.includes(k)
    )
  ) : {}

  const hasData    = Object.keys(filteredData).length > 0
  const totalLaps  = sessionData?.total_laps ?? 60
  const trackStatus = sessionData?.track_status ?? []

  const shareUrl = buildShareUrl({ year, event, session, drivers, mode })

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 shrink-0 p-4 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-[var(--bg-secondary)]">
        <SessionSelector />
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.origin + shareUrl) }}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-white/30 transition-all">
          <Share2 size={12} /> Copy share link
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-base font-semibold">{event || 'Select an event'}</h1>
            <p className="text-xs text-[var(--text-muted)]">
              {year} · {session} · {Object.keys(filteredData).length} driver{Object.keys(filteredData).length !== 1 ? 's' : ''}
              {sessionData?.drivers?.length ? ` · ${sessionData.drivers.length} available` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <RefreshCw size={14} className="animate-spin text-[var(--text-muted)]" />}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-sm text-yellow-300">
            {error}
          </div>
        )}

        {/* Available drivers pills */}
        {sessionData?.drivers?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sessionData.drivers.map((d: string) => {
              const active = drivers.includes(d)
              const color = sessionData.data?.[d]?.color ?? '#888'
              return (
                <button key={d}
                  onClick={() => active ? store.removeDriver(d) : store.addDriver(d)}
                  className="px-2.5 py-1 text-xs font-mono rounded-md border transition-all"
                  style={{
                    borderColor: active ? color : 'var(--border)',
                    color: active ? color : 'var(--text-muted)',
                    background: active ? color + '22' : 'transparent',
                  }}>
                  {d}
                </button>
              )
            })}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-[var(--border)] overflow-x-auto pb-px">
          {(mode === 'expert' ? EXPERT_TABS : ESSENTIAL_TABS).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[var(--accent)] text-white'
                  : 'border-transparent text-[var(--text-muted)] hover:text-white'
              }`}>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div className="chart-container flex-1">
          {!hasData && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--text-muted)]">
              <span className="text-4xl opacity-20">⬡</span>
              <p className="text-sm">Select a year, event and session — drivers load automatically</p>
            </div>
          )}

          {hasData && (
            <>
              {activeTab === 'lap-times' && (
                <LapTimesChart drivers={filteredData} year={year}
                  trackStatus={trackStatus} showTrackStatus={showTrackStatus} fuelCorr={fuelCorr} />
              )}
              {activeTab === 'tyre-strategy' && (
                <TyreStrategyChart
                  drivers={Object.fromEntries(
                    Object.entries(filteredData).map(([k, v]: [string, any]) => [k, {
                      ...v, stints: buildStints(v.laps ?? []),
                    }])
                  )}
                  year={year} totalLaps={totalLaps} />
              )}
              {activeTab === 'speed-trace' && (
                <SpeedTraceChart
                  drivers={Object.fromEntries(
                    Object.entries(filteredData).map(([k, v]: [string, any]) => [k, {
                      ...v,
                      tel: (v.laps ?? []).find((l: any) => l.accurate !== false && l.tel?.length > 0)?.tel ?? [],
                    }])
                  )}
                  year={year} />
              )}
              {activeTab === 'gg-plot' && (
                <GGPlotChart
                  drivers={Object.fromEntries(
                    Object.entries(filteredData).map(([k, v]: [string, any]) => [k, {
                      ...v,
                      tel: (v.laps ?? []).find((l: any) => l.accurate !== false && l.tel?.length > 0)?.tel ?? [],
                    }])
                  )} />
              )}
              {activeTab === 'positions'  && <PositionsChart  drivers={filteredData as any} />}
              {activeTab === 'stints'     && <StintAnalysisChart drivers={filteredData as any} year={year} />}
              {activeTab === 'sectors'    && <SectorChart     drivers={filteredData as any} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[var(--text-muted)]">Loading...</div>}>
      <DashboardInner />
    </Suspense>
  )
}
