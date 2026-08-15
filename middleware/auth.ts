export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.user) await auth.fetchMe()
  if (!auth.isLoggedIn) {
    return navigateTo(`/auth/dang-nhap?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
