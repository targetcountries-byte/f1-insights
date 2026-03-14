'use client'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { compoundColor, PLOTLY_BASE_LAYOUT, PLOTLY_CONFIG } from '@/lib/constants'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface LapData { lap: number; time: number | null; stint: number; compound: string; tyre_life: number; accurate: boolean }
interface DriverData { driver: string; color: string; laps: LapData[] }
interface Props { drivers: Record<string, DriverData>; year: number }

export function StintAnalysisChart({ drivers, year }: Props) {
  const { traces, layout } = useMemo(() => {
    const driverList = Object.values(drivers)
    if (!driverList.length) return { traces: [], layout: {} }

    const traces: Partial<Plotly.PlotData>[] = []

    driverList.forEach(d => {
      // Group laps by stint
      const stints = new Map<number, LapData[]>()
      d.laps.forEach(l => {
        if (!stints.has(l.stint)) stints.set(l.stint, [])
        stints.get(l.stint)!.push(l)
      })

      stints.forEach((stintLaps, stintNum) => {
        const validLaps = stintLaps.filter(l => l.time != null && l.accurate !== false)
        if (!validLaps.length) return

        const compound = validLaps[0].compound
        const color = compoundColor(compound, year)

        traces.push({
          x: validLaps.map(l => l.tyre_life),
          y: validLaps.map(l => l.time!),
          type: 'scatter', mode: 'lines+markers',
          name: `${d.driver} S${stintNum} (${compound})`,
          line: { color, width: 2 },
          marker: { color, size: 6, line: { color: d.color, width: 1.5 } },
          hovertemplate:
            `<b>${d.driver}</b> Stint ${stintNum}<br>` +
            `Tyre age: %{x} laps<br>Lap time: <b>%{y:.3f}s</b><br>` +
            `${compound}<extra></extra>`,
        })
      })
    })

    const allTimes = traces.flatMap(t => (t.y as number[] | undefined) ?? []).filter(Boolean)
    const yMin = allTimes.length ? Math.min(...allTimes) * 0.998 : 80
    const yMax = allTimes.length ? Math.min(...allTimes) * 1.025 : 100

    const layout = {
      ...PLOTLY_BASE_LAYOUT,
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, title: 'Tyre age (laps)' },
      yaxis: { ...PLOTLY_BASE_LAYOUT.yaxis, title: 'Lap time (s)', range: [yMin, yMax] },
      height: 420,
    }

    return { traces, layout }
  }, [drivers, year])

  if (!Object.keys(drivers).length) {
    return <div className="flex items-center justify-center h-[420px] text-[var(--text-muted)] text-sm">Select drivers to view stint analysis</div>
  }

  return (
    <Plot data={traces as any} layout={layout as any} config={PLOTLY_CONFIG}
      style={{ width: '100%', height: '420px' }} useResizeHandler />
  )
}
