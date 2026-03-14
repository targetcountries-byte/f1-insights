'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

const ANALYSIS_LINKS = [
  { href: '/analysis/lap-times',              label: 'Lap Times' },
  { href: '/analysis/tyre-strategy',           label: 'Tyre Strategy' },
  { href: '/analysis/race-trace',              label: 'Race Trace' },
  { href: '/analysis/positions-change',        label: 'Positions Change' },
  { href: '/analysis/pit-stops',               label: 'Pit Stops' },
  { href: '/analysis/gg-plot',                 label: 'GG Plot' },
  { href: '/analysis/heat-map',                label: 'Heat Map' },
  { href: '/analysis/ideal-lap',               label: 'Ideal Lap' },
  { href: '/analysis/fastest-lap',             label: 'Fastest Lap' },
  { href: '/analysis/race-pace',               label: 'Race Pace' },
  { href: '/analysis/championship-standings',  label: 'Championship Standings' },
  { href: '/analysis/tyre-deg',                label: 'Tyre Degradation' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center px-4 gap-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-semibold text-sm shrink-0">
        <span className="text-[var(--accent)] text-lg">⬡</span>
        <span className="hidden sm:block">F1 Analytics</span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1 text-sm">
        <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white transition-colors">
          Dashboard
        </Link>

        {/* Analysis dropdown */}
        <div className="relative" onMouseEnter={() => setAnalysisOpen(true)} onMouseLeave={() => setAnalysisOpen(false)}>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white transition-colors">
            Analysis <ChevronDown size={12} />
          </button>
          {analysisOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50">
              {ANALYSIS_LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="block px-4 py-2 text-xs text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/schedule" className="px-3 py-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white transition-colors">
          Schedule
        </Link>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <a href="https://github.com/targetcountries-byte/f1-insights" target="_blank" rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>

        {/* Mobile menu button */}
        <button className="md:hidden p-1.5 rounded-md hover:bg-[var(--bg-hover)]" onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-4 flex flex-col gap-2 md:hidden z-50">
          <Link href="/" className="py-2 text-sm text-[var(--text-muted)]" onClick={() => setOpen(false)}>Dashboard</Link>
          {ANALYSIS_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="py-2 text-sm text-[var(--text-muted)]" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/schedule" className="py-2 text-sm text-[var(--text-muted)]" onClick={() => setOpen(false)}>Schedule</Link>
        </div>
      )}
    </nav>
  )
}
