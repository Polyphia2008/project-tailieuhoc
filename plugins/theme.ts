export default defineNuxtPlugin(() => {
  const { isDark, init } = useTheme()

  useHead({
    htmlAttrs: {
      class: computed(() => (isDark.value ? 'dark' : '')),
      style: computed(() => `color-scheme: ${isDark.value ? 'dark' : 'light'}`)
    }
  })

  if (import.meta.client) init()
})
