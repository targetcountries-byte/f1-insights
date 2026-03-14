/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'f1-red':     '#E10600',
        'f1-dark':    '#15151E',
        'f1-carbon':  '#1E1E2E',
        'f1-surface': '#2A2A3E',
        'f1-muted':   '#6B7280',
        // Team colors
        'redbull':    '#3671C6',
        'ferrari':    '#E8002D',
        'mercedes':   '#27F4D2',
        'mclaren':    '#FF8000',
        'aston':      '#229971',
        'alpine':     '#FF87BC',
        'williams':   '#64C4FF',
        'racingbulls':'#6692FF',
        'haas':       '#B6BABD',
        'audi':       '#B8B8B8',
        'cadillac':   '#CC0000',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
