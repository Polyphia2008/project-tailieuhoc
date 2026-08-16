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
          <div class="flex items-center gap-3 pb-4 border-b border-line">
            <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="48" />
            <div class="min-w-0">
              <p class="font-semibold text-ink truncate">{{ auth.user?.name }}</p>
              <span class="badge bg-primary-50 text-primary-900">{{ auth.user?.role }}</span>
            </div>
          </div>

          <!-- Thẻ số dư: gradient #0b4a8f → #1a6bc4 -->
          <div class="balance-card my-4">
            <span class="balance-card__glow" aria-hidden="true" />
            <div class="relative">
              <p class="text-xs text-white/70 flex items-center gap-1.5">
                <AppIcon name="fa-wallet" />Số dư ví
              </p>
              <p class="text-xl font-bold mt-1 tracking-tight">{{ currency(auth.user?.balance || 0) }}</p>
              <NuxtLink to="/dashboard/doanh-thu"
                class="text-xs text-accent-300 font-semibold mt-2.5 inline-flex items-center gap-1 hover:text-accent-200 transition-colors group/bal">
                Nạp / rút tiền
                <AppIcon name="fa-arrow-right" class="transition-transform group-hover/bal:translate-x-0.5" />
              </NuxtLink>
            </div>
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
.dnav {
  @apply relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft
         hover:bg-slate-50 hover:text-primary-900 transition-colors;
}
/* Active: bg-primary-50 + text-primary-900 + vạch trái */
.router-link-exact-active.dnav {
  @apply bg-primary-50 text-primary-900 font-semibold hover:bg-primary-50;
}
.router-link-exact-active.dnav::before {
  content: '';
  @apply absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary-900;
}

/* Thẻ số dư */
.balance-card {
  position: relative;
  overflow: hidden;
  padding: 1rem;
  border-radius: 0.75rem;
  color: #fff;
  background: linear-gradient(135deg, #0b4a8f 0%, #1a6bc4 100%);
  box-shadow: 0 8px 25px rgba(11, 74, 143, 0.22);
}
.balance-card__glow {
  position: absolute;
  top: -40%;
  right: -18%;
  width: 9rem;
  height: 9rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 68%);
  pointer-events: none;
}
</style>
