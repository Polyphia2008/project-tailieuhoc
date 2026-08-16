<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const { currency } = useFormat()
const links = [
  { to: '/dashboard', icon: 'fa-gauge', label: 'Tổng quan' },
  { to: '/dashboard/da-mua', icon: 'fa-bag-shopping', label: 'Tài liệu đã mua' },
  { to: '/dashboard/tai-lieu', icon: 'fa-folder-open', label: 'Tài liệu của tôi' },
  { to: '/dashboard/dang-ban', icon: 'fa-cloud-arrow-up', label: 'Đăng bán tài liệu' },
  { to: '/dashboard/doanh-thu', icon: 'fa-wallet', label: 'Ví & doanh thu' },
  { to: '/dashboard/yeu-thich', icon: 'fa-heart', label: 'Yêu thích' },
  { to: '/dashboard/ho-so', icon: 'fa-user-gear', label: 'Hồ sơ cá nhân' }
]
</script>
<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <LayoutSiteHeader />
    <div class="flex-1 max-w-7xl w-full mx-auto px-4 py-6 lg:grid lg:grid-cols-[264px_1fr] lg:gap-6">
      <button class="lg:hidden btn btn-outline btn-sm mb-4 w-full" @click="ui.sidebarOpen = !ui.sidebarOpen">
        <AppIcon name="fa-bars" class="mr-2" />Menu tài khoản
      </button>
      <aside :class="ui.sidebarOpen ? 'block' : 'hidden lg:block'" class="mb-4 lg:mb-0">
        <div class="card p-5 sticky top-20">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
            <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="48" />
            <div class="min-w-0">
              <p class="font-semibold text-slate-800 truncate">{{ auth.user?.name }}</p>
              <span class="badge bg-primary-50 text-primary-900">{{ auth.user?.role }}</span>
            </div>
          </div>
          <div class="my-4 rounded-xl bg-gradient-to-br from-primary-900 to-primary-800 text-white p-4">
            <p class="text-xs text-white/70">Số dư ví</p>
            <p class="text-xl font-bold mt-0.5">{{ currency(auth.user?.balance || 0) }}</p>
            <NuxtLink to="/dashboard/doanh-thu" class="text-xs text-accent-500 font-medium mt-2 inline-block hover:underline">
              Nạp / rút tiền <AppIcon name="fa-arrow-right" class="ml-1" />
            </NuxtLink>
          </div>
          <nav class="space-y-1" @click="ui.sidebarOpen = false">
            <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="dnav">
              <AppIcon :name="l.icon" class="w-5 text-center" />{{ l.label }}
            </NuxtLink>
            <NuxtLink v-if="auth.isAdmin" to="/admin" class="dnav text-accent-600">
              <AppIcon name="fa-shield-halved" class="w-5 text-center" />Trang quản trị
            </NuxtLink>
          </nav>
        </div>
      </aside>
      <main class="min-w-0"><slot /></main>
    </div>
    <LayoutSiteFooter />
  </div>
</template>
<style scoped>
.dnav { @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-900 transition; }
.router-link-exact-active.dnav { @apply bg-primary-900 text-white hover:bg-primary-900 hover:text-white; }
</style>
