module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        mdk: {
          bg: '#09090b',
          panel: '#18181b',
          soft: '#1c1c1f',
          line: '#27272a',
          line2: '#3f3f46',
          text: '#fafafa',
          sub: '#a1a1aa',
          mute: '#71717a'
        },
        cmstdev: {
          DEFAULT: '#a855f7',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764'
        },
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Signika', 'Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
        ui: ['Signika', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Signika', 'Inter', 'system-ui', 'sans-serif'],
        hand: ['Dancing Script', 'cursive']
      },
      ringWidth: {
        3: '3px'
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,.06), 0 1px 2px rgba(16,24,40,.04)',
        lift: '0 12px 32px -8px rgba(16,24,40,.16)',
        dark: '0 1px 0 rgba(255,255,255,.02) inset, 0 8px 24px -12px rgba(0,0,0,.8)'
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'glow-pulse': {
          '0%,100%': { opacity: '.35' },
          '50%': { opacity: '.7' }
        }
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.22,1,.36,1) both',
        'fade-in': 'fade-in .4s ease both',
        'scale-in': 'scale-in .3s cubic-bezier(.22,1,.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
