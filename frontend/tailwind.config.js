/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinical: {
          dark: '#0a0f1d',
          surface: '#111827',
          card: '#1e293b',
          border: '#334155',
          accent: '#38bdf8',
          teal: '#14b8a6',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
