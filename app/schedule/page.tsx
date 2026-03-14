'use client'
import { useState } from 'react'
import { EVENTS_2026, EVENTS_2025 } from '@/lib/constants'
import { Calendar, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

const CIRCUIT_INFO: Record<string, { country: string; flag: string; city: string }> = {
  'Australian Grand Prix':       { country: 'Australia',    flag: '🇦🇺', city: 'Melbourne' },
  'Chinese Grand Prix':          { country: 'China',        flag: '🇨🇳', city: 'Shanghai' },
  'Japanese Grand Prix':         { country: 'Japan',        flag: '🇯🇵', city: 'Suzuka' },
  'Bahrain Grand Prix':          { country: 'Bahrain',      flag: '🇧🇭', city: 'Sakhir' },
  'Saudi Arabian Grand Prix':    { country: 'Saudi Arabia', flag: '🇸🇦', city: 'Jeddah' },
  'Miami Grand Prix':            { country: 'USA',          flag: '🇺🇸', city: 'Miami' },
  'Emilia Romagna Grand Prix':   { country: 'Italy',        flag: '🇮🇹', city: 'Imola' },
  'Monaco Grand Prix':           { country: 'Monaco',       flag: '🇲🇨', city: 'Monte Carlo' },
  'Spanish Grand Prix':          { country: 'Spain',        flag: '🇪🇸', city: 'Barcelona' },
  'Canadian Grand Prix':         { country: 'Canada',       flag: '🇨🇦', city: 'Montreal' },
  'Austrian Grand Prix':         { country: 'Austria',      flag: '🇦🇹', city: 'Spielberg' },
  'British Grand Prix':          { country: 'UK',           flag: '🇬🇧', city: 'Silverstone' },
  'Belgian Grand Prix':          { country: 'Belgium',      flag: '🇧🇪', city: 'Spa' },
  'Hungarian Grand Prix':        { country: 'Hungary',      flag: '🇭🇺', city: 'Budapest' },
  'Dutch Grand Prix':            { country: 'Netherlands',  flag: '🇳🇱', city: 'Zandvoort' },
  'Italian Grand Prix':          { country: 'Italy',        flag: '🇮🇹', city: 'Monza' },
  'Azerbaijan Grand Prix':       { country: 'Azerbaijan',   flag: '🇦🇿', city: 'Baku' },
  'Singapore Grand Prix':        { country: 'Singapore',    flag: '🇸🇬', city: 'Singapore' },
  'United States Grand Prix':    { country: 'USA',          flag: '🇺🇸', city: 'Austin' },
  'Mexico City Grand Prix':      { country: 'Mexico',       flag: '🇲🇽', city: 'Mexico City' },
  'São Paulo Grand Prix':        { country: 'Brazil',       flag: '🇧🇷', city: 'São Paulo' },
  'Las Vegas Grand Prix':        { country: 'USA',          flag: '🇺🇸', city: 'Las Vegas' },
  'Qatar Grand Prix':            { country: 'Qatar',        flag: '🇶🇦', city: 'Lusail' },
  'Abu Dhabi Grand Prix':        { country: 'UAE',          flag: '🇦🇪', city: 'Abu Dhabi' },
}

export default function SchedulePage() {
  const [year, setYear] = useState(2026)
  const events = year === 2026 ? EVENTS_2026 : EVENTS_2025

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">F1 Schedule</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{events.length} races · {year} season</p>
        </div>
        <div className="flex gap-2">
          {[2026, 2025, 2024].map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${year === y ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-white/30'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        {events.map((event, i) => {
          const info = CIRCUIT_INFO[event] ?? { country: '', flag: '🏁', city: '' }
          return (
            <div key={event}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all group">
              <span className="text-2xl w-8 text-center shrink-0">{info.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[var(--text-muted)] font-mono w-6">R{i + 1}</span>
                  <span className="font-medium text-sm truncate">{event}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <MapPin size={10} /> {info.city}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {['Q', 'R'].map(s => (
                  <Link key={s} href={`/?y=${year}&e=${encodeURIComponent(event)}&s=${s}`}
                    className="px-2 py-1 text-xs rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all opacity-0 group-hover:opacity-100">
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
