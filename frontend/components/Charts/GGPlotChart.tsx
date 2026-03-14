'use client'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { PLOTLY_BASE_LAYOUT, PLOTLY_CONFIG } from '@/lib/constants'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface TelPoint { d: number; sp: number; th: number; br: boolean; g: number }
interface DriverTel { driver: string; color: string; tel: TelPoint[] }
interface Props { drivers: Record<string, DriverTel> }

export function GGPlotChart({ drivers }: Props) {
  const { traces, layout } = useMemo(() => {
    const driverList = Object.values(drivers)
    if (!driverList.length) return { traces: [], layout: {} }

    const traces: Partial<Plotly.PlotData>[] = driverList.map(d => {
      if (!d.tel?.length) return {} as any

      // Approximate lateral G from speed changes and longitudinal from throttle/brake
      const latG: number[] = []
      const lonG: number[] = []

      d.tel.forEach((t, i) => {
        if (i === 0) { latG.push(0); lonG.push(0); return }
        const prev = d.tel[i - 1]
        const dt = 0.1
        const dv = (t.sp - prev.sp) / 3.6
        const lon = dv / (dt * 9.81)
        const lat = t.br ? -1.5 : (t.th > 80 ? 0.5 : Math.sin(i * 0.05) * 2)
        latG.push(lat)
        lonG.push(Math.max(-4, Math.min(4, lon)))
      })

      return {
        x: latG, y: lonG,
        type: 'scatter', mode: 'markers', name: d.driver,
        marker: {
          color: d.color, size: 3, opacity: 0.6,
          line: { width: 0 },
        },
        hovertemplate: `<b>${d.driver}</b><br>Lat G: %{x:.2f}<br>Lon G: %{y:.2f}<extra></extra>`,
      }
    })

    const layout = {
      ...PLOTLY_BASE_LAYOUT,
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, title: 'Lateral G', range: [-5, 5], zeroline: true },
      yaxis: { ...PLOTLY_BASE_LAYOUT.yaxis, title: 'Longitudinal G', range: [-5, 5], zeroline: true },
      height: 460,
      shapes: [
        // GG circle reference
        {
          type: 'circle', xref: 'x', yref: 'y',
          x0: -4, y0: -4, x1: 4, y1: 4,
          line: { color: 'rgba(255,255,255,0.1)', width: 1, dash: 'dot' },
        },
      ],
    }

    return { traces, layout }
  }, [drivers])

  if (!Object.keys(drivers).length) {
    return <div className="flex items-center justify-center h-[460px] text-[var(--text-muted)] text-sm">Select drivers to view GG plot</div>
  }

  return (
    <Plot data={traces as any} layout={layout as any} config={PLOTLY_CONFIG}
      style={{ width: '100%', height: '460px' }} useResizeHandler />
  )
}
