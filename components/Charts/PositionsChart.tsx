'use client'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { PLOTLY_BASE_LAYOUT, PLOTLY_CONFIG } from '@/lib/constants'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface LapData { lap: number; pos: number | null }
interface DriverData { driver: string; color: string; laps: LapData[] }
interface Props { drivers: Record<string, DriverData> }

export function PositionsChart({ drivers }: Props) {
  const { traces, layout } = useMemo(() => {
    const driverList = Object.values(drivers)
    if (!driverList.length) return { traces: [], layout: {} }

    const traces: Partial<Plotly.PlotData>[] = driverList.map(d => ({
      x: d.laps.map(l => l.lap),
      y: d.laps.map(l => l.pos),
      type: 'scatter', mode: 'lines+markers', name: d.driver,
      line: { color: d.color, width: 2 },
      marker: { color: d.color, size: 5 },
      hovertemplate: `<b>${d.driver}</b><br>Lap %{x}<br>Position: <b>P%{y}</b><extra></extra>`,
      connectgaps: false,
    }))

    const layout = {
      ...PLOTLY_BASE_LAYOUT,
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, title: 'Lap' },
      yaxis: {
        ...PLOTLY_BASE_LAYOUT.yaxis,
        title: 'Position', autorange: 'reversed' as const,
        dtick: 1, range: [20.5, 0.5],
      },
      height: 440,
    }

    return { traces, layout }
  }, [drivers])

  if (!Object.keys(drivers).length) {
    return <div className="flex items-center justify-center h-[440px] text-[var(--text-muted)] text-sm">Select drivers to view positions</div>
  }

  return (
    <Plot data={traces as any} layout={layout as any} config={PLOTLY_CONFIG}
      style={{ width: '100%', height: '440px' }} useResizeHandler />
  )
}
