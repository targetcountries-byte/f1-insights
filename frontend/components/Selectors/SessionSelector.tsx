'use client'
import { useSessionStore } from '@/lib/store'
import { getEvents, YEARS, SESSIONS } from '@/lib/constants'
import { ChevronDown, X, Plus } from 'lucide-react'
import { useState } from 'react'

export function SessionSelector() {
  const {
    year, event, session, drivers,
    setYear, setEvent, setSession, addDriver, removeDriver,
    fuelCorr, setFuelCorr, showTrackStatus, setShowTrackStatus,
    mode, setMode,
  } = useSessionStore()

  const [driverInput, setDriverInput] = useState('')
  const events = getEvents(year)

  const handleAddDriver = () => {
    const code = driverInput.trim().toUpperCase().slice(0, 3)
    if (code.length === 3) { addDriver(code); setDriverInput('') }
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-4">

      {/* Mode toggle */}
      <div className="flex gap-1 p-0.5 bg-[var(--bg-primary)] rounded-lg">
        {(['essential', 'expert'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-1 text-xs rounded-md capitalize transition-all ${mode === m ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Year */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Year</label>
        <div className="flex flex-wrap gap-1">
          {YEARS.map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all ${year === y ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-white/30'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Event */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Event</label>
        <div className="relative">
          <select value={event} onChange={e => setEvent(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer hover:border-white/30 transition-colors pr-8">
            <option value="">Select event...</option>
            {events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Session */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Session</label>
        <div className="flex flex-wrap gap-1">
          {SESSIONS.map(s => (
            <button key={s.value} onClick={() => setSession(s.value)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all ${session === s.value ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-white/30'}`}>
              {s.value}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Drivers</label>
        <div className="flex gap-1 mb-2 flex-wrap">
          {drivers.map(d => (
            <span key={d} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {d}
              <button onClick={() => removeDriver(d)} className="hover:text-red-400 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            value={driverInput}
            onChange={e => setDriverInput(e.target.value.toUpperCase().slice(0, 3))}
            onKeyDown={e => e.key === 'Enter' && handleAddDriver()}
            placeholder="HAM, VER..."
            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs font-mono placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button onClick={handleAddDriver}
            className="px-2 py-1.5 bg-[var(--accent)] rounded-lg hover:opacity-80 transition-opacity">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)]">
        <Toggle label="Fuel Correction" value={fuelCorr} onChange={setFuelCorr} />
        <Toggle label="Track Status" value={showTrackStatus} onChange={setShowTrackStatus} />
      </div>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-8 h-4 rounded-full transition-colors relative ${value ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'}`}>
        <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow ${value ? 'left-4' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
