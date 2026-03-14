import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Layout/Navbar'

export const metadata: Metadata = {
  title: 'F1 Analytics — Lap Times & Telemetry Data',
  description: 'Formula 1 telemetry analysis, lap times, tyre strategy and race insights. Interactive charts for every session.',
  keywords: 'F1, Formula 1, telemetry, lap times, tyre strategy, race analysis',
  openGraph: {
    title: 'F1 Analytics',
    description: 'Formula 1 telemetry analysis and race insights',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  )
}
