<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()

const GROUPS = [
  {
    title: 'TỔNG QUAN',
    items: [{ label: 'Bảng điều khiển', to: '/admin', icon: 'solar:chart-2-bold-duotone' }]
  },
  {
    title: 'NỘI DUNG',
    items: [
      { label: 'Tài liệu', to: '/admin/tai-lieu', icon: 'solar:documents-bold-duotone' },
      { label: 'Danh mục', to: '/admin/danh-muc', icon: 'solar:widget-4-bold-duotone' },
      { label: 'Bài viết', to: '/admin/bai-viet', icon: 'solar:notes-bold-duotone' }
    ]
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { label: 'Người dùng', to: '/admin/nguoi-dung', icon: 'solar:users-group-rounded-bold-duotone' },
      { label: 'Giao dịch', to: '/admin/giao-dich', icon: 'solar:card-transfer-bold-duotone' },
      { label: 'Khiếu nại', to: '/admin/khieu-nai', icon: 'solar:flag-bold-duotone' },
      { label: 'Cài đặt', to: '/admin/cai-dat', icon: 'solar:settings-bold-duotone' }
    ]
  }
]

function isOn(to: string): boolean {
  if (to === '/admin') return route.path === '/admin'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <aside
    class="mdk-side fixed inset-y-0 left-0 z-50 transition-transform lg:translate-x-0"
    :class="ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-[60px] shrink-0 flex items-center gap-2.5 px-4 border-b border-mdk-line">
      <NuxtLink to="/admin" class="flex items-center gap-2.5 min-w-0 group">
        <span
          class="w-9 h-9 rounded-[10px] grid place-items-center text-white shrink-0 transition-transform group-hover:scale-105"
          style="background: linear-gradient(135deg, #f59e0b, #b45309)"
        >
          <AppIcon name="solar:shield-user-bold" size="19" />
        </span>
        <span class="min-w-0">
          <span class="block text-[14.5px] font-bold text-mdk-text font-ui leading-tight tracking-tight">MapDocs</span>
          <span class="block text-[10.5px] text-amber-400/90 font-semibold uppercase tracking-wide leading-tight">Admin panel</span>
        </span>
      </NuxtLink>
      <button class="ml-auto lg:hidden w-8 h-8 grid place-items-center rounded-lg text-mdk-mute hover:bg-mdk-line" @click="ui.closeSidebar()">
        <AppIcon name="solar:close-circle-linear" size="18" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto pb-6">
      <template v-for="g in GROUPS" :key="g.title">
        <p class="mdk-group">{{ g.title }}</p>
        <NuxtLink
          v-for="it in g.items"
          :key="it.to"
          :to="it.to"
          class="mdk-nav"
          :class="isOn(it.to) ? 'mdk-nav-on' : ''"
          @click="ui.closeSidebar()"
        >
          <AppIcon :name="it.icon" class="mdk-nav-ic" />
          <span class="flex-1 truncate">{{ it.label }}</span>
          <AppIcon name="solar:alt-arrow-right-linear" size="12" class="text-mdk-mute/70" />
        </NuxtLink>
      </template>

      <p class="mdk-group">LIÊN KẾT</p>
      <NuxtLink to="/dashboard" class="mdk-nav" @click="ui.closeSidebar()">
        <AppIcon name="solar:widget-5-bold-duotone" class="mdk-nav-ic" />
        <span class="flex-1 truncate">Dashboard cá nhân</span>
      </NuxtLink>
      <NuxtLink to="/" class="mdk-nav" @click="ui.closeSidebar()">
        <AppIcon name="solar:home-2-bold-duotone" class="mdk-nav-ic" />
        <span class="flex-1 truncate">Xem trang chủ</span>
      </NuxtLink>
    </nav>

    <div class="shrink-0 p-3 border-t border-mdk-line">
      <div class="flex items-center gap-2.5 rounded-xl bg-mdk-panel border border-mdk-line p-2.5">
        <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="32" online />
        <div class="min-w-0">
          <p class="text-[12.5px] font-semibold text-mdk-text truncate font-ui">{{ auth.user?.name }}</p>
          <p class="text-[10.5px] text-amber-400 font-medium uppercase tracking-wide">Quản trị viên</p>
        </div>
      </div>
    </div>
  </aside>
</template>
