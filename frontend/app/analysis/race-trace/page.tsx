import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Race Trace — F1 Analytics',
  description: 'Cumulative time delta between drivers showing gap evolution throughout the race.',
}

export default function RaceTracePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={12} /> Dashboard
        </Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-sm font-medium">Race Trace</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold">Race Trace</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">Cumulative time delta between drivers showing gap evolution throughout the race.</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-8 text-center">
        <p className="text-4xl mb-4 opacity-20">⬡</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Select a session and drivers on the main dashboard to view race trace.
        </p>
        <Link href="/?s=R"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:opacity-80 transition-opacity">
          Open Dashboard
        </Link>
      </div>
    </div>
  )
}
