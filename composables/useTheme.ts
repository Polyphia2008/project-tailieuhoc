export type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'mapdocs:theme'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  function resolve(t: Theme): boolean {
    if (t === 'auto') return window.matchMedia('(prefers-color-scheme: dark)').matches
    return t === 'dark'
  }

  function apply(t: Theme) {
    if (!import.meta.client) return
    const root = document.documentElement
    const isDark = resolve(t)
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, t)
    document.cookie = `${STORAGE_KEY}=${t}; path=/; max-age=31536000; samesite=lax`
    theme.value = t
  }

  function init() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    apply(saved || 'light')
  }

  function toggle() {
    apply(resolve(theme.value) ? 'light' : 'dark')
  }

  const isDark = computed(() => theme.value === 'dark')

  return { theme, isDark, apply, init, toggle }
}
