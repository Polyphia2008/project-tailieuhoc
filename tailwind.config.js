/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcdaff', 300: '#8ec3ff', 400: '#59a2ff',
          500: '#337eff', 600: '#1b5df5', 700: '#1449e1', 800: '#173db6', 900: '#0b4a8f', 950: '#0a2d5c'
        },
        accent: {
          50: '#fff8ed', 100: '#fff3e6', 200: '#ffdba8', 300: '#ffc171', 400: '#ff9d38',
          500: '#ff8412', 600: '#f06806', 700: '#c74e07', 800: '#9e3e0e', 900: '#7f350f'
        },
        // Design tokens MapDocs (giai doan 2)
        surface: '#f8fafc',
        ink: { DEFAULT: '#0f172a', soft: '#475569' },
        line: '#e2e8f0',
        ok: '#16a34a',
        warn: '#f59e0b',
        bad: '#dc2626'
      },
      fontFamily: { sans: ['Be Vietnam Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      borderRadius: { xl2: '12px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.06)',
        hover: '0 8px 25px rgba(11,74,143,.12)',
        soft: '0 2px 8px rgba(16,24,40,.06)',
        pop: '0 20px 45px rgba(11,74,143,.18)'
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-500px 0' }, '100%': { backgroundPosition: '500px 0' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-down': { '0%': { opacity: '0', transform: 'translateY(-6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      },
      animation: {
        'fade-up': 'fade-up .45s ease-out both',
        'fade-in': 'fade-in .3s ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
        'scale-in': 'scale-in .18s cubic-bezier(.16,1,.3,1) both',
        'slide-down': 'slide-down .16s ease-out both'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
