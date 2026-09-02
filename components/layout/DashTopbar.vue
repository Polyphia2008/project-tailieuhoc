<script setup lang="ts">
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverClose } from 'radix-vue'

const props = withDefaults(defineProps<{ admin?: boolean }>(), { admin: false })

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const { money } = useFormat()

const term = ref('')
const notifOpen = ref(false)
const notifs = ref<any[]>([])
const loadingNotif = ref(false)

async function search() {
  const q = term.value.trim()
  await router.push(q ? `/tai-lieu?q=${encodeURIComponent(q)}` : '/tai-lieu')
  term.value = ''
}

async function loadNotifs() {
  if (notifs.value.length || loadingNotif.value) return
  loadingNotif.value = true
  try {
    const res = await $fetch<{ items: any[] }>('/api/user/notifications', { query: { limit: 8 } })
    notifs.value = res.items || []
  } catch {} finally {
    loadingNotif.value = false
  }
}

async function readAll() {
  await auth.markAllRead()
  notifs.value = notifs.value.map((n) => ({ ...n, read: true }))
}

async function doLogout() {
  await auth.logout()
  await router.push('/')
}

const { ago } = useFormat()
const { avatarUrl, seedOf } = useAvatar()

const TYPE_TONE: Record<string, string> = {
  success: 'text-emerald-400',
  info: 'text-primary-400',
  warning: 'text-amber-400',
  error: 'text-rose-400'
}

const QUICK: { label: string; to: string; icon: string }[] = [
  { label: 'Cộng đồng', to: '/tai-lieu', icon: 'solar:users-group-rounded-linear' },
  { label: 'Bảng tin', to: '/blog', icon: 'solar:notes-linear' },
  { label: 'Xếp hạng', to: '/tai-lieu?sort=rating', icon: 'solar:cup-star-linear' },
  { label: 'Tài khoản', to: '/dashboard/ho-so', icon: 'solar:user-circle-linear' },
  { label: 'Giao dịch', to: '/dashboard/doanh-thu', icon: 'solar:bill-list-linear' },
  { label: 'Bảo mật', to: '/dashboard/ho-so#security', icon: 'solar:shield-keyhole-linear' },
  { label: 'Nạp tiền', to: '/dashboard/doanh-thu', icon: 'solar:card-transfer-linear' },
  { label: 'Hỗ trợ', to: '/ho-tro', icon: 'solar:chat-round-line-linear' },
  { label: 'Bài viết', to: '/blog', icon: 'solar:document-add-linear' }
]

const roleLabel = computed(() =>
  auth.user?.role === 'admin' ? 'Quản trị viên' : auth.user?.role === 'seller' ? 'Người bán' : 'Thành viên'
)

const dropdownAvatar = computed(
  () => auth.user?.avatar || avatarUrl(seedOf(auth.user?.name || auth.user?.email || 'mapdocs'))
)

const LOCALE_KEY = 'mapdocs:locale'
const CURRENCY_KEY = 'mapdocs:currency'

const LOCALES = [
  { code: 'vi', label: 'Tiếng Việt', hint: 'Vietnamese' },
  { code: 'en', label: 'English', hint: 'United States' }
]

const CURRENCIES = [
  { code: 'VND', label: 'VND', hint: 'Việt Nam Đồng' },
  { code: 'USD', label: 'USD', hint: 'US Dollar' },
  { code: 'EUR', label: 'EUR', hint: 'Euro' }
]

const localeOpen = ref(false)
const localeTab = ref<'locale' | 'currency'>('locale')
const localeQuery = ref('')
const locale = ref('vi')
const currency = ref('VND')

const filteredLocales = computed(() => {
  const q = localeQuery.value.trim().toLowerCase()
  if (!q) return LOCALES
  return LOCALES.filter((l) => l.label.toLowerCase().includes(q) || l.hint.toLowerCase().includes(q))
})

