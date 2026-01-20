/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background palette
        'bg-primary': '#0A0E14',
        'bg-secondary': '#121820',
        'bg-tertiary': '#1A2230',
        'bg-elevated': '#222B3A',

        // Accent colors
        'accent-primary': '#10B981',
        'accent-primary-light': '#34D399',
        'accent-primary-dark': '#059669',
        'accent-secondary': '#3B82F6',
        'accent-secondary-light': '#60A5FA',
        'accent-secondary-dark': '#2563EB',

        // Score colors
        'score-excellent': '#10B981',
        'score-good': '#34D399',
        'score-average': '#FBBF24',
        'score-poor': '#F97316',
        'score-critical': '#EF4444',

        // Dimension colors
        'dim-climate': '#F97316',
        'dim-water': '#3B82F6',
        'dim-land': '#84CC16',
        'dim-biodiversity': '#10B981',
        'dim-pollution': '#8B5CF6',

        // Text colors
        'text-primary': '#F9FAFB',
        'text-secondary': '#D1D5DB',
        'text-tertiary': '#9CA3AF',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        gothic: ['"Special Gothic Expanded One"', 'Impact', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0A0E14 0%, #1A1F2E 50%, #0F1318 100%)',
        'gradient-card': 'linear-gradient(180deg, #141A24 0%, #0E1319 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 179, 237, 0.15) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
