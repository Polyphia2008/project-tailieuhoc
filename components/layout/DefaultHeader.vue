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
  <header
    class="hdr sticky top-0 z-40 transition-all duration-300 border-b"
    :class="scrolled ? 'hdr-scrolled backdrop-blur-xl' : 'border-transparent'"
  >
    <div class="container-x h-[62px] flex items-center gap-4">
      <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0 group">
        <span
          class="w-9 h-9 rounded-[10px] grid place-items-center text-white transition-transform group-hover:scale-105"
          style="background: linear-gradient(135deg, #3b82f6, #f97316)"
        >
          <AppIcon name="solar:book-bookmark-bold" size="19" />
        </span>
        <span class="text-[17px] font-extrabold text-white font-ui tracking-tight">MapDocs</span>
      </NuxtLink>

      <nav class="hidden lg:flex items-center gap-1 ml-3">
        <NuxtLink
          v-for="n in NAV"
          :key="n.to"
          :to="n.to"
          class="px-3 h-9 inline-flex items-center rounded-lg text-[13.5px] font-medium transition"
          :class="isOn(n.to) ? 'text-white bg-white/[.08]' : 'text-zinc-400 hover:text-white hover:bg-white/[.05]'"
        >
          {{ n.label }}
        </NuxtLink>
        <NuxtLink
          to="/dashboard/tai-lieu"
          class="px-3 h-9 inline-flex items-center gap-1.5 rounded-lg text-[13.5px] font-medium text-zinc-400 hover:text-white hover:bg-white/[.05] transition"
        >
          Đăng bán
          <span class="pill bg-accent-500/20 text-accent-300 text-[9.5px] font-bold px-1.5 py-0.5">85%</span>
        </NuxtLink>
      </nav>

      <form class="hidden md:block relative flex-1 max-w-[300px] ml-auto" @submit.prevent="search">
        <AppIcon name="solar:magnifer-linear" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          v-model="term"
          type="search"
          placeholder="Tìm tài liệu, đề thi..."
          class="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[.06] border border-white/[.08] text-[13px] text-white placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/[.09] focus:outline-none focus:ring-0 transition"
        />
      </form>

      <div class="flex items-center gap-2 md:ml-0 ml-auto">
        <UiThemeToggle light />
        <template v-if="auth.ready && auth.loggedIn">
          <span class="hidden xl:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/[.06] border border-white/[.08] text-[12px] text-zinc-300">
            <AppIcon name="solar:wallet-bold" size="13" class="text-primary-400" />
            <b class="text-white font-semibold tabular-nums">{{ money(auth.balance) }}</b>
          </span>
          <DropdownMenuRoot>
            <DropdownMenuTrigger class="flex items-center gap-2 h-9 pl-1 pr-2 rounded-full bg-white/[.06] border border-white/[.08] hover:bg-white/[.1] transition">
              <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="28" />
              <AppIcon name="solar:alt-arrow-down-linear" size="12" class="text-zinc-400" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" :side-offset="8" class="z-[60] w-[224px] rounded-xl border border-mdk-line bg-mdk-panel shadow-2xl p-1.5 animate-scale-in">
                <div class="px-2.5 py-2">
                  <p class="text-[13px] font-semibold text-white truncate font-ui">{{ auth.user?.name }}</p>
                  <p class="text-[11.5px] text-zinc-500 truncate">{{ auth.user?.email }}</p>
                </div>
                <DropdownMenuSeparator class="h-px bg-mdk-line my-1" />
                <DropdownMenuItem as-child>
                  <NuxtLink to="/dashboard" class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] text-zinc-400 hover:bg-mdk-line hover:text-white outline-none cursor-pointer">
                    <AppIcon name="solar:widget-5-linear" size="16" /> Dashboard
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/dashboard/da-mua" class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] text-zinc-400 hover:bg-mdk-line hover:text-white outline-none cursor-pointer">
                    <AppIcon name="solar:folder-with-files-linear" size="16" /> Kho của tôi
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="auth.isAdmin" as-child>
                  <NuxtLink to="/admin" class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] text-amber-400 hover:bg-mdk-line outline-none cursor-pointer">
                    <AppIcon name="solar:shield-user-linear" size="16" /> Trang quản trị
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator class="h-px bg-mdk-line my-1" />
                <DropdownMenuItem class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] text-rose-400 hover:bg-rose-500/10 outline-none cursor-pointer" @select="doLogout()">
                  <AppIcon name="solar:logout-3-linear" size="16" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
        </template>
        <template v-else>
          <NuxtLink to="/auth/dang-nhap" class="hidden sm:inline-flex items-center h-9 px-3.5 rounded-lg text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[.06] transition">
            Đăng nhập
          </NuxtLink>
          <NuxtLink to="/auth/dang-ky" class="inline-flex items-center h-9 px-4 rounded-lg bg-white text-[13.5px] font-semibold text-zinc-900 hover:bg-zinc-200 transition">
            Đăng ký
          </NuxtLink>
        </template>

        <button class="lg:hidden w-9 h-9 grid place-items-center rounded-lg text-zinc-400 hover:bg-white/[.06]" @click="mobileOpen = !mobileOpen">
          <AppIcon :name="mobileOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'" size="20" />
        </button>
      </div>
    </div>

    <div v-if="mobileOpen" class="hdr-mobile lg:hidden border-t px-4 py-3 space-y-1">
      <form class="relative mb-3" @submit.prevent="search">
        <AppIcon name="solar:magnifer-linear" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input v-model="term" type="search" placeholder="Tìm tài liệu..." class="w-full h-10 pl-9 pr-3 rounded-lg bg-white/[.06] border border-white/[.08] text-[13px] text-white placeholder:text-zinc-500 focus:outline-none" />
      </form>
      <NuxtLink
        v-for="n in [...NAV, { label: 'Đăng bán tài liệu', to: '/dashboard/tai-lieu' }]"
        :key="n.to"
        :to="n.to"
        class="block px-3 py-2.5 rounded-lg text-[14px] font-medium"
        :class="isOn(n.to) ? 'bg-white/[.08] text-white' : 'text-zinc-400 hover:bg-white/[.05] hover:text-white'"
      >
        {{ n.label }}
      </NuxtLink>
      <NuxtLink v-if="!auth.loggedIn" to="/auth/dang-nhap" class="block px-3 py-2.5 rounded-lg text-[14px] font-medium text-zinc-400 hover:text-white">
        Đăng nhập
      </NuxtLink>
    </div>
  </header>
</template>
