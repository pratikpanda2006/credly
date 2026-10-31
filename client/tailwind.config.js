/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        credly: {
          bg: 'var(--bg)',
          card: 'var(--card)',
          text: 'var(--tx)',
          muted: 'var(--mu)',
          border: 'var(--bd)',
          accent: 'var(--ac)',
          surface: 'var(--sf)',
          negative: 'var(--no)',
          indigo: '#6366f1',
          purple: '#8b5cf6',
          violet: '#7c3aed',
        },
      },
      borderRadius: {
        card: '16px',
        control: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        card: '0 4px 16px -2px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px -5px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
}
