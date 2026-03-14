'use client'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { compoundColor, compoundTextColor, PLOTLY_BASE_LAYOUT, PLOTLY_CONFIG } from '@/lib/constants'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as any

interface StintInfo { stint: number; compound: string; start_lap: number; end_lap: number; laps: number; fresh: boolean }
interface DriverStints { driver: string; color: string; stints: StintInfo[] }
interface Props { drivers: Record<string, DriverStints>; year: number; totalLaps?: number }

export function TyreStrategyChart({ drivers, year, totalLaps }: Props) {
  const { traces, layout } = useMemo(() => {
    const driverList = Object.values(drivers).reverse()
    if (!driverList.length) return { traces: [], layout: {} }

    const traces: any[] = []

    driverList.forEach(d => {
      d.stints.forEach(stint => {
        const color = compoundColor(stint.compound, year)
        const textColor = compoundTextColor(stint.compound)
        traces.push({
          x: [stint.laps],
          y: [d.driver],
          base: [stint.start_lap - 1],
          type: 'bar',
          orientation: 'h',
          name: stint.compound,
          showlegend: false,
          marker: {
            color,
            line: { color: stint.fresh ? 'rgba(255,255,255,0.6)' : 'transparent', width: stint.fresh ? 2 : 0 },
          },
          hovertemplate:
            `<b>${d.driver}</b><br>` +
            `${stint.compound} — Stint ${stint.stint}<br>` +
            `Laps ${stint.start_lap}–${stint.end_lap} (${stint.laps} laps)<br>` +
            `${stint.fresh ? 'Fresh' : 'Used'} tyre<extra></extra>`,
          text: [stint.laps > 4 ? stint.compound.slice(0, 1) : ''],
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: { color: textColor, size: 11, family: 'Inter' },
        })
      })
    })

    // Compound legend traces
    const seen = new Set<string>()
    driverList.forEach(d => d.stints.forEach(s => {
      if (!seen.has(s.compound)) {
        seen.add(s.compound)
        traces.push({
          x: [null], y: [null], type: 'bar', name: s.compound,
          marker: { color: compoundColor(s.compound, year) },
          showlegend: true,
        } as any)
      }
    }))

    const yDrivers = driverList.map(d => d.driver)

    const layout = {
      ...PLOTLY_BASE_LAYOUT,
      barmode: 'stack' as const,
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, title: 'Lap', range: [0, totalLaps ?? 60] },
      yaxis: { ...PLOTLY_BASE_LAYOUT.yaxis, categoryarray: yDrivers, automargin: true },
      height: Math.max(300, driverList.length * 36 + 80),
      legend: { ...PLOTLY_BASE_LAYOUT.legend, orientation: 'h' as const, y: -0.15 },
    }

    return { traces, layout }
  }, [drivers, year, totalLaps])

  if (!Object.keys(drivers).length) {
    return <div className="flex items-center justify-center h-[300px] text-[var(--text-muted)] text-sm">Select drivers to view tyre strategy</div>
  }

  return (
    <Plot data={traces as any} layout={layout as any} config={PLOTLY_CONFIG}
      style={{ width: '100%', height: `${Math.max(300, Object.keys(drivers).length * 36 + 80)}px` }}
      useResizeHandler />
  )
}