const localeSummary = computed(() => {
  const l = LOCALES.find((x) => x.code === locale.value)
  return `${l?.label || 'Tiếng Việt'} · ${currency.value}`
})

function pickLocale(code: string) {
  locale.value = code
  try {
    localStorage.setItem(LOCALE_KEY, code)
  } catch {}
}

function pickCurrency(code: string) {
  currency.value = code
  try {
    localStorage.setItem(CURRENCY_KEY, code)
  } catch {}
}

onMounted(() => {
  try {
    const l = localStorage.getItem(LOCALE_KEY)
    const c = localStorage.getItem(CURRENCY_KEY)
    if (l && LOCALES.some((x) => x.code === l)) locale.value = l
    if (c && CURRENCIES.some((x) => x.code === c)) currency.value = c
  } catch {}
})
</script>

<template>
  <header class="mdk-topbar sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6">
    <button class="lg:hidden w-9 h-9 grid place-items-center rounded-lg text-mdk-sub hover:bg-mdk-line" @click="ui.toggleSidebar()">
      <AppIcon name="solar:hamburger-menu-linear" size="20" />
    </button>

    <form class="relative hidden sm:block w-[220px] lg:w-[300px]" @submit.prevent="search">
      <AppIcon name="solar:magnifer-line-duotone" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute pointer-events-none" />
      <input v-model="term" type="search" placeholder="Tìm kiếm tài liệu..." class="mdk-search w-full pl-9 pr-14" />
      <span class="mdk-kbd absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">⌘K</span>
    </form>

    <div class="flex-1" />

    <div class="hidden xl:flex items-center gap-2">
      <span class="mdk-chip">
        <span class="w-5 h-5 rounded-full grid place-items-center text-white text-[10px]" style="background: linear-gradient(135deg,#fbbf24,#d97706)">
          <AppIcon name="solar:cup-star-bold" size="11" />
        </span>
        <span class="text-[10px] uppercase tracking-wide text-mdk-mute">Hoa hồng</span>
        <b>15%</b>
      </span>
      <span class="mdk-chip">
        <span class="w-5 h-5 rounded-full grid place-items-center text-white text-[10px]" style="background: linear-gradient(135deg,#60a5fa,#2563eb)">
          <AppIcon name="solar:wallet-bold" size="11" />
        </span>
        <span class="text-[10px] uppercase tracking-wide text-mdk-mute">Số dư</span>
        <b class="tabular-nums">{{ money(auth.balance) }}</b>
      </span>
    </div>

    <PopoverRoot v-model:open="localeOpen">
      <PopoverTrigger as-child>
        <button
          type="button"
          aria-label="Ngôn ngữ và tiền tệ"
          title="Ngôn ngữ và tiền tệ"
          class="w-9 h-9 grid place-items-center rounded-lg text-mdk-sub transition hover:bg-cmstdev/10 hover:text-cmstdev"
        >
          <AppIcon name="solar:global-linear" size="18" />
        </button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent side="bottom" align="end" :side-offset="8" :collision-padding="12" class="lc-pop">
          <div class="lc-tabs">
            <button type="button" class="lc-tab" :class="localeTab === 'locale' ? 'lc-tab-active' : ''" @click="localeTab = 'locale'">
              Ngôn ngữ
            </button>
            <button type="button" class="lc-tab" :class="localeTab === 'currency' ? 'lc-tab-active' : ''" @click="localeTab = 'currency'">
              Tiền tệ
            </button>
          </div>

          <div v-if="localeTab === 'locale'" class="lc-body">
            <div class="lc-search">
              <AppIcon name="solar:magnifer-line-duotone" size="15" class="lc-search-icon" />
              <input v-model="localeQuery" type="search" placeholder="Tìm kiếm ngôn ngữ..." />
            </div>
            <p v-if="!filteredLocales.length" class="lc-empty">Không tìm thấy ngôn ngữ.</p>
            <button
              v-for="l in filteredLocales"
              :key="l.code"
              type="button"
              class="lc-row"
              :class="locale === l.code ? 'lc-row-active' : ''"
              @click="pickLocale(l.code)"
            >
              <AppIcon name="solar:global-linear" size="17" class="lc-row-icon" />
              <span class="lc-row-text">
                <span class="lc-row-label">{{ l.label }}</span>
                <span class="lc-row-hint">{{ l.hint }}</span>
              </span>
              <AppIcon v-if="locale === l.code" name="solar:check-circle-bold" size="14" class="lc-row-check" />
            </button>
          </div>

          <div v-else class="lc-body">
            <button
              v-for="cu in CURRENCIES"
              :key="cu.code"
              type="button"
              class="lc-row"
              :class="currency === cu.code ? 'lc-row-active' : ''"
              @click="pickCurrency(cu.code)"
            >
              <AppIcon name="solar:wallet-money-bold-duotone" size="17" class="lc-row-icon" />
              <span class="lc-row-text">
                <span class="lc-row-label">{{ cu.label }}</span>
                <span class="lc-row-hint">{{ cu.hint }}</span>
              </span>
              <AppIcon v-if="currency === cu.code" name="solar:check-circle-bold" size="14" class="lc-row-check" />
            </button>
          </div>

          <div class="lc-foot">
            <span class="lc-foot-text">{{ localeSummary }}</span>
            <PopoverClose class="lc-done">Xong</PopoverClose>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>

    <UiThemeToggle />

    <NuxtLink to="/" class="w-9 h-9 grid place-items-center rounded-lg text-mdk-sub hover:bg-mdk-line transition" title="Về trang chủ">
      <AppIcon name="solar:home-2-linear" size="18" />
    </NuxtLink>

    <DropdownMenuRoot v-model:open="notifOpen">
      <DropdownMenuTrigger
        class="relative w-9 h-9 grid place-items-center rounded-lg text-mdk-sub hover:bg-mdk-line transition"
        @click="loadNotifs()"
      >
        <AppIcon name="solar:bell-bold-duotone" size="19" />
        <span
          v-if="auth.unread > 0"
          class="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold grid place-items-center border-2 border-mdk-bg"
        >
          {{ auth.unread > 9 ? '9+' : auth.unread }}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          :side-offset="8"
          class="z-[60] w-[330px] rounded-xl border border-mdk-line bg-mdk-panel shadow-2xl overflow-hidden animate-scale-in"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-mdk-line">
            <p class="text-[13px] font-semibold text-mdk-text font-ui">Thông báo</p>
            <button v-if="auth.unread > 0" class="text-[11.5px] text-primary-400 hover:text-primary-300" @click="readAll()">
              Đọc tất cả
            </button>
          </div>
          <div class="max-h-[330px] overflow-y-auto">
            <div v-if="loadingNotif" class="p-6 grid place-items-center text-mdk-mute">
              <UiSpinner :size="20" />
            </div>
            <p v-else-if="!notifs.length" class="px-4 py-8 text-center text-[12.5px] text-mdk-mute">Chưa có thông báo nào</p>
            <NuxtLink
              v-for="n in notifs"
              :key="n.id"
              :to="n.link || '/dashboard'"
              class="flex gap-3 px-4 py-3 border-b border-mdk-line/70 last:border-0 hover:bg-mdk-soft transition"
              :class="!n.read ? 'bg-primary-500/[.06]' : ''"
            >
              <AppIcon
                :name="n.type === 'success' ? 'solar:check-circle-bold' : n.type === 'error' ? 'solar:close-circle-bold' : n.type === 'warning' ? 'solar:danger-triangle-bold' : 'solar:info-circle-bold'"
                size="17"
                class="shrink-0 mt-0.5"
                :class="TYPE_TONE[n.type] || 'text-mdk-mute'"
              />
              <span class="min-w-0">
                <span class="block text-[12.5px] font-medium text-mdk-text leading-snug">{{ n.title }}</span>
                <span class="block mt-0.5 text-[11.5px] text-mdk-sub leading-snug line-clamp-2">{{ n.body }}</span>
                <span class="block mt-1 text-[10.5px] text-mdk-mute">{{ ago(n.created_at) }}</span>
              </span>
            </NuxtLink>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>

    <DropdownMenuRoot>
      <DropdownMenuTrigger
        data-testid="user-menu-trigger"
        class="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-full border border-mdk-line bg-mdk-panel transition hover:border-cmstdev/40"
      >
        <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="28" online />
        <span class="hidden md:block max-w-[110px] truncate text-[12.5px] font-medium text-mdk-text">
          {{ auth.user?.name || 'Tài khoản' }}
        </span>
        <AppIcon name="solar:alt-arrow-down-linear" size="12" class="text-mdk-mute" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          side="bottom"
          align="end"
          :side-offset="8"
          data-testid="user-menu-content"
          class="z-[100] w-[340px] rounded-2xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-2xl"
        >
          <div class="flex items-center gap-3 rounded-xl border border-cmstdev/15 bg-gradient-to-br from-cmstdev/15 via-cmstdev/5 to-transparent p-3">
            <span class="relative shrink-0">
              <img
                :src="dropdownAvatar"
                alt=""
                width="48"
                height="48"
                class="size-12 rounded-full bg-background object-cover ring-2 ring-cmstdev/30"
              >
              <span class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-popover bg-emerald-500" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-1">
                <span class="truncate text-[13.5px] font-semibold text-foreground">{{ auth.user?.name || 'Tài khoản' }}</span>
                <AppIcon name="solar:verified-check-bold" size="15" class="shrink-0 text-cmstdev" />
              </span>
              <span class="block truncate text-[11.5px] text-muted-foreground">{{ auth.user?.email }}</span>
              <span class="mt-1 inline-flex items-center rounded-md bg-cmstdev/10 px-1.5 py-0.5 text-[10px] font-medium text-cmstdev">
                {{ roleLabel }}
              </span>
            </span>
          </div>

          <div class="group/wallet relative mt-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-cmstdev to-cmstdev-600 p-3.5">
            <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/wallet:translate-x-full" />
            <AppIcon
              name="solar:wallet-money-linear"
              size="84"
              class="pointer-events-none absolute -bottom-4 -right-3 text-white/10"
            />
            <div class="relative flex items-start justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-white/85">
                <AppIcon name="solar:wallet-linear" size="14" />
                Số dư ví
              </span>
              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/dashboard/doanh-thu"
                  class="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-[10.5px] font-semibold text-white outline-none transition hover:bg-white/30"
                >
                  <AppIcon name="solar:card-transfer-linear" size="13" />
                  Nạp tiền
                </NuxtLink>
              </DropdownMenuItem>
            </div>
            <p class="relative mt-1 text-[21px] font-bold tabular-nums text-white">{{ money(auth.balance) }}</p>
          </div>

          <div class="mt-2 grid grid-cols-3 gap-y-3 px-1 py-2">
            <DropdownMenuItem v-for="q in QUICK" :key="q.label" as-child>
              <NuxtLink :to="q.to" class="group flex cursor-pointer flex-col items-center gap-1.5 outline-none">
                <span class="rounded-xl bg-cmstdev/5 p-2 text-cmstdev transition-all duration-300 group-hover:bg-cmstdev group-hover:text-white">
                  <AppIcon :name="q.icon" size="20" />
                </span>
                <span class="text-[10px] font-medium text-muted-foreground group-hover:text-cmstdev">{{ q.label }}</span>
              </NuxtLink>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator class="my-1 h-px bg-border" />

          <DropdownMenuItem v-if="auth.isAdmin" as-child>
            <NuxtLink
              :to="admin ? '/dashboard' : '/admin'"
              class="mb-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 px-2.5 py-2 text-xs font-medium text-amber-600 outline-none transition hover:bg-amber-500/20 dark:text-amber-400"
            >
              <AppIcon name="solar:shield-user-linear" size="16" />
              {{ admin ? 'Về dashboard' : 'Trang quản trị' }}
            </NuxtLink>
          </DropdownMenuItem>

          <DropdownMenuItem as-child @select="doLogout()">
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-2.5 py-2 text-xs font-medium text-red-600 outline-none transition hover:bg-red-500/20 dark:text-red-400"
            >
              <AppIcon name="solar:logout-2-linear" size="16" />
              Đăng xuất
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </header>
</template>

