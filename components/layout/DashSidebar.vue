<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()

interface NavItem {
  label: string
  to: string
  icon: string
  children?: { label: string; to: string }[]
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'SẢN PHẨM & DỊCH VỤ',
    items: [
      { label: 'Tổng quan', to: '/dashboard', icon: 'solar:widget-5-bold-duotone' },
      { label: 'Thư viện tài liệu', to: '/tai-lieu', icon: 'solar:book-2-bold-duotone' },
      { label: 'Kho của tôi', to: '/dashboard/da-mua', icon: 'solar:folder-with-files-bold-duotone' },
      { label: 'Đăng bán tài liệu', to: '/dashboard/tai-lieu', icon: 'solar:cloud-upload-bold-duotone' },
      {
        label: 'Báo cáo',
        to: '/dashboard/dang-ban',
        icon: 'solar:chart-square-bold-duotone',
        children: [
          { label: 'Tài liệu đang bán', to: '/dashboard/dang-ban' },
          { label: 'Doanh thu', to: '/dashboard/doanh-thu' }
        ]
      }
    ]
  },
  {
    title: 'CUSTOMER',
    items: [
      { label: 'Ví của tôi', to: '/dashboard/doanh-thu', icon: 'solar:wallet-money-bold-duotone' },
      { label: 'Yêu thích', to: '/dashboard/yeu-thich', icon: 'solar:heart-bold-duotone' },
      { label: 'Hồ sơ cá nhân', to: '/dashboard/ho-so', icon: 'solar:user-circle-bold-duotone' }
    ]
  },
  {
    title: 'OTHERS',
    items: [
      { label: 'Blog', to: '/blog', icon: 'solar:notes-bold-duotone' },
      { label: 'Trợ giúp', to: '/blog/huong-dan-dang-ban-tai-lieu-tren-mapdocs', icon: 'solar:question-circle-bold-duotone' },
      { label: 'Cài đặt', to: '/dashboard/ho-so', icon: 'solar:settings-bold-duotone' }
    ]
  }
]

const open = ref<Record<string, boolean>>({})

function isOn(to: string): boolean {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path === to || route.path.startsWith(to + '/')
}

function groupOn(item: NavItem): boolean {
  if (isOn(item.to)) return true
  return Boolean(item.children?.some((c) => isOn(c.to)))
}

onMounted(() => {
  for (const g of GROUPS) {
    for (const it of g.items) {
      if (it.children && groupOn(it)) open.value[it.to] = true
    }
  }
})

function toggle(item: NavItem) {
  open.value[item.to] = !open.value[item.to]
}
</script>

<template>
  <aside
    class="mdk-side fixed inset-y-0 left-0 z-50 transition-transform lg:translate-x-0"
    :class="ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-[60px] shrink-0 flex items-center gap-2.5 px-4 border-b border-mdk-line">
      <NuxtLink to="/" class="flex items-center gap-2.5 min-w-0 group">
        <span
          class="w-9 h-9 rounded-[10px] grid place-items-center text-white shrink-0 transition-transform group-hover:scale-105"
          style="background: linear-gradient(135deg, #3b82f6, #f97316)"
        >
          <AppIcon name="solar:book-bookmark-bold" size="19" />
        </span>
        <span class="min-w-0">
          <span class="block text-[14.5px] font-bold text-mdk-text font-ui leading-tight tracking-tight">MapDocs</span>
          <span class="block text-[10.5px] text-mdk-mute truncate leading-tight">
            {{ auth.user?.email || 'kho tài liệu học tập' }}
          </span>
        </span>
      </NuxtLink>
      <button class="ml-auto lg:hidden w-8 h-8 grid place-items-center rounded-lg text-mdk-mute hover:bg-mdk-line" @click="ui.closeSidebar()">
        <AppIcon name="solar:close-circle-linear" size="18" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto pb-6">
      <template v-for="g in GROUPS" :key="g.title">
        <p class="mdk-group">{{ g.title }}</p>
        <template v-for="it in g.items" :key="it.to + it.label">
          <button
            v-if="it.children"
            type="button"
            class="mdk-nav w-[calc(100%-16px)]"
            :class="groupOn(it) ? 'mdk-nav-on' : ''"
            @click="toggle(it)"
          >
            <AppIcon :name="it.icon" class="mdk-nav-ic" />
            <span class="flex-1 text-left truncate">{{ it.label }}</span>
            <AppIcon
              name="solar:alt-arrow-down-linear"
              size="13"
              class="text-mdk-mute transition-transform"
              :class="open[it.to] ? 'rotate-0' : '-rotate-90'"
            />
          </button>
          <NuxtLink
            v-else
            :to="it.to"
            class="mdk-nav"
            :class="isOn(it.to) ? 'mdk-nav-on' : ''"
            @click="ui.closeSidebar()"
          >
            <AppIcon :name="it.icon" class="mdk-nav-ic" />
            <span class="flex-1 truncate">{{ it.label }}</span>
            <AppIcon name="solar:alt-arrow-right-linear" size="12" class="text-mdk-mute/70" />
          </NuxtLink>

          <div v-if="it.children && open[it.to]" class="pb-1">
            <NuxtLink
              v-for="c in it.children"
              :key="c.to"
              :to="c.to"
              class="mdk-sub"
              :class="isOn(c.to) ? 'mdk-sub-on' : ''"
              @click="ui.closeSidebar()"
            >
              {{ c.label }}
            </NuxtLink>
          </div>
        </template>
      </template>

      <div v-if="auth.isAdmin" class="mt-2">
        <p class="mdk-group">QUẢN TRỊ</p>
        <NuxtLink to="/admin" class="mdk-nav" @click="ui.closeSidebar()">
          <AppIcon name="solar:shield-user-bold-duotone" class="mdk-nav-ic text-amber-400" />
          <span class="flex-1 truncate">Trang quản trị</span>
          <AppIcon name="solar:alt-arrow-right-linear" size="12" class="text-mdk-mute/70" />
        </NuxtLink>
      </div>
    </nav>

    <div class="shrink-0 p-3 border-t border-mdk-line">
      <div class="rounded-xl p-3.5 relative overflow-hidden" style="background: linear-gradient(135deg, #1e3a8a, #172554)">
        <div class="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-primary-500/25 blur-xl animate-glow-pulse" />
        <p class="relative text-[10.5px] font-semibold text-primary-200 uppercase tracking-wider">Số dư ví</p>
        <p class="relative mt-1 text-[19px] font-bold text-white font-ui tabular-nums">
          {{ Number(auth.balance).toLocaleString('vi-VN') }}đ
        </p>
        <NuxtLink to="/dashboard/doanh-thu" class="relative mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary-200 hover:text-white transition-colors">
          Nạp tiền ngay <AppIcon name="solar:arrow-right-linear" size="13" />
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
