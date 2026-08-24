<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()

const groups = [
  {
    title: 'TỔNG QUAN',
    items: [{ to: '/admin', icon: 'fa-chart-line', label: 'Thống kê hệ thống' }]
  },
  {
    title: 'NỘI DUNG',
    items: [
      { to: '/admin/tai-lieu', icon: 'fa-file-lines', label: 'Quản lý tài liệu' },
      { to: '/admin/danh-muc', icon: 'fa-tags', label: 'Danh mục' },
      { to: '/admin/bai-viet', icon: 'fa-newspaper', label: 'Bài viết' }
    ]
  },
  {
    title: 'KHÁCH HÀNG',
    items: [
      { to: '/admin/nguoi-dung', icon: 'fa-users', label: 'Người dùng' },
      { to: '/admin/giao-dich', icon: 'fa-receipt', label: 'Giao dịch' },
      { to: '/admin/khieu-nai', icon: 'fa-flag', label: 'Khiếu nại' }
    ]
  },
  {
    title: 'KHÁC',
    items: [
      { to: '/admin/cai-dat', icon: 'fa-gear', label: 'Cài đặt hệ thống' },
      { to: '/dashboard', icon: 'fa-user', label: 'Về trang cá nhân' }
    ]
  }
]

const crumb = computed(() => {
  const all = groups.flatMap((g) => g.items)
  return all.find((i) => i.to === route.path)?.label || 'Bảng quản trị'
})

const closeSide = () => (ui.sidebarOpen = false)
watch(() => route.fullPath, closeSide)
</script>

<template>
  <div class="mdk min-h-screen font-ui">
    <div class="lg:grid lg:grid-cols-[256px_1fr]">
      <!-- ============ SIDEBAR ============ -->
      <aside id="admin-sidebar"
        class="mdk-side fixed inset-y-0 left-0 z-50 w-[256px] overflow-y-auto transition-transform duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0"
        :class="ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'">
        <div class="border-b border-[#27272a] px-4 py-3.5">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 font-black text-white">M</span>
            <span class="min-w-0">
              <span class="block text-sm font-bold text-white">Map<span class="text-orange-400">Docs</span></span>
              <span class="block text-[11px] font-semibold tracking-wide text-orange-400">ADMIN PANEL</span>
            </span>
          </NuxtLink>
        </div>

        <nav class="px-2 pb-6 pt-1" @click="closeSide">
          <template v-for="g in groups" :key="g.title">
            <p class="mdk-group">{{ g.title }}</p>
            <NuxtLink v-for="l in g.items" :key="l.to" :to="l.to" class="mdk-nav">
              <AppIcon :name="l.icon" class="w-4 shrink-0 text-center text-[15px]" />
              <span class="truncate">{{ l.label }}</span>
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

      <div v-if="ui.sidebarOpen" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" @click="closeSide" />

      <!-- ============ MAIN ============ -->
      <div class="flex min-w-0 flex-col">
        <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#27272a] bg-[#09090b]/90 px-4 backdrop-blur lg:px-6">
          <button class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#a1a1aa] hover:bg-[#27272a] hover:text-white lg:hidden"
            aria-label="Mở menu" @click="ui.sidebarOpen = !ui.sidebarOpen">
            <AppIcon name="fa-bars" />
          </button>
          <h1 class="text-sm font-bold text-white">Bảng quản trị</h1>
          <div class="ml-auto flex items-center gap-2">
            <NuxtLink to="/admin/khieu-nai" class="mdk-chip" title="Khiếu nại">
              <AppIcon name="fa-flag" />
              <span class="hidden lg:inline">Khiếu nại</span>
            </NuxtLink>
            <NuxtLink to="/" class="mdk-chip" title="Về trang chủ">
              <AppIcon name="fa-house" />
              <span class="hidden lg:inline">Trang chủ</span>
            </NuxtLink>
            <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="34" />
            <span class="hidden text-sm font-medium text-[#d4d4d8] sm:block">{{ auth.user?.name }}</span>
          </div>
        </header>

        <div class="flex items-center gap-2 px-4 pt-4 text-xs text-[#71717a] lg:px-6">
          <NuxtLink to="/admin" class="transition-colors hover:text-[#d4d4d8]">Admin</NuxtLink>
          <span>/</span>
          <span class="text-[#d4d4d8]">{{ crumb }}</span>
        </div>

        <main class="min-w-0 flex-1 p-4 lg:p-6"><slot /></main>

        <footer class="border-t border-[#27272a] px-4 py-4 text-center text-xs text-[#52525b] lg:px-6">
          MapDocs Admin © {{ new Date().getFullYear() }}
        </footer>
      </div>
    </div>
  </div>
</template>
