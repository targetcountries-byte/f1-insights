// lib/store.ts — Global state with Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CURRENT_YEAR } from './constants'

interface SessionState {
  year:       number
  event:      string
  session:    string
  drivers:    string[]
  theme:      string
  fuelCorr:   boolean
  showTrackStatus: boolean
  mode:       'essential' | 'expert'

  setYear:    (y: number) => void
  setEvent:   (e: string) => void
  setSession: (s: string) => void
  setDrivers: (d: string[]) => void
  addDriver:  (d: string) => void
  removeDriver:(d: string) => void
  setTheme:   (t: string) => void
  setFuelCorr:(v: boolean) => void
  setShowTrackStatus: (v: boolean) => void
  setMode:    (m: 'essential' | 'expert') => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      year:    CURRENT_YEAR,
      event:   'Chinese Grand Prix',
      session: 'Q',
      drivers: [],
      theme:   'default',
      fuelCorr: false,
      showTrackStatus: true,
      mode:    'essential',

      setYear:    (year)    => set({ year, event: '', drivers: [] }),
      setEvent:   (event)   => set({ event, drivers: [] }),
      setSession: (session) => set({ session, drivers: [] }),
      setDrivers: (drivers) => set({ drivers }),
      addDriver:  (d) => {
        const current = get().drivers
        if (!current.includes(d) && current.length < 6) {
          set({ drivers: [...current, d] })
        }
      },
      removeDriver: (d) => set({ drivers: get().drivers.filter(x => x !== d) }),
      setTheme:     (theme)   => set({ theme }),
      setFuelCorr:  (fuelCorr)=> set({ fuelCorr }),
      setShowTrackStatus: (v) => set({ showTrackStatus: v }),
      setMode:      (mode)    => set({ mode }),
    }),
    { name: 'f1-session-store' }
  )
)
