export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.fetchMe()

  if (!auth.loggedIn) {
    return navigateTo(`/auth/dang-nhap?next=${encodeURIComponent(to.fullPath)}`)
  }
  if (!auth.isAdmin) {
    return navigateTo('/dashboard')
  }
})
