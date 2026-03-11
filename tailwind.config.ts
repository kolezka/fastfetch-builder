import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0d0d0d',
        'bg-surface': '#1a1a1f',
        'bg-code': '#0a0a10',
        border: '#2a2a35',
        accent: '#00d4ff',
        'text-primary': '#e0e0e8',
        'text-muted': '#666680',
        danger: '#ff4466',
        success: '#00cc88',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
