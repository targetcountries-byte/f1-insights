'use client'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { compoundColor, PLOTLY_BASE_LAYOUT, PLOTLY_CONFIG, TRACK_STATUS_COLORS, TRACK_STATUS_LABELS } from '@/lib/constants'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface LapData {
  lap: number; time: number | null; fuel_corrected: number | null
  compound: string; tyre_life: number; stint: number; accurate: boolean
  s1: number | null; s2: number | null; s3: number | null
}
interface DriverData { driver: string; color: string; laps: LapData[] }
interface Props {
  drivers: Record<string, DriverData>
  year: number
  trackStatus?: Array<{ time: number; status: string; message: string }>
  showTrackStatus?: boolean
  fuelCorr?: boolean
  smoothed?: boolean
  hideOutliers?: boolean
  outlierPct?: number
}

export function LapTimesChart({
  drivers, year, trackStatus = [], showTrackStatus = true,
  fuelCorr = false, smoothed = false, hideOutliers = true, outlierPct = 107,
}: Props) {
  const { traces, shapes, layout } = useMemo(() => {
    const allLaps = Object.values(drivers).flatMap(d =>
      d.laps.map(l => fuelCorr ? l.fuel_corrected : l.time).filter((t): t is number => t != null)
    )
    if (!allLaps.length) return { traces: [], shapes: [], layout: {} }

    const median = allLaps.sort((a, b) => a - b)[Math.floor(allLaps.length / 2)]
    const minTime = Math.min(...allLaps)
    const threshold = hideOutliers ? median * (outlierPct / 100) : Infinity

    // Track status background shapes
    const shapes: Plotly.Shape[] = []
    if (showTrackStatus && trackStatus.length) {
      for (let i = 0; i < trackStatus.length; i++) {
        const s = trackStatus[i]
        const next = trackStatus[i + 1]
        if (s.status === 'green') continue
        shapes.push({
          type: 'rect', xref: 'x', yref: 'paper',
          x0: s.time, x1: next?.time ?? s.time + 60,
          y0: 0, y1: 1,
          fillcolor: TRACK_STATUS_COLORS[s.status] ?? 'rgba(255,255,0,0.1)',
          line: { width: 0 },
          label: { text: TRACK_STATUS_LABELS[s.status] ?? s.status, font: { size: 9, color: '#ccc' } },
        } as any)
      }
    }

    const traces: Partial<Plotly.PlotData>[] = Object.values(drivers).map(d => {
      const validLaps = d.laps.filter(l => {
        const t = fuelCorr ? l.fuel_corrected : l.time
        return t != null && t < threshold && l.accurate !== false
      })

      const x = validLaps.map(l => l.lap)
      const y = validLaps.map(l => fuelCorr ? l.fuel_corrected! : l.time!)
      const compounds = validLaps.map(l => l.compound)

      // Colour each marker by compound
      const markerColors = compounds.map(c => compoundColor(c, year))
      const markerBorder = compounds.map(c =>
        ['HARD', 'C1', 'C2'].includes(c) ? '#555' : compoundColor(c, year)
      )

      return {
        x, y,
        type: 'scatter', mode: smoothed ? 'lines+markers' : 'markers',
        name: d.driver,
        line: { color: d.color, width: 1.5, shape: smoothed ? 'spline' as const : 'linear' as const },
        marker: {
          color: markerColors, size: 7, line: { color: markerBorder, width: 1 },
          symbol: 'circle',
        },
        hovertemplate: validLaps.map((l, i) =>
          `<b>${d.driver}</b> Lap ${l.lap}<br>` +
          `${fuelCorr ? 'Fuel-corr' : 'Lap time'}: <b>${formatTime(y[i])}</b><br>` +
          `Compound: ${l.compound} (${l.tyre_life} laps)<br>` +
          `Stint ${l.stint}<br>` +
          `S1: ${formatTime(l.s1)}  S2: ${formatTime(l.s2)}  S3: ${formatTime(l.s3)}` +
          '<extra></extra>'
        ),
        customdata: validLaps,
      }
    })

    const yMin = Math.min(...allLaps.filter(t => t < threshold)) * 0.998
    const yMax = Math.min(...allLaps.filter(t => t < threshold)) * 1.025

    const layout = {
      ...PLOTLY_BASE_LAYOUT,
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, title: 'Lap', dtick: 5 },
      yaxis: {
        ...PLOTLY_BASE_LAYOUT.yaxis,
        title: fuelCorr ? 'Fuel-corrected time (s)' : 'Lap time (s)',
        tickformat: '.3f',
        range: [yMin, yMax],
        tickvals: generateTimeTicks(yMin, yMax),
        ticktext: generateTimeTicks(yMin, yMax).map(formatTime),
      },
      shapes,
      height: 440,
    }

    return { traces, shapes, layout }
  }, [drivers, year, fuelCorr, smoothed, hideOutliers, outlierPct, showTrackStatus, trackStatus])

  if (!Object.keys(drivers).length) {
    return (
      <div className="flex items-center justify-center h-[440px] text-[var(--text-muted)] text-sm">
        Select drivers to compare lap times
      </div>
    )
  }

  return (
    <div className="w-full">
      <Plot
        data={traces as any}
        layout={layout as any}
        config={PLOTLY_CONFIG}
        style={{ width: '100%', height: '440px' }}
        useResizeHandler
      />
    </div>
  )
}

function formatTime(s: number | null): string {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(3).padStart(6, '0')
  return m > 0 ? `${m}:${sec}` : `${(s).toFixed(3)}`
}

function generateTimeTicks(min: number, max: number): number[] {
  const range = max - min
  const step = range > 5 ? 2 : range > 2 ? 1 : 0.5
  const ticks: number[] = []
  for (let t = Math.ceil(min / step) * step; t <= max; t = Math.round((t + step) * 1000) / 1000) {
    ticks.push(t)
  }
  return ticks
}
