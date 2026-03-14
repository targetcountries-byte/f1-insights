import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fastest Lap — F1 Analytics',
  description: "Telemetry comparison of each driver's fastest lap — speed, throttle, brake, gear, DRS/Active Aero.",
}

export default function FastestLapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={12} /> Dashboard
        </Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-sm font-medium">Fastest Lap</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold">Fastest Lap</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">Telemetry comparison of each driver's fastest lap — speed, throttle, brake, gear, DRS/Active Aero.</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-8 text-center">
        <p className="text-4xl mb-4 opacity-20">⬡</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Select a session and drivers on the main dashboard to view fastest lap.
        </p>
        <Link href="/?s=Q"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:opacity-80 transition-opacity">
          Open Dashboard
        </Link>
      </div>
    </div>
  )
}
