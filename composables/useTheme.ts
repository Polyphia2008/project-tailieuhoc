export type Theme = 'light' | 'dark' | 'auto'

export const THEME_KEY = 'mapdocs:theme'

export function useThemeCookie() {
  return useCookie<Theme>(THEME_KEY, {
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    watch: false
  })
}

export function useTheme() {
  const cookie = useThemeCookie()
  const initial: Theme = cookie.value === 'dark' || cookie.value === 'auto' ? cookie.value : 'light'
  const theme = useState<Theme>('theme', () => initial)

  function resolve(t: Theme): boolean {
    if (t === 'auto') {
      if (!import.meta.client) return false
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return t === 'dark'
  }

  const isDark = computed(() => resolve(theme.value))

  function apply(t: Theme) {
    theme.value = t
    cookie.value = t
    if (!import.meta.client) return
    const root = document.documentElement
    const dark = resolve(t)
    root.classList.toggle('dark', dark)
    root.style.colorScheme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem(THEME_KEY, t)
    } catch {}
  }

  function init() {
    if (!import.meta.client) return
    let saved: Theme | null = null
    try {
      saved = localStorage.getItem(THEME_KEY) as Theme | null
    } catch {}
    const next: Theme = saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : theme.value
    apply(next)
  }

  function toggle() {
    apply(resolve(theme.value) ? 'light' : 'dark')
  }

  return { theme, isDark, apply, init, toggle, resolve }
}