<style>
.lc-pop {
  z-index: 100;
  width: 320px;
  max-width: calc(100vw - 24px);
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgb(var(--border) / 0.8);
  background: rgb(var(--background) / 0.95);
  backdrop-filter: blur(48px);
  -webkit-backdrop-filter: blur(48px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgb(var(--foreground) / 0.04);
  color: rgb(var(--foreground));
  transform-origin: var(--radix-popover-content-transform-origin);
}

.lc-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 10px 12px 0;
}

.lc-tab {
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--muted-foreground));
  transition: background-color 0.15s ease, color 0.15s ease;
}

.lc-tab:hover {
  background: rgb(var(--muted));
  color: rgb(var(--foreground));
}

.lc-tab-active,
.lc-tab-active:hover {
  background: rgb(var(--cmstdev) / 0.1);
  color: rgb(var(--cmstdev));
}

.lc-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  overflow-y: auto;
  padding: 10px 12px;
}

.lc-search {
  position: relative;
  margin-bottom: 6px;
}

.lc-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgb(var(--muted-foreground));
}

.lc-search input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgb(var(--border) / 0.8);
  background: rgb(var(--muted) / 0.6);
  padding: 8px 10px 8px 32px;
  font-size: 13px;
  color: rgb(var(--foreground));
  outline: none;
}

