<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()
const { date, dateTime, money } = useFormat()
const { avatarUrl, seedOf } = useAvatar()

const f = reactive({
  name: auth.user?.name || '',
  bio: auth.user?.bio || '',
  phone: auth.user?.phone || '',
  avatar: auth.user?.avatar || '',
  bank_name: (auth.user as any)?.bank_name || '',
  bank_account: (auth.user as any)?.bank_account || ''
})

const pw = reactive({ current_password: '', new_password: '', confirm_password: '' })

const busy = ref(false)
const busyBank = ref(false)
const busyPw = ref(false)

const { data: statsRes } = await useFetch<{ cards: Record<string, number> }>('/api/user/stats', {
  query: { days: 30 },
  default: () => ({ cards: {} })
})

const { data: loginRes, refresh: refreshLogins } = await useFetch<{ items: any[] }>('/api/user/logins', {
  default: () => ({ items: [] })
})

const cards = computed(() => statsRes.value?.cards || {})
const logins = computed(() => loginRes.value?.items || [])

const roleLabel = computed(() =>
  auth.user?.role === 'admin' ? 'Quản trị viên' : auth.user?.role === 'seller' ? 'Người bán' : 'Thành viên'
)

const fallbackAvatar = computed(() => avatarUrl(seedOf(auth.user?.name || auth.user?.email || 'mapdocs')))
const heroAvatar = computed(() => f.avatar || auth.user?.avatar || fallbackAvatar.value)

async function saveProfile() {
  busy.value = true
  try {
    await $fetch('/api/user/profile', {
      method: 'PUT',
      body: { name: f.name, bio: f.bio, phone: f.phone, avatar: f.avatar }
    })
    await auth.refresh()
    toast.success('Đã cập nhật thông tin cá nhân')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thể cập nhật thông tin')
  } finally {
    busy.value = false
  }
}

async function saveBank() {
  busyBank.value = true
  try {
    await $fetch('/api/user/profile', {
      method: 'PUT',
      body: { bank_name: f.bank_name, bank_account: f.bank_account }
    })
    await auth.refresh()
    toast.success('Đã lưu tài khoản nhận tiền')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thể lưu tài khoản nhận tiền')
  } finally {
    busyBank.value = false
  }
}

async function savePassword() {
  if (pw.new_password.length < 6) {
    toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
    return
  }
  if (pw.new_password !== pw.confirm_password) {
    toast.error('Mật khẩu xác nhận không khớp')
    return
  }
  busyPw.value = true
  try {
    await $fetch('/api/user/profile', {
      method: 'PUT',
      body: { current_password: pw.current_password, new_password: pw.new_password }
    })
    pw.current_password = ''
    pw.new_password = ''
    pw.confirm_password = ''
    toast.success('Đã đổi mật khẩu thành công')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thể đổi mật khẩu')
  } finally {
    busyPw.value = false
  }
}

function randomAvatar() {
  const seed = Math.random().toString(36).slice(2, 10)
  f.avatar = avatarUrl(seed)
}

function useDefaultAvatar() {
  f.avatar = ''
}

onMounted(() => refreshLogins())

useHead({ title: 'Hồ sơ cá nhân - MapDocs' })
</script>

