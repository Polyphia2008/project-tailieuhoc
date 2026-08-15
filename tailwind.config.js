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
          50: '#fff8ed', 100: '#ffefd4', 200: '#ffdba8', 300: '#ffc171', 400: '#ff9d38',
          500: '#ff8412', 600: '#f06806', 700: '#c74e07', 800: '#9e3e0e', 900: '#7f350f'
        }
      },
      fontFamily: { sans: ['Be Vietnam Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.04)',
        hover: '0 12px 28px rgba(11,74,143,.14)'
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
      },
      animation: { 'fade-up': 'fade-up .45s ease-out both', 'fade-in': 'fade-in .3s ease-out both' }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