.lc-search input::placeholder {
  color: rgb(var(--muted-foreground));
}

.lc-search input:focus {
  border-color: rgb(var(--cmstdev) / 0.5);
  background: rgb(var(--background));
}

.lc-empty {
  padding: 14px 4px;
  text-align: center;
  font-size: 12.5px;
  color: rgb(var(--muted-foreground));
}

.lc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border-radius: 10px;
  padding: 8px 10px;
  text-align: left;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.lc-row:hover {
  background: rgb(var(--muted));
}

.lc-row-active,
.lc-row-active:hover {
  background: rgb(var(--cmstdev) / 0.1);
  color: rgb(var(--cmstdev));
}

.lc-row-icon {
  flex-shrink: 0;
  color: rgb(var(--muted-foreground));
}

.lc-row-active .lc-row-icon,
.lc-row-active .lc-row-label {
  color: rgb(var(--cmstdev));
}

.lc-row-text {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.lc-row-label {
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--foreground));
}

.lc-row-hint {
  font-size: 11.5px;
  color: rgb(var(--muted-foreground));
}

.lc-row-check {
  flex-shrink: 0;
  color: rgb(var(--cmstdev));
}

.lc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid rgb(var(--border) / 0.7);
  background: rgb(var(--muted) / 0.4);
  padding: 10px 12px;
}

.lc-foot-text {
  font-size: 12px;
  color: rgb(var(--muted-foreground));
}

.lc-done {
  border-radius: 9px;
  background: rgb(var(--cmstdev));
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #fff;
  transition: opacity 0.15s ease;
}

.lc-done:hover {
  opacity: 0.9;
}

.lc-pop[data-state='open'] {
  animation: lc-in 0.14s ease-out;
}

@keyframes lc-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lc-pop[data-state='open'] {
    animation: none;
  }
}
</style>
