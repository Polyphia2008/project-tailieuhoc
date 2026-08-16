<script setup lang="ts">
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from 'radix-vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const q = ref('')
const menuOpen = ref(false)
const userOpen = ref(false)

const search = () => {
  menuOpen.value = false
  router.push({ path: '/tai-lieu', query: q.value.trim() ? { q: q.value.trim() } : {} })
}

watch(() => route.fullPath, () => { userOpen.value = false; menuOpen.value = false })

/** Menu chinh - active theo tien to duong dan (tru trang chu phai khop tuyet doi) */
const navs = [
  { to: '/', label: 'Trang chủ', exact: true },
  { to: '/tai-lieu', label: 'Thư viện', exact: false },
  { to: '/blog', label: 'Blog', exact: false }
]

const isActive = (nav: { to: string; exact: boolean }) =>
  nav.exact ? route.path === nav.to : route.path.startsWith(nav.to)

/** Cac muc trong dropdown avatar */
const userLinks = computed(() => {
  const items = [
    { to: '/dashboard', icon: 'fa-gauge', label: 'Bảng điều khiển', accent: false },
    { to: '/dashboard/da-mua', icon: 'fa-bag-shopping', label: 'Tài liệu đã mua', accent: false },
    { to: '/dashboard/dang-ban', icon: 'fa-cloud-arrow-up', label: 'Đăng bán tài liệu', accent: false },
    { to: '/dashboard/doanh-thu', icon: 'fa-wallet', label: 'Ví của tôi', accent: false }
  ]
  if (auth.isAdmin) items.push({ to: '/admin', icon: 'fa-shield-halved', label: 'Quản trị', accent: true })
  return items
})

const go = (to: string) => router.push(to)
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-line shadow-sm">
    <div class="max-w-7xl mx-auto px-4">
      <div class="h-16 flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0 group">
          <span
            class="w-9 h-9 rounded-lg bg-primary-900 text-white grid place-items-center font-black transition-transform group-hover:scale-105"
          >M</span>
          <span class="font-extrabold text-lg text-primary-900 hidden sm:block">
            Map<span class="text-accent-500">Docs</span>
          </span>
        </NuxtLink>

        <!-- Nav desktop: active = border-bottom -->
        <nav class="hidden lg:flex items-stretch gap-1 ml-4 h-16">
          <NuxtLink
            v-for="nav in navs"
            :key="nav.to"
            :to="nav.to"
            class="nav-link"
            :class="{ 'nav-link--active': isActive(nav) }"
          >
            {{ nav.label }}
          </NuxtLink>
        </nav>

        <!-- Search: bo tron 999px + focus shadow -->
        <form class="flex-1 max-w-md mx-auto hidden md:block" @submit.prevent="search">
          <div class="relative">
            <AppIcon
              name="fa-magnifying-glass"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"
            />
            <input
              v-model="q"
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              class="ms-search"
            />
          </div>
        </form>

        <div class="ml-auto flex items-center gap-2">
          <template v-if="!auth.isLoggedIn">
            <NuxtLink to="/auth/dang-nhap" class="btn btn-ghost btn-sm hidden sm:inline-flex">Đăng nhập</NuxtLink>
            <NuxtLink to="/auth/dang-ky" class="btn btn-primary btn-sm">Đăng ký</NuxtLink>
          </template>

          <!-- Avatar dropdown: Radix DropdownMenu -->
          <DropdownMenuRoot v-else v-model:open="userOpen">
            <DropdownMenuTrigger
              class="flex items-center gap-2 rounded-full hover:bg-slate-100 data-[state=open]:bg-slate-100 pl-1 pr-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-900/30"
              aria-label="Menu người dùng"
            >
              <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="32" />
              <span class="text-sm font-medium text-ink hidden md:block max-w-[120px] truncate">
                {{ auth.user?.name }}
              </span>
              <AppIcon name="fa-chevron-down" class="text-xs text-slate-400 ms-chev" />
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <DropdownMenuContent :side-offset="8" align="end" class="ms-menu">
                <DropdownMenuLabel class="px-4 pt-1 pb-2 mb-1 border-b border-line">
                  <p class="font-semibold text-sm text-ink truncate">{{ auth.user?.name }}</p>
                  <p class="text-xs text-ink-soft truncate font-normal">{{ auth.user?.email }}</p>
                </DropdownMenuLabel>

                <DropdownMenuItem
                  v-for="item in userLinks"
                  :key="item.to"
                  class="drop"
                  :class="item.accent ? 'text-accent-600' : ''"
                  @select="go(item.to)"
                >
                  <AppIcon :name="item.icon" class="w-5" />{{ item.label }}
                </DropdownMenuItem>

                <DropdownMenuSeparator class="h-px bg-line my-1" />

                <DropdownMenuItem class="drop text-bad" @select="auth.logout()">
                  <AppIcon name="fa-right-from-bracket" class="w-5" />Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>

          <button
            class="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 text-ink transition-colors"
            :aria-label="menuOpen ? 'Đóng menu' : 'Mở menu'"
            @click="menuOpen = !menuOpen"
          >
            <AppIcon :name="menuOpen ? 'fa-xmark' : 'fa-bars'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Menu mobile -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="menuOpen" class="lg:hidden border-t border-line bg-white px-4 py-3 space-y-1">
        <form class="mb-3" @submit.prevent="search">
          <input v-model="q" type="text" placeholder="Tìm kiếm tài liệu..." class="input !rounded-full" />
        </form>
        <NuxtLink
          v-for="nav in navs"
          :key="nav.to"
          :to="nav.to"
          class="mnav"
          :class="{ 'mnav--active': isActive(nav) }"
        >
          {{ nav.label }}
        </NuxtLink>
        <NuxtLink v-if="!auth.isLoggedIn" to="/auth/dang-nhap" class="mnav">Đăng nhập</NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* Nav desktop: gach chan khi active */
.nav-link {
  @apply relative inline-flex items-center px-3 text-sm font-medium text-ink-soft
         hover:text-primary-900 transition-colors;
}
.nav-link::after {
  content: '';
  @apply absolute left-3 right-3 bottom-0 h-[3px] rounded-t-full bg-primary-900;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-link:hover::after { transform: scaleX(0.5); }
.nav-link--active { @apply text-primary-900 font-semibold; }
.nav-link--active::after { transform: scaleX(1); }

/* Search bo tron + focus shadow */
.ms-search {
  @apply w-full h-10 pl-10 pr-4 text-sm bg-slate-100 border border-transparent outline-none
         text-ink placeholder:text-slate-400 transition-all duration-200;
  border-radius: 999px;
}
.ms-search:focus {
  @apply bg-white border-primary-900/30;
  box-shadow: 0 0 0 4px rgba(11, 74, 143, 0.1), 0 2px 8px rgba(16, 24, 40, 0.06);
}

.mnav { @apply block px-3 py-2 rounded-lg text-sm font-medium text-ink-soft hover:bg-slate-50 transition-colors; }
.mnav--active { @apply bg-primary-50 text-primary-900 font-semibold border-l-[3px] border-primary-900; }

/* Chevron xoay khi mo dropdown */
.ms-chev { transition: transform 0.18s ease; }
:deep([data-state='open']) .ms-chev { transform: rotate(180deg); }
</style>

<style>
/* Dropdown content (khong scoped vi render qua Portal) */
.ms-menu {
  min-width: 15rem;
  z-index: 60;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 20px 45px rgba(11, 74, 143, 0.18);
  padding: 0.5rem 0;
  outline: none;
}
.ms-menu[data-state='open'] {
  animation: ms-menu-in 0.16s ease-out;
}
.ms-menu[data-state='closed'] {
  animation: ms-menu-out 0.12s ease-in;
}
@keyframes ms-menu-in {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ms-menu-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}
.ms-menu .drop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #0f172a;
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background-color 0.12s ease;
}
.ms-menu .drop[data-highlighted] { background: #f1f5f9; }
@media (prefers-reduced-motion: reduce) {
  .ms-menu[data-state] { animation: none !important; }
}
</style>
