'use client'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { PLOTLY_BASE_LAYOUT, PLOTLY_CONFIG } from '@/lib/constants'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface TelPoint { d: number; sp: number; th: number; br: boolean; g: number; r: number; drs?: number; aa?: number }
interface DriverTel { driver: string; color: string; tel: TelPoint[] }
interface Props { drivers: Record<string, DriverTel>; year: number; selectedLap?: number }

export function SpeedTraceChart({ drivers, year }: Props) {
  const { traces, layout } = useMemo(() => {
    const driverList = Object.values(drivers)
    if (!driverList.length) return { traces: [], layout: {} }

    const traces: Partial<Plotly.PlotData>[] = []

    driverList.forEach(d => {
      if (!d.tel?.length) return
      const x = d.tel.map(t => t.d)

      // Speed
      traces.push({
        x, y: d.tel.map(t => t.sp),
        type: 'scatter', mode: 'lines', name: `${d.driver} Speed`,
        line: { color: d.color, width: 2 },
        yaxis: 'y',
        hovertemplate: `<b>${d.driver}</b><br>Dist: %{x:.0f}m<br>Speed: <b>%{y:.0f} km/h</b><extra></extra>`,
      })

      // Throttle (subplot y2)
      traces.push({
        x, y: d.tel.map(t => t.th),
        type: 'scatter', mode: 'lines', name: `${d.driver} Throttle`,
        line: { color: d.color, width: 1.5, dash: 'dot' },
        yaxis: 'y2', showlegend: false,
        hovertemplate: `Throttle: %{y:.0f}%<extra></extra>`,
      })

      // Brake overlay
      const brakeSegments = d.tel.reduce<[number, number][]>((acc, t, i) => {
        if (t.br && i > 0) {
          const prev = d.tel[i - 1]
          acc.push([prev.d, t.d])
        }
        return acc
      }, [])
      brakeSegments.forEach(([x0, x1]) => {
        // Will be drawn as shapes instead
      })

      // DRS or ActiveAero indicator
      const aeroKey = year >= 2026 ? 'aa' : 'drs'
      const aeroLabel = year >= 2026 ? 'Active Aero' : 'DRS'
      traces.push({
        x, y: d.tel.map(t => ((t as any)[aeroKey] ?? 0) > 0 ? 15 : 0),
        type: 'bar', name: `${d.driver} ${aeroLabel}`,
        marker: { color: year >= 2026 ? '#00BFFF' : '#00FF7F', opacity: 0.5 },
        yaxis: 'y3', showlegend: false,
        hovertemplate: `${aeroLabel}: %{y:.0f}<extra></extra>`,
      })
    })

    const layout = {
      ...PLOTLY_BASE_LAYOUT,
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, title: 'Distance (m)' },
      yaxis: {
        ...PLOTLY_BASE_LAYOUT.yaxis,
        title: 'Speed (km/h)', domain: [0.35, 1],
      },
      yaxis2: {
        ...PLOTLY_BASE_LAYOUT.yaxis,
        title: 'Throttle %', domain: [0.18, 0.33], range: [0, 105],
        anchor: 'x',
      },
      yaxis3: {
        ...PLOTLY_BASE_LAYOUT.yaxis,
        title: year >= 2026 ? 'Active Aero' : 'DRS',
        domain: [0, 0.15], range: [0, 20], anchor: 'x',
      },
      height: 560,
      grid: { rows: 3, columns: 1, pattern: 'independent' as const },
    }

    return { traces, layout }
  }, [drivers, year])

  if (!Object.keys(drivers).length) {
    return <div className="flex items-center justify-center h-[560px] text-[var(--text-muted)] text-sm">Select drivers to view speed trace</div>
  }

  return (
    <Plot data={traces as any} layout={layout as any} config={PLOTLY_CONFIG}
      style={{ width: '100%', height: '560px' }} useResizeHandler />
  )
}
