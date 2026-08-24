<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const { currency } = useFormat()

/** Menu chia nhom theo phong cach thegioidev.com */
const groups = [
  {
    title: 'TỔNG QUAN',
    items: [
      { to: '/dashboard', icon: 'fa-gauge', label: 'Bảng điều khiển' },
      { to: '/dashboard/doanh-thu', icon: 'fa-wallet', label: 'Ví & doanh thu' }
    ]
  },
  {
    title: 'TÀI LIỆU CỦA TÔI',
    items: [
      { to: '/dashboard/tai-lieu', icon: 'fa-folder-open', label: 'Tài liệu đã đăng' },
      { to: '/dashboard/dang-ban', icon: 'fa-cloud-arrow-up', label: 'Đăng bán tài liệu' },
      { to: '/dashboard/da-mua', icon: 'fa-bag-shopping', label: 'Tài liệu đã mua' },
      { to: '/dashboard/yeu-thich', icon: 'fa-heart', label: 'Yêu thích' }
    ]
  },
  {
    title: 'KHÁC',
    items: [
      { to: '/dashboard/ho-so', icon: 'fa-user-gear', label: 'Hồ sơ cá nhân' },
      { to: '/tai-lieu', icon: 'fa-magnifying-glass', label: 'Thư viện tài liệu' },
      { to: '/blog', icon: 'fa-newspaper', label: 'Tin tức' }
    ]
  }
]

/** Breadcrumb tren topbar */
const crumb = computed(() => {
  const all = groups.flatMap((g) => g.items)
  return all.find((i) => i.to === route.path)?.label || 'Bảng điều khiển'
})

const closeSide = () => (ui.sidebarOpen = false)
watch(() => route.fullPath, closeSide)
</script>

<template>
  <div class="mdk min-h-screen font-ui">
    <div class="lg:grid lg:grid-cols-[256px_1fr]">
      <!-- ============ SIDEBAR ============ -->
      <aside id="dashboard-sidebar"
        class="mdk-side fixed inset-y-0 left-0 z-50 w-[256px] overflow-y-auto transition-transform duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0"
        :class="ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'">
        <!-- Logo + user -->
        <div class="border-b border-[#27272a] px-4 py-3.5">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 font-black text-white">M</span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-bold text-white">{{ auth.user?.name || 'MapDocs' }}</span>
              <span class="block truncate text-[11px] text-[#71717a]">{{ auth.user?.email || 'Khách' }}</span>
            </span>
          </NuxtLink>
        </div>

        <!-- Số dư ví -->
        <div class="px-3 pt-3">
          <div class="balance-card">
            <span class="balance-card__glow" aria-hidden="true" />
            <div class="relative">
              <p class="flex items-center gap-1.5 text-[11px] text-white/70">
                <AppIcon name="fa-wallet" />Số dư ví
              </p>
              <p class="mt-0.5 text-lg font-bold tracking-tight">{{ currency(auth.user?.balance || 0) }}</p>
              <NuxtLink to="/dashboard/doanh-thu"
                class="group/bal mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-200 transition-colors hover:text-white">
                Nạp / rút tiền
                <AppIcon name="fa-arrow-right" class="transition-transform group-hover/bal:translate-x-0.5" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Nav groups -->
        <nav class="px-2 pb-6 pt-1" @click="closeSide">
          <template v-for="g in groups" :key="g.title">
            <p class="mdk-group">{{ g.title }}</p>
            <NuxtLink v-for="l in g.items" :key="l.to" :to="l.to" class="mdk-nav">
              <AppIcon :name="l.icon" class="w-4 shrink-0 text-center text-[15px]" />
              <span class="truncate">{{ l.label }}</span>
              <AppIcon name="fa-chevron-right" class="mdk-nav__chev" />
            </NuxtLink>
          </template>

          <template v-if="auth.isAdmin">
            <p class="mdk-group">QUẢN TRỊ</p>
            <NuxtLink to="/admin" class="mdk-nav">
              <AppIcon name="fa-shield-halved" class="w-4 shrink-0 text-center text-[15px] text-orange-400" />
              <span class="truncate">Trang quản trị</span>
              <AppIcon name="fa-chevron-right" class="mdk-nav__chev" />
            </NuxtLink>
          </template>

          <p class="mdk-group">PHIÊN</p>
          <button class="mdk-nav w-full text-left text-red-400 hover:text-red-300" @click="auth.logout()">
            <AppIcon name="fa-right-from-bracket" class="w-4 shrink-0 text-center text-[15px]" />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      <!-- Overlay mobile -->
      <div v-if="ui.sidebarOpen" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" @click="closeSide" />

      <!-- ============ MAIN ============ -->
      <div class="flex min-w-0 flex-col">
        <!-- Topbar -->
        <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#27272a] bg-[#09090b]/90 px-4 backdrop-blur lg:px-6">
          <button class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#a1a1aa] hover:bg-[#27272a] hover:text-white lg:hidden"
            aria-label="Mở menu" @click="ui.sidebarOpen = !ui.sidebarOpen">
            <AppIcon name="fa-bars" />
          </button>

          <NuxtLink to="/tai-lieu"
            class="hidden h-9 items-center gap-2 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-3 text-xs text-[#71717a] transition-colors hover:border-[#3f3f46] hover:text-[#d4d4d8] sm:flex sm:w-64">
            <AppIcon name="fa-magnifying-glass" />Tìm kiếm tài liệu...
          </NuxtLink>

          <div class="ml-auto flex items-center gap-2">
            <NuxtLink to="/dashboard/doanh-thu" class="mdk-chip hidden sm:inline-flex">
              <span class="mdk-chip__icon bg-gradient-to-br from-blue-500 to-blue-700"><AppIcon name="fa-wallet" /></span>
              <span class="hidden md:inline">Số dư</span>
              <span class="mdk-chip__value">{{ currency(auth.user?.balance || 0) }}</span>
            </NuxtLink>
            <NuxtLink to="/" class="mdk-chip" title="Về trang chủ">
              <AppIcon name="fa-house" />
              <span class="hidden lg:inline">Trang chủ</span>
            </NuxtLink>
            <NuxtLink to="/dashboard/ho-so" class="shrink-0" title="Hồ sơ cá nhân">
              <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="34" />
            </NuxtLink>
          </div>
        </header>

        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 px-4 pt-4 text-xs text-[#71717a] lg:px-6">
          <NuxtLink to="/" class="transition-colors hover:text-[#d4d4d8]">Trang chủ</NuxtLink>
          <span>/</span>
          <span class="text-[#d4d4d8]">{{ crumb }}</span>
        </div>

        <main class="min-w-0 flex-1 p-4 lg:p-6"><slot /></main>

        <footer class="border-t border-[#27272a] px-4 py-4 text-center text-xs text-[#52525b] lg:px-6">
          © {{ new Date().getFullYear() }} MapDocs — Dự án demo phi thương mại.
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.balance-card {
  position: relative;
  overflow: hidden;
  padding: 0.875rem;
  border-radius: 0.75rem;
  color: #fff;
  background: linear-gradient(135deg, #1d4ed8 0%, #0b4a8f 55%, #101033 100%);
  border: 1px solid rgba(96, 165, 250, 0.24);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.balance-card__glow {
  position: absolute;
  top: -40%;
  right: -18%;
  width: 8rem;
  height: 8rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 68%);
  pointer-events: none;
}
</style>
