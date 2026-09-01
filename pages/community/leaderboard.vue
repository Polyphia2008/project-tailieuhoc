<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'default' })
useHead({ title: 'Bảng xếp hạng cộng đồng — MapDocs' })

const auth = useAuthStore()
const api = useApi()
const { num } = useFormat()

const PERIODS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'lifetime', label: 'Mọi thời gian' }
]

const SORTS = [
  { key: 'followers', label: 'Người theo dõi nhiều nhất' },
  { key: 'popularity', label: 'Độ nổi tiếng' },
  { key: 'newest', label: 'Người mới' }
]

const PODIUM = [
  {
    rank: 1,
    ring: 'ring-amber-400',
    badge: 'bg-gradient-to-br from-amber-300 to-amber-500',
    order: 'md:order-2',
    lift: 'md:-mt-6'
  },
  {
    rank: 2,
    ring: 'ring-slate-300',
    badge: 'bg-gradient-to-br from-slate-200 to-slate-400',
    order: 'md:order-1',
    lift: ''
  },
  {
    rank: 3,
    ring: 'ring-orange-400',
    badge: 'bg-gradient-to-br from-orange-300 to-orange-600',
    order: 'md:order-3',
    lift: ''
  }
]

const period = ref('all')
const sort = ref('followers')
const busy = ref<Record<string, boolean>>({})
const loading = ref(false)

const { data: initial } = await useFetch<any>('/api/community/leaderboard', {
  query: { limit: 50 },
  default: () => ({ data: { items: [], total: 0 } })
})

const items = ref<any[]>(initial.value?.data?.items || [])
const total = ref<number>(initial.value?.data?.total || 0)

const top3 = computed(() =>
  PODIUM.map((meta) => ({ meta, user: items.value.find((u) => u.rank === meta.rank) })).filter(
    (x) => x.user
  )
)
const rest = computed(() => items.value.filter((u) => u.rank > 3))

function avatarOf(u: any): string {
  return (
    u?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u?.username || 'mapdocs')}`
  )
}

async function load() {
  loading.value = true
  try {
    const res = await api.get<any>('/api/community/leaderboard', {
      period: period.value === 'lifetime' ? 'all' : period.value,
      sort: sort.value,
      limit: 50
    })
    items.value = res?.data?.items || []
    total.value = res?.data?.total || 0
  } catch {
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function toggleFollow(u: any) {
  if (!auth.loggedIn) {
    toast.error('Bạn cần đăng nhập để theo dõi thành viên')
    return
  }
  if (u.is_self) return
  busy.value = { ...busy.value, [u.id]: true }
  try {
    const res = u.is_following
      ? await api.del<any>(`/api/community/users/${u.id}/follow`)
      : await api.post<any>(`/api/community/users/${u.id}/follow`)
    if (res?.data) {
      u.is_following = res.data.following
      u.followers_count = res.data.followers_count
    }
    toast.success(u.is_following ? `Đã theo dõi ${u.name}` : `Đã bỏ theo dõi ${u.name}`)
  } catch (e: any) {
    toast.error(api.errMessage(e))
  } finally {
    busy.value = { ...busy.value, [u.id]: false }
  }
}

watch([period, sort], load)
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
    <header class="mb-8 text-center">
      <span
        class="mb-3 inline-flex items-center gap-2 rounded-full bg-cmstdev-500/12 px-3.5 py-1.5 text-xs font-semibold text-cmstdev-500"
      >
        <AppIcon name="solar:cup-star-bold-duotone" size="16" />
        {{ num(total) }} thành viên
      </span>
      <h1 class="text-2xl font-bold tracking-tight sm:text-4xl">Bảng xếp hạng cộng đồng</h1>
      <p class="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
        Khám phá những thành viên nổi bật nhất trên MapDocs
      </p>
    </header>

    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card p-1.5">
        <button
          v-for="p in PERIODS"
          :key="p.key"
          type="button"
          class="rounded-xl px-3 py-1.5 text-xs font-semibold transition sm:text-sm"
          :class="
            period === p.key
              ? 'bg-cmstdev-500 text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          "
          @click="period = p.key"
        >
          {{ p.label }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <AppIcon name="solar:filter-bold-duotone" size="18" class="text-muted-foreground" />
        <select
          v-model="sort"
          class="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium outline-none transition focus:border-cmstdev-500 sm:text-sm"
        >
          <option v-for="s in SORTS" :key="s.key" :value="s.key">{{ s.label }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="grid gap-4 md:grid-cols-3">
      <div v-for="n in 3" :key="n" class="rounded-2xl border border-border bg-card p-6">
        <div class="mx-auto h-24 w-24 animate-pulse rounded-full bg-muted" />
        <div class="mx-auto mt-4 h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div class="mx-auto mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>

    <template v-else>
      <div class="grid gap-4 md:grid-cols-3 md:items-end">
        <UiGradientBorder
          v-for="entry in top3"
          :key="entry.user.id"
          radius="20px"
          :inset="false"
          :duration="9"
          :intensity=".9"
          :class="[entry.meta.order, entry.meta.lift]"
        >
          <div class="flex flex-col items-center rounded-[19px] bg-card px-5 pb-5 pt-8 text-center">
            <div class="relative">
              <NuxtLink :to="`/profile/${entry.user.id}`">
                <img
                  :src="avatarOf(entry.user)"
                  :alt="entry.user.name"
                  class="h-24 w-24 rounded-full bg-muted ring-4 transition hover:scale-105"
                  :class="entry.meta.ring"
                />
              </NuxtLink>
              <span
                class="absolute -bottom-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
                :class="entry.meta.badge"
              >
                {{ entry.meta.rank }}
              </span>
              <AppIcon
                v-if="entry.meta.rank === 1"
                name="solar:crown-bold"
                size="26"
                class="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-400"
              />
            </div>

            <NuxtLink
              :to="`/profile/${entry.user.id}`"
              class="mt-5 flex items-center justify-center gap-1.5 text-base font-bold transition hover:text-cmstdev-500"
            >
              {{ entry.user.name }}
              <AppIcon
                v-if="entry.user.verified"
                name="solar:verified-check-bold"
                size="16"
                class="text-cmstdev-500"
              />
            </NuxtLink>
            <p class="text-xs text-muted-foreground">@{{ entry.user.username }}</p>

            <div class="mt-4 grid w-full grid-cols-2 gap-2">
              <div class="rounded-xl bg-muted/60 px-2 py-2">
                <p class="text-sm font-bold">{{ num(entry.user.followers_count) }}</p>
                <p class="text-[11px] text-muted-foreground">Theo dõi</p>
              </div>
              <div class="rounded-xl bg-muted/60 px-2 py-2">
                <p class="text-sm font-bold text-cmstdev-500">{{ num(entry.user.popularity) }}</p>
                <p class="text-[11px] text-muted-foreground">Nổi tiếng</p>
              </div>
            </div>

            <button
              v-if="!entry.user.is_self"
              type="button"
              class="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50"
              :class="
                entry.user.is_following
                  ? 'border border-border bg-transparent hover:bg-muted'
                  : 'bg-cmstdev-500 text-white hover:opacity-90'
              "
              :disabled="busy[entry.user.id]"
              @click="toggleFollow(entry.user)"
            >
              <AppIcon
                :name="entry.user.is_following ? 'solar:check-circle-bold' : 'solar:user-plus-linear'"
                size="16"
              />
              {{ entry.user.is_following ? 'Đang theo dõi' : 'Theo dõi' }}
            </button>
            <span
              v-else
              class="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground"
            >
              Bạn
            </span>
          </div>
        </UiGradientBorder>
      </div>

      <div v-if="rest.length" class="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div
          v-for="u in rest"
          :key="u.id"
          class="flex items-center gap-3 border-b border-border px-4 py-3.5 transition last:border-b-0 hover:bg-muted/50 sm:gap-4 sm:px-5"
        >
          <span class="w-7 shrink-0 text-center text-sm font-bold text-muted-foreground">
            {{ u.rank }}
          </span>
          <NuxtLink :to="`/profile/${u.id}`" class="shrink-0">
            <img
              :src="avatarOf(u)"
              :alt="u.name"
              class="h-11 w-11 rounded-full bg-muted ring-2 ring-border transition hover:ring-cmstdev-500"
            />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <NuxtLink
              :to="`/profile/${u.id}`"
              class="flex items-center gap-1.5 truncate text-sm font-semibold transition hover:text-cmstdev-500"
            >
              {{ u.name }}
              <AppIcon
                v-if="u.verified"
                name="solar:verified-check-bold"
                size="14"
                class="shrink-0 text-cmstdev-500"
              />
            </NuxtLink>
            <p class="truncate text-xs text-muted-foreground">@{{ u.username }}</p>
          </div>
          <div class="hidden text-right sm:block">
            <p class="text-sm font-bold">{{ num(u.followers_count) }}</p>
            <p class="text-[11px] text-muted-foreground">Theo dõi</p>
          </div>
          <div class="hidden text-right sm:block">
            <p class="text-sm font-bold text-cmstdev-500">{{ num(u.popularity) }}</p>
            <p class="text-[11px] text-muted-foreground">Nổi tiếng</p>
          </div>
          <button
            v-if="!u.is_self"
            type="button"
            class="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
            :class="
              u.is_following
                ? 'border border-border hover:bg-muted'
                : 'bg-cmstdev-500 text-white hover:opacity-90'
            "
            :disabled="busy[u.id]"
            @click="toggleFollow(u)"
          >
            {{ u.is_following ? 'Đang theo dõi' : 'Theo dõi' }}
          </button>
          <span v-else class="shrink-0 text-xs font-semibold text-muted-foreground">Bạn</span>
        </div>
      </div>

      <p v-if="!items.length" class="py-20 text-center text-sm text-muted-foreground">
        Chưa có dữ liệu xếp hạng cho bộ lọc này.
      </p>
    </template>
  </div>
</template>
