'use client'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { PLOTLY_BASE_LAYOUT, PLOTLY_CONFIG } from '@/lib/constants'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as any

interface LapData { lap: number; s1: number | null; s2: number | null; s3: number | null; accurate: boolean }
interface DriverData { driver: string; color: string; laps: LapData[] }
interface Props { drivers: Record<string, DriverData> }

export function SectorChart({ drivers }: Props) {
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set(['S1', 'S2', 'S3']))

  const toggle = (s: string) => {
    setActiveSectors(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  const { traces, layout } = useMemo(() => {
    const driverList = Object.values(drivers)
    if (!driverList.length) return { traces: [], layout: {} }

    const SECTORS: Array<{ key: 'S1' | 'S2' | 'S3'; field: 's1' | 's2' | 's3'; dash: string }> = [
      { key: 'S1', field: 's1', dash: 'solid' },
      { key: 'S2', field: 's2', dash: 'dash' },
      { key: 'S3', field: 's3', dash: 'dot' },
    ]

    const traces: any[] = []

    driverList.forEach(d => {
      SECTORS.forEach(({ key, field, dash }) => {
        if (!activeSectors.has(key)) return
        const validLaps = d.laps.filter(l => l[field] != null && l.accurate !== false)
        traces.push({
          x: validLaps.map(l => l.lap),
          y: validLaps.map(l => l[field]!),
          type: 'scatter', mode: 'lines+markers',
          name: `${d.driver} ${key}`,
          line: { color: d.color, width: 1.5, dash: dash as any },
          marker: { color: d.color, size: 4 },
          hovertemplate: `<b>${d.driver} ${key}</b><br>Lap %{x}: %{y:.3f}s<extra></extra>`,
        })
      })
    })

    const layout = {
      ...PLOTLY_BASE_LAYOUT,
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, title: 'Lap' },
      yaxis: { ...PLOTLY_BASE_LAYOUT.yaxis, title: 'Sector time (s)' },
      height: 400,
    }

    return { traces, layout }
  }, [drivers, activeSectors])

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {['S1', 'S2', 'S3'].map(s => (
          <button key={s} onClick={() => toggle(s)}
            className={`px-3 py-1 text-xs rounded-md border transition-all ${activeSectors.has(s) ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
            {s}
          </button>
        ))}
      </div>
      {!Object.keys(drivers).length
        ? <div className="flex items-center justify-center h-[400px] text-[var(--text-muted)] text-sm">Select drivers to view sectors</div>
        : <Plot data={traces as any} layout={layout as any} config={PLOTLY_CONFIG} style={{ width: '100%', height: '400px' }} useResizeHandler />
      }
    </div>
  )
}