<template>
  <div class="max-w-[1100px]">
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/" class="transition-colors hover:text-cmstdev">Trang chủ</NuxtLink>
      <span>/</span>
      <span class="text-mdk-sub">Hồ sơ cá nhân</span>
    </nav>

    <header class="mt-3 flex items-start gap-3">
      <span class="grid size-11 shrink-0 place-items-center rounded-xl border border-cmstdev/20 bg-cmstdev/10 text-cmstdev">
        <AppIcon name="solar:user-circle-linear" size="22" />
      </span>
      <div class="min-w-0">
        <h1 class="text-[22px] font-bold tracking-tight text-mdk-text font-ui">Hồ sơ cá nhân</h1>
        <p class="mt-0.5 text-[13px] text-mdk-mute">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>
    </header>

    <section
      data-testid="profile-hero"
      class="panel-dv relative mt-6 overflow-hidden p-6"
    >
      <div class="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-cmstdev/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-cmstdev/5 blur-3xl" />

      <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <span class="relative shrink-0 self-start sm:self-center">
          <img
            :src="heroAvatar"
            alt=""
            width="112"
            height="112"
            class="size-[104px] rounded-full bg-background object-cover ring-4 ring-cmstdev/30 transition-transform duration-500 hover:scale-105 sm:size-28"
          >
          <span class="absolute bottom-2 right-2 size-4 rounded-full border-[3px] border-card bg-emerald-500" />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-[20px] font-bold text-foreground font-ui">{{ auth.user?.name || 'Người dùng' }}</h2>
            <AppIcon name="solar:verified-check-bold" size="18" class="text-cmstdev" />
          </div>
          <p class="mt-0.5 truncate text-[13px] text-muted-foreground">{{ auth.user?.email }}</p>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-lg border border-cmstdev/20 bg-cmstdev/10 px-2.5 py-1 text-[11.5px] font-semibold text-cmstdev">
              <AppIcon name="solar:shield-user-linear" size="13" />
              {{ roleLabel }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-[11.5px] text-muted-foreground">
              <AppIcon name="solar:calendar-linear" size="13" />
              Tham gia {{ date(auth.user?.created_at) }}
            </span>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" class="btn-cmstdev h-9 px-3 text-[12.5px] font-semibold" @click="randomAvatar()">
              <AppIcon name="solar:camera-linear" size="15" />
              Đổi ảnh đại diện
            </button>
            <button
              type="button"
              class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/70 px-3 text-[12.5px] font-medium text-muted-foreground transition hover:border-cmstdev/40 hover:text-cmstdev"
              @click="useDefaultAvatar()"
            >
              <AppIcon name="solar:refresh-circle-linear" size="15" />
              Dùng ảnh mặc định
            </button>
          </div>
        </div>

        <dl class="relative grid shrink-0 grid-cols-2 gap-3 sm:w-[240px]">
          <div class="rounded-xl border border-border/50 bg-muted/30 p-3">
            <dt class="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Số dư</dt>
            <dd class="mt-1 text-[15px] font-bold tabular-nums text-cmstdev">{{ money(auth.balance) }}</dd>
          </div>
          <div class="rounded-xl border border-border/50 bg-muted/30 p-3">
            <dt class="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Doanh thu</dt>
            <dd class="mt-1 text-[15px] font-bold tabular-nums text-foreground">{{ money(cards.revenue || 0) }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="mt-5 grid gap-5 lg:grid-cols-2">
      <form class="panel-dv p-5" @submit.prevent="saveProfile">
        <div class="flex items-center gap-2.5">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-cmstdev/10 text-cmstdev">
            <AppIcon name="solar:user-circle-linear" size="18" />
          </span>
          <h3 class="text-[15px] font-bold text-foreground font-ui">Thông tin cá nhân</h3>
        </div>

        <div class="mt-4 space-y-3.5">
          <div>
            <label class="label-dv" for="pf-name">Họ và tên</label>
            <input id="pf-name" v-model="f.name" class="input-dv" placeholder="Nguyễn Văn A">
          </div>
          <div>
            <label class="label-dv" for="pf-email">Email liên lạc</label>
            <input id="pf-email" :value="auth.user?.email" class="input-dv" disabled>
          </div>
          <div>
            <label class="label-dv" for="pf-phone">Số điện thoại</label>
            <input id="pf-phone" v-model="f.phone" class="input-dv" placeholder="09xxxxxxxx">
          </div>
          <div>
            <label class="label-dv" for="pf-bio">Giới thiệu</label>
            <textarea id="pf-bio" v-model="f.bio" rows="3" class="input-dv" placeholder="Giới thiệu ngắn về bạn..." />
          </div>
          <div>
            <label class="label-dv" for="pf-avatar">Ảnh đại diện (URL)</label>
            <input id="pf-avatar" v-model="f.avatar" class="input-dv" placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=...">
          </div>
        </div>

        <button type="submit" class="btn-cmstdev mt-4 h-10 w-full text-[13.5px] font-bold" :disabled="busy">
          <UiSpinner v-if="busy" :size="16" />
          Lưu thông tin
        </button>
      </form>

      <form class="panel-dv p-5" @submit.prevent="saveBank">
        <div class="flex items-center gap-2.5">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-cmstdev/10 text-cmstdev">
            <AppIcon name="solar:card-2-linear" size="18" />
          </span>
          <h3 class="text-[15px] font-bold text-foreground font-ui">Tài khoản nhận tiền</h3>
        </div>

        <div class="mt-4 space-y-3.5">
          <div>
            <label class="label-dv" for="pf-bank">Ngân hàng</label>
            <input id="pf-bank" v-model="f.bank_name" class="input-dv" placeholder="Vietcombank">
          </div>
          <div>
            <label class="label-dv" for="pf-acc">Số tài khoản</label>
            <input id="pf-acc" v-model="f.bank_account" class="input-dv" placeholder="0123456789">
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="rounded-xl border border-border/50 bg-muted/30 p-3.5">
              <p class="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Số dư khả dụng</p>
              <p class="mt-1 text-[17px] font-bold tabular-nums text-cmstdev">{{ money(auth.balance) }}</p>
            </div>
            <div class="rounded-xl border border-border/50 bg-muted/30 p-3.5">
              <p class="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Tổng doanh thu</p>
              <p class="mt-1 text-[17px] font-bold tabular-nums text-foreground">{{ money(cards.revenue || 0) }}</p>
            </div>
          </div>

          <NuxtLink
            to="/dashboard/doanh-thu"
            class="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-cmstdev transition hover:underline"
          >
            <AppIcon name="solar:card-transfer-linear" size="15" />
            Quản lý nạp và rút tiền
          </NuxtLink>
        </div>

        <button type="submit" class="btn-cmstdev mt-4 h-10 w-full text-[13.5px] font-bold" :disabled="busyBank">
          <UiSpinner v-if="busyBank" :size="16" />
          Lưu tài khoản
        </button>
      </form>

      <form id="security" class="panel-dv p-5" @submit.prevent="savePassword">
        <div class="flex items-center gap-2.5">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-cmstdev/10 text-cmstdev">
            <AppIcon name="solar:shield-keyhole-linear" size="18" />
          </span>
          <h3 class="text-[15px] font-bold text-foreground font-ui">Đổi mật khẩu</h3>
        </div>

        <div class="mt-4 space-y-3.5">
          <div>
            <label class="label-dv" for="pf-pw0">Mật khẩu hiện tại</label>
            <input id="pf-pw0" v-model="pw.current_password" type="password" class="input-dv" autocomplete="current-password">
          </div>
          <div>
            <label class="label-dv" for="pf-pw1">Mật khẩu mới</label>
            <input id="pf-pw1" v-model="pw.new_password" type="password" class="input-dv" autocomplete="new-password" placeholder="Ít nhất 6 ký tự">
          </div>
          <div>
            <label class="label-dv" for="pf-pw2">Xác nhận mật khẩu mới</label>
            <input id="pf-pw2" v-model="pw.confirm_password" type="password" class="input-dv" autocomplete="new-password">
          </div>
        </div>

        <button type="submit" class="btn-cmstdev mt-4 h-10 w-full text-[13.5px] font-bold" :disabled="busyPw">
          <UiSpinner v-if="busyPw" :size="16" />
          Cập nhật mật khẩu
        </button>
      </form>

      <section class="panel-dv p-5">
        <div class="flex items-center gap-2.5">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-cmstdev/10 text-cmstdev">
            <AppIcon name="solar:history-linear" size="18" />
          </span>
          <h3 class="text-[15px] font-bold text-foreground font-ui">Lịch sử đăng nhập</h3>
        </div>

        <p v-if="!logins.length" class="mt-6 text-center text-[12.5px] text-muted-foreground">
          Chưa ghi nhận lượt đăng nhập nào.
        </p>

        <ul v-else class="mt-4 divide-y divide-border/60">
          <li v-for="(l, i) in logins" :key="i" class="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span class="grid size-8 shrink-0 place-items-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
              <AppIcon name="solar:monitor-smartphone-linear" size="15" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[12.5px] font-semibold text-foreground">{{ l.device || 'Không rõ' }}</span>
              <span class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                <span class="inline-flex items-center gap-1">
                  <AppIcon name="solar:global-linear" size="12" />{{ l.ip || '-' }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <AppIcon name="solar:map-point-linear" size="12" />{{ l.location || 'Việt Nam' }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <AppIcon name="solar:clock-circle-linear" size="12" />{{ dateTime(l.at) }}
                </span>
              </span>
            </span>
            <span
              class="shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-semibold"
              :class="l.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'"
            >
              {{ l.status === 'success' ? 'Thành công' : 'Thất bại' }}
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
