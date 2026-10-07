/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        netops: {
          bg: '#0f172a', // фон приложения
          panel: '#1e293b', // панели/карточки
          accent: '#38bdf8', // акцент (sky)
          success: '#22c55e',
          warn: '#f59e0b',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}