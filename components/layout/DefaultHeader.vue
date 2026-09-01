<script setup lang="ts">
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from 'radix-vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { money } = useFormat()

const term = ref('')
const mobileOpen = ref(false)
const scrolled = ref(false)

const NAV = [
  { label: 'Khám phá', to: '/' },
  { label: 'Thư viện', to: '/tai-lieu' },
  { label: 'Cộng đồng', to: '/community' },
  { label: 'Bảng xếp hạng', to: '/community/leaderboard' },
  { label: 'Blog', to: '/blog' }
]

function isOn(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

async function search() {
  const q = term.value.trim()
  mobileOpen.value = false
  await router.push(q ? `/tai-lieu?q=${encodeURIComponent(q)}` : '/tai-lieu')
  term.value = ''
}

async function doLogout() {
  await auth.logout()
  await router.push('/')
}

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  if (import.meta.client) window.removeEventListener('scroll', onScroll)
})

watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<template>
  <header class="hdr-v3 sticky top-0 z-40 transition-all duration-300" :class="scrolled ? 'hdr-v3-scrolled' : ''">
    <div class="container-x h-[64px] flex items-center gap-4">
      <NuxtLink to="/" class="shrink-0" aria-label="MapDocs">
        <SvgLogo variant="full" :size="36" />
      </NuxtLink>

      <nav class="hidden lg:flex items-center gap-1 ml-2">
        <NuxtLink v-for="n in NAV" :key="n.to" :to="n.to" class="nav-v3" :class="isOn(n.to) ? 'nav-v3-on' : ''">
          {{ n.label }}
        </NuxtLink>
        <NuxtLink to="/dashboard/tai-lieu" class="nav-v3">
          Đăng bán
          <span class="rounded-md bg-cmstdev-500/15 px-1.5 py-0.5 text-[9.5px] font-bold text-cmstdev-600 dark:text-cmstdev-300">85%</span>
        </NuxtLink>
        <NuxtLink to="/ho-tro" class="nav-v3" :class="isOn('/ho-tro') ? 'nav-v3-on' : ''">Hỗ trợ</NuxtLink>
      </nav>

      <form class="hidden md:block relative flex-1 max-w-[290px] ml-auto" @submit.prevent="search">
        <AppIcon
          name="solar:magnifer-bold-duotone"
          size="16"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none z-[1]"
        />
        <input v-model="term" type="search" placeholder="Tìm tài liệu, đề thi..." class="search-v3" />
      </form>

      <div class="flex items-center gap-2 ml-auto md:ml-0">
        <UiThemeToggle />

        <template v-if="auth.ready && auth.loggedIn">
          <span
            class="hidden xl:inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-muted/60 text-[12px] text-foreground/70"
          >
            <AppIcon name="solar:wallet-money-bold-duotone" size="14" class="text-cmstdev-500" />
            <b class="font-semibold tabular-nums text-foreground">{{ money(auth.balance) }}</b>
          </span>

          <DropdownMenuRoot>
            <DropdownMenuTrigger
              class="flex items-center gap-1.5 h-9 pl-1 pr-2 rounded-full border border-border bg-muted/50 hover:bg-muted transition outline-none"
              aria-label="Tài khoản"
            >
              <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="28" />
              <AppIcon name="solar:double-alt-arrow-down-bold" size="12" class="text-foreground/45" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" :side-offset="10" class="menu-v3 z-[60] animate-scale-in">
                <div class="px-2.5 py-2">
                  <p class="text-[13px] font-semibold text-foreground truncate font-ui">{{ auth.user?.name }}</p>
                  <p class="text-[11.5px] text-foreground/50 truncate">{{ auth.user?.email }}</p>
                </div>
                <DropdownMenuSeparator class="h-px bg-border my-1" />
                <DropdownMenuItem as-child>
                  <NuxtLink to="/dashboard" class="menu-v3-item">
                    <AppIcon name="solar:widget-5-bold-duotone" size="17" /> Dashboard
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/dashboard/da-mua" class="menu-v3-item">
                    <AppIcon name="solar:folder-with-files-bold-duotone" size="17" /> Kho của tôi
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/community" class="menu-v3-item">
                    <AppIcon name="solar:users-group-rounded-bold-duotone" size="17" /> Cộng đồng
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/community/leaderboard" class="menu-v3-item">
                    <AppIcon name="solar:ranking-bold-duotone" size="17" /> Xếp hạng
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/dashboard/ho-so" class="menu-v3-item">
                    <AppIcon name="solar:user-circle-bold-duotone" size="17" /> Hồ sơ
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="auth.isAdmin" as-child>
                  <NuxtLink to="/admin" class="menu-v3-item menu-v3-admin">
                    <AppIcon name="solar:shield-user-bold-duotone" size="17" /> Trang quản trị
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator class="h-px bg-border my-1" />
                <DropdownMenuItem class="menu-v3-item menu-v3-danger" @select="doLogout()">
                  <AppIcon name="solar:logout-3-bold-duotone" size="17" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
        </template>

        <template v-else>
          <NuxtLink to="/auth/dang-nhap" class="btn-ghost-v3 hidden sm:inline-flex">Đăng nhập</NuxtLink>
          <NuxtLink to="/auth/dang-ky" class="btn-brand !h-9 !px-4 !text-[13.5px]">Đăng ký</NuxtLink>
        </template>

        <button
          class="icon-btn-v3 lg:hidden"
          :aria-label="mobileOpen ? 'Đóng menu' : 'Mở menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <AppIcon :name="mobileOpen ? 'solar:close-circle-bold' : 'solar:hamburger-menu-bold'" size="21" />
        </button>
      </div>
    </div>

    <Transition name="slide-down">
      <div v-if="mobileOpen" class="lg:hidden border-t border-border bg-background px-4 py-3 space-y-1">
        <form class="relative mb-3" @submit.prevent="search">
          <AppIcon
            name="solar:magnifer-bold-duotone"
            size="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none z-[1]"
          />
          <input v-model="term" type="search" placeholder="Tìm tài liệu..." class="search-v3 !h-10" />
        </form>
        <NuxtLink
          v-for="n in [...NAV, { label: 'Đăng bán tài liệu', to: '/dashboard/tai-lieu' }, { label: 'Hỗ trợ', to: '/ho-tro' }]"
          :key="n.to"
          :to="n.to"
          class="block px-3 py-2.5 rounded-lg text-[14px] font-medium transition"
          :class="isOn(n.to) ? 'nav-v3-on' : 'text-foreground/65 hover:bg-foreground/5 hover:text-foreground'"
        >
          {{ n.label }}
        </NuxtLink>
        <NuxtLink
          v-if="!auth.loggedIn"
          to="/auth/dang-nhap"
          class="block px-3 py-2.5 rounded-lg text-[14px] font-medium text-foreground/65 hover:text-foreground"
        >
          Đăng nhập
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>
