export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  if (!auth.user) await auth.fetchMe()
  if (!auth.isLoggedIn) return navigateTo('/auth/dang-nhap?redirect=/admin')
  if (!auth.isAdmin) {
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Bạn không có quyền truy cập trang quản trị' }))
  }
})
