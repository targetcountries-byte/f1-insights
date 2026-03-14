// lib/constants.ts — All F1 analytics constants, 2026-regulation-aware

export const REPO_BASE = 'https://raw.githubusercontent.com/targetcountries-byte/f1-insights/main/data'

export const CURRENT_YEAR = 2026

export const YEARS = [2026, 2025, 2024, 2023, 2022, 2021]

export const SESSIONS = [
  { value: 'FP1', label: 'Practice 1' },
  { value: 'FP2', label: 'Practice 2' },
  { value: 'FP3', label: 'Practice 3' },
  { value: 'SQ',  label: 'Sprint Qualifying' },
  { value: 'SR',  label: 'Sprint Race' },
  { value: 'Q',   label: 'Qualifying' },
  { value: 'R',   label: 'Race' },
]

// 2026 F1 Calendar
export const EVENTS_2026 = [
  'Australian Grand Prix',
  'Chinese Grand Prix',
  'Japanese Grand Prix',
  'Bahrain Grand Prix',
  'Saudi Arabian Grand Prix',
  'Miami Grand Prix',
  'Emilia Romagna Grand Prix',
  'Monaco Grand Prix',
  'Spanish Grand Prix',
  'Canadian Grand Prix',
  'Austrian Grand Prix',
  'British Grand Prix',
  'Belgian Grand Prix',
  'Hungarian Grand Prix',
  'Dutch Grand Prix',
  'Italian Grand Prix',
  'Azerbaijan Grand Prix',
  'Singapore Grand Prix',
  'United States Grand Prix',
  'Mexico City Grand Prix',
  'São Paulo Grand Prix',
  'Las Vegas Grand Prix',
  'Qatar Grand Prix',
  'Abu Dhabi Grand Prix',
]

// 2025 F1 Calendar
export const EVENTS_2025 = [
  'Australian Grand Prix',
  'Chinese Grand Prix',
  'Japanese Grand Prix',
  'Bahrain Grand Prix',
  'Saudi Arabian Grand Prix',
  'Miami Grand Prix',
  'Emilia Romagna Grand Prix',
  'Monaco Grand Prix',
  'Spanish Grand Prix',
  'Canadian Grand Prix',
  'Austrian Grand Prix',
  'British Grand Prix',
  'Belgian Grand Prix',
  'Hungarian Grand Prix',
  'Dutch Grand Prix',
  'Italian Grand Prix',
  'Azerbaijan Grand Prix',
  'Singapore Grand Prix',
  'United States Grand Prix',
  'Mexico City Grand Prix',
  'São Paulo Grand Prix',
  'Las Vegas Grand Prix',
  'Qatar Grand Prix',
  'Abu Dhabi Grand Prix',
]

export function getEvents(year: number): string[] {
  if (year === 2026) return EVENTS_2026
  if (year === 2025) return EVENTS_2025
  return EVENTS_2025 // fallback
}

// ── Compound colors ─────────────────────────────────────
const COMPOUND_COLORS_BASE: Record<string, string> = {
  SOFT:         '#FF3333',
  MEDIUM:       '#FFD700',
  HARD:         '#EEEEEE',
  INTERMEDIATE: '#39B54A',
  WET:          '#0067FF',
  UNKNOWN:      '#888888',
  TEST_UNKNOWN: '#434649',
  C1:           '#EEEEEE',
  C2:           '#D3D3D3',
  C3:           '#FFD700',
  C4:           '#FF8C00',
  C5:           '#FF3333',
}

const COMPOUND_COLORS_PRE_2026: Record<string, string> = {
  ...COMPOUND_COLORS_BASE,
  C6: '#DA70D6',
}

export function getCompoundColors(year: number): Record<string, string> {
  return year >= 2026 ? COMPOUND_COLORS_BASE : COMPOUND_COLORS_PRE_2026
}

export function compoundColor(compound: string, year: number): string {
  return getCompoundColors(year)[compound?.toUpperCase()] ?? '#888888'
}

export function compoundTextColor(compound: string): string {
  return ['HARD', 'C1', 'C2'].includes(compound?.toUpperCase()) ? '#000000' : '#ffffff'
}

// ── Team colors ─────────────────────────────────────────
export const TEAM_COLORS_2026: Record<string, string> = {
  'Red Bull Racing':  '#3671C6',
  'Ferrari':          '#E8002D',
  'Mercedes':         '#27F4D2',
  'McLaren':          '#FF8000',
  'Aston Martin':     '#229971',
  'Alpine':           '#FF87BC',
  'Williams':         '#64C4FF',
  'Racing Bulls':     '#6692FF',
  'Haas':             '#B6BABD',
  'Audi':             '#B8B8B8',
  'Cadillac':         '#CC0000',
}

export const TEAM_COLORS_2025: Record<string, string> = {
  'Red Bull Racing':  '#3671C6',
  'Ferrari':          '#E8002D',
  'Mercedes':         '#27F4D2',
  'McLaren':          '#FF8000',
  'Aston Martin':     '#229971',
  'Alpine':           '#FF87BC',
  'Williams':         '#64C4FF',
  'Racing Bulls':     '#6692FF',
  'Haas':             '#B6BABD',
  'Sauber':           '#52E252',
}

export function getTeamColors(year: number) {
  return year >= 2026 ? TEAM_COLORS_2026 : TEAM_COLORS_2025
}

export function teamColor(team: string, year: number): string {
  return getTeamColors(year)[team] ?? '#888888'
}

// ── Driver → Team ────────────────────────────────────────
export const DRIVER_TEAM_2026: Record<string, string> = {
  VER: 'Red Bull Racing', LAW: 'Red Bull Racing',
  LEC: 'Ferrari',         HAM: 'Ferrari',
  RUS: 'Mercedes',        ANT: 'Mercedes',
  NOR: 'McLaren',         PIA: 'McLaren',
  ALO: 'Aston Martin',    STR: 'Aston Martin',
  GAS: 'Alpine',          COL: 'Alpine',
  ALB: 'Williams',        SAR: 'Williams',
  TSU: 'Racing Bulls',    HAD: 'Racing Bulls',
  MAG: 'Haas',            BEA: 'Haas',
  HUL: 'Audi',            BOR: 'Audi',
  PER: 'Cadillac',        BOT: 'Cadillac',
}

export const DRIVER_TEAM_2025: Record<string, string> = {
  VER: 'Red Bull Racing', TSU: 'Red Bull Racing',
  LEC: 'Ferrari',         SAI: 'Ferrari',
  HAM: 'Mercedes',        RUS: 'Mercedes',
  NOR: 'McLaren',         PIA: 'McLaren',
  ALO: 'Aston Martin',    STR: 'Aston Martin',
  GAS: 'Alpine',          DOO: 'Alpine',
  ALB: 'Williams',        SAR: 'Williams',
  LAW: 'Racing Bulls',    HAD: 'Racing Bulls',
  MAG: 'Haas',            BEA: 'Haas',
  HUL: 'Sauber',          BOR: 'Sauber',
  PER: 'Red Bull Racing',
}

export function getDriverTeamMap(year: number) {
  return year >= 2026 ? DRIVER_TEAM_2026 : DRIVER_TEAM_2025
}

export function driverTeam(driver: string, year: number): string {
  return getDriverTeamMap(year)[driver?.toUpperCase()] ?? 'Unknown'
}

export function driverColor(driver: string, year: number): string {
  return teamColor(driverTeam(driver, year), year)
}

// ── Track status ────────────────────────────────────────
export const TRACK_STATUS_COLORS: Record<string, string> = {
  green:      'rgba(0,200,0,0.15)',
  yellow:     'rgba(255,200,0,0.25)',
  safety_car: 'rgba(255,140,0,0.3)',
  vsc:        'rgba(255,200,0,0.2)',
  red_flag:   'rgba(255,0,0,0.3)',
}

export const TRACK_STATUS_LABELS: Record<string, string> = {
  green:      'Green flag',
  yellow:     'Yellow flag',
  safety_car: 'Safety car',
  vsc:        'Virtual SC',
  red_flag:   'Red flag',
}

// ── Plotly base layout ──────────────────────────────────
export const PLOTLY_BASE_LAYOUT = {
  paper_bgcolor: 'transparent',
  plot_bgcolor:  'transparent',
  font:          { color: '#F0F0F0', family: 'Inter, system-ui, sans-serif', size: 12 },
  xaxis: {
    gridcolor:    'rgba(255,255,255,0.06)',
    zerolinecolor:'rgba(255,255,255,0.15)',
    tickcolor:    'rgba(255,255,255,0.3)',
    linecolor:    'rgba(255,255,255,0.15)',
  },
  yaxis: {
    gridcolor:    'rgba(255,255,255,0.06)',
    zerolinecolor:'rgba(255,255,255,0.15)',
    tickcolor:    'rgba(255,255,255,0.3)',
    linecolor:    'rgba(255,255,255,0.15)',
  },
  legend: {
    bgcolor:      'rgba(30,30,46,0.8)',
    bordercolor:  'rgba(255,255,255,0.1)',
    borderwidth:  1,
  },
  margin: { l: 50, r: 30, t: 40, b: 50 },
  hovermode: 'closest' as const,
}

export const PLOTLY_CONFIG = {
  displaylogo:      false,
  modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
  responsive:       true,
  toImageButtonOptions: { format: 'png', width: 1200, height: 600, scale: 2 },
}
