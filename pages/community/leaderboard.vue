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
  { rank: 1, cls: 'lb-gold', avatar: 'lb-avatar-1', badge: 'lb-badge-1' },
  { rank: 2, cls: 'lb-silver', avatar: 'lb-avatar-2', badge: 'lb-badge-2' },
  { rank: 3, cls: 'lb-bronze', avatar: 'lb-avatar-3', badge: 'lb-badge-3' }
]

const period = ref('all')
const sort = ref('followers')
const search = ref('')
const busy = ref<Record<string, boolean>>({})
const loading = ref(false)

const { data: initial } = await useFetch<any>('/api/community/leaderboard', {
  query: { limit: 50 },
  default: () => ({ data: { items: [], total: 0 } })
})

const items = ref<any[]>(initial.value?.data?.items || [])
const total = ref<number>(initial.value?.data?.total || 0)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (u) =>
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.username || '').toLowerCase().includes(q)
  )
})

const searching = computed(() => Boolean(search.value.trim()))

const podium = computed(() =>
  PODIUM.map((meta) => ({ meta, user: items.value.find((u) => u.rank === meta.rank) })).filter(
    (x) => x.user
  )
)

const rank1 = computed(() => podium.value.find((e) => e.meta.rank === 1))
const rank23 = computed(() => podium.value.filter((e) => e.meta.rank !== 1))
const rest = computed(() => (searching.value ? filtered.value : items.value.filter((u) => u.rank > 3)))

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
  <div class="lb-shell">
    <nav class="lb-crumb">
      <NuxtLink to="/" class="lb-crumb-link">Trang chủ</NuxtLink>
      <span class="lb-crumb-sep">/</span>
      <NuxtLink to="/community" class="lb-crumb-link">Cộng đồng</NuxtLink>
      <span class="lb-crumb-sep">/</span>
      <span class="lb-crumb-current">Bảng xếp hạng</span>
    </nav>

    <header class="lb-head">
      <span class="lb-head-icon">
        <AppIcon name="solar:ranking-bold-duotone" size="26" />
      </span>
      <div class="min-w-0 flex-1">
        <h1 class="lb-title">Bảng xếp hạng cộng đồng</h1>
        <p class="lb-sub">Khám phá những thành viên nổi bật nhất trên MapDocs</p>
      </div>
      <span class="lb-count">
        <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="15" />
        {{ num(total) }} thành viên
      </span>
    </header>

    <div class="lb-toolbar">
      <label class="lb-search">
        <AppIcon name="solar:magnifer-line-duotone" size="17" class="lb-search-icon" />
        <input v-model="search" type="search" placeholder="Tìm thành viên trong bảng xếp hạng..." />
      </label>

      <div class="lb-periods">
        <button
          v-for="p in PERIODS"
          :key="p.key"
          type="button"
          class="lb-pill"
          :class="period === p.key ? 'lb-pill-active' : ''"
          @click="period = p.key"
        >
          {{ p.label }}
        </button>
      </div>

      <div class="lb-sort">
        <AppIcon name="solar:filter-bold-duotone" size="17" class="text-muted-foreground" />
        <select v-model="sort">
          <option v-for="s in SORTS" :key="s.key" :value="s.key">{{ s.label }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="lb-skeleton">
      <div v-for="n in 3" :key="n" class="lb-skeleton-card">
        <div class="lb-skeleton-avatar" />
        <div class="lb-skeleton-line" />
        <div class="lb-skeleton-line lb-skeleton-line-sm" />
      </div>
    </div>

    <template v-else>
      <section v-if="!searching && podium.length" class="lb-podium-wrap">
        <div v-if="rank1" class="lb-podium-top">
          <UiGradientBorder radius="22px" :inset="false" :duration="9" :intensity=".95">
            <div class="lb-card lb-card-1">
              <AppIcon name="solar:crown-bold-duotone" size="30" class="lb-crown" />
              <div class="lb-avatar-wrap">
                <NuxtLink :to="`/profile/${rank1.user.id}`">
                  <img
                    :src="avatarOf(rank1.user)"
                    :alt="rank1.user.name"
                    class="lb-avatar lb-avatar-1 lb-gold"
                  />
                </NuxtLink>
                <span class="lb-badge lb-badge-1">1</span>
              </div>
              <NuxtLink :to="`/profile/${rank1.user.id}`" class="lb-name lb-name-1">
                {{ rank1.user.name }}
                <AppIcon
                  v-if="rank1.user.verified"
                  name="solar:verified-check-bold"
                  size="17"
                  class="text-cmstdev-500"
                />
              </NuxtLink>
              <p class="lb-username">@{{ rank1.user.username }}</p>
              <div class="lb-stats">
                <div class="lb-stat">
                  <span class="lb-stat-value">{{ num(rank1.user.followers_count) }}</span>
                  <span class="lb-stat-label">Theo dõi</span>
                </div>
                <div class="lb-stat">
                  <span class="lb-stat-value text-cmstdev-500">
                    {{ num(rank1.user.popularity) }}
                  </span>
                  <span class="lb-stat-label">Nổi tiếng</span>
                </div>
              </div>
              <button
                v-if="!rank1.user.is_self"
                type="button"
                class="lb-follow"
                :class="rank1.user.is_following ? 'lb-follow-soft' : 'lb-follow-primary'"
                :disabled="busy[rank1.user.id]"
                @click="toggleFollow(rank1.user)"
              >
                <AppIcon
                  :name="
                    rank1.user.is_following ? 'solar:check-circle-bold' : 'solar:user-plus-linear'
                  "
                  size="16"
                />
                {{ rank1.user.is_following ? 'Đang theo dõi' : 'Theo dõi' }}
              </button>
              <span v-else class="lb-follow lb-follow-self">Bạn</span>
            </div>
          </UiGradientBorder>
        </div>

        <div class="lb-podium-row">
          <div v-for="entry in rank23" :key="entry.user.id" class="lb-card lb-card-side">
            <div class="lb-avatar-wrap">
              <NuxtLink :to="`/profile/${entry.user.id}`">
                <img
                  :src="avatarOf(entry.user)"
                  :alt="entry.user.name"
                  class="lb-avatar"
                  :class="[entry.meta.avatar, entry.meta.cls]"
                />
              </NuxtLink>
              <span class="lb-badge" :class="entry.meta.badge">{{ entry.meta.rank }}</span>
            </div>
            <NuxtLink :to="`/profile/${entry.user.id}`" class="lb-name">
              {{ entry.user.name }}
              <AppIcon
                v-if="entry.user.verified"
                name="solar:verified-check-bold"
                size="15"
                class="text-cmstdev-500"
              />
            </NuxtLink>
            <p class="lb-username">@{{ entry.user.username }}</p>
            <div class="lb-stats">
              <div class="lb-stat">
                <span class="lb-stat-value">{{ num(entry.user.followers_count) }}</span>
                <span class="lb-stat-label">Theo dõi</span>
              </div>
              <div class="lb-stat">
                <span class="lb-stat-value text-cmstdev-500">
                  {{ num(entry.user.popularity) }}
                </span>
                <span class="lb-stat-label">Nổi tiếng</span>
              </div>
            </div>
            <button
              v-if="!entry.user.is_self"
              type="button"
              class="lb-follow"
              :class="entry.user.is_following ? 'lb-follow-soft' : 'lb-follow-primary'"
              :disabled="busy[entry.user.id]"
              @click="toggleFollow(entry.user)"
            >
              <AppIcon
                :name="
                  entry.user.is_following ? 'solar:check-circle-bold' : 'solar:user-plus-linear'
                "
                size="15"
              />
              {{ entry.user.is_following ? 'Đang theo dõi' : 'Theo dõi' }}
            </button>
            <span v-else class="lb-follow lb-follow-self">Bạn</span>
          </div>
        </div>
      </section>

      <section v-if="rest.length" class="lb-list">
        <div v-for="u in rest" :key="u.id" class="lb-row">
          <span class="lb-row-rank">{{ u.rank }}</span>
          <NuxtLink :to="`/profile/${u.id}`" class="shrink-0">
            <img :src="avatarOf(u)" :alt="u.name" class="lb-row-avatar" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/profile/${u.id}`" class="lb-row-name">
              {{ u.name }}
              <AppIcon
                v-if="u.verified"
                name="solar:verified-check-bold"
                size="14"
                class="shrink-0 text-cmstdev-500"
              />
            </NuxtLink>
            <p class="lb-row-username">@{{ u.username }}</p>
          </div>
          <div class="lb-row-metric">
            <span class="lb-row-metric-value">{{ num(u.followers_count) }}</span>
            <span class="lb-row-metric-label">Theo dõi</span>
          </div>
          <div class="lb-row-metric">
            <span class="lb-row-metric-value text-cmstdev-500">{{ num(u.popularity) }}</span>
            <span class="lb-row-metric-label">Nổi tiếng</span>
          </div>
          <button
            v-if="!u.is_self"
            type="button"
            class="lb-row-follow"
            :class="u.is_following ? 'lb-follow-soft' : 'lb-follow-primary'"
            :disabled="busy[u.id]"
            @click="toggleFollow(u)"
          >
            <AppIcon
              :name="u.is_following ? 'solar:check-circle-bold' : 'solar:user-plus-linear'"
              size="14"
            />
            <span class="hidden sm:inline">{{ u.is_following ? 'Đang theo dõi' : 'Theo dõi' }}</span>
          </button>
          <span v-else class="lb-row-self">Bạn</span>
        </div>
      </section>

      <p v-if="!items.length || (searching && !rest.length)" class="lb-empty">
        {{
          searching
            ? 'Không tìm thấy thành viên phù hợp.'
            : 'Chưa có dữ liệu xếp hạng cho bộ lọc này.'
        }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.lb-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 16px 48px;
}

.lb-crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgb(var(--muted-foreground));
  margin-bottom: 14px;
}

.lb-crumb-link:hover {
  color: #0ea5e9;
}

.lb-crumb-sep {
  opacity: 0.5;
}

.lb-crumb-current {
  font-weight: 600;
  color: rgb(var(--foreground));
}

.lb-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgb(var(--border) / 0.6);
  background: rgb(var(--card));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

:global(html.dark) .lb-head {
  background: #18181b;
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

.lb-head-icon {
  display: inline-flex;
  height: 48px;
  width: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(14, 165, 233, 0.12);
  color: #0ea5e9;
}

.lb-title {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.lb-sub {
  margin-top: 2px;
  font-size: 13px;
  color: rgb(var(--muted-foreground));
}

.lb-count {
  display: none;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border-radius: 9999px;
  background: rgba(14, 165, 233, 0.1);
  font-size: 12px;
  font-weight: 700;
  color: #0ea5e9;
}

.lb-toolbar {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lb-search {
  position: relative;
  display: flex;
  align-items: center;
}

.lb-search-icon {
  position: absolute;
  left: 13px;
  color: rgb(var(--muted-foreground));
  pointer-events: none;
}

.lb-search input {
  width: 100%;
  height: 40px;
  padding: 0 14px 0 38px;
  border-radius: 9999px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--muted) / 0.5);
  font-size: 13px;
  outline: none;
  transition: border-color 0.16s ease;
}

.lb-search input:focus {
  border-color: #0ea5e9;
  background: rgb(var(--background));
}

.lb-periods {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 5px;
  border-radius: 12px;
  border: 1px solid rgb(var(--border) / 0.6);
  background: rgb(var(--muted));
}

.lb-pill {
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: rgb(var(--muted-foreground));
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.lb-pill:hover {
  color: rgb(var(--foreground));
}

.lb-pill-active {
  background: rgb(var(--background));
  color: #0ea5e9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.lb-sort {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lb-sort select {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--card));
  font-size: 12px;
  font-weight: 600;
  outline: none;
  transition: border-color 0.16s ease;
}

.lb-sort select:focus {
  border-color: #0ea5e9;
}

.lb-skeleton {
  margin-top: 24px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.lb-skeleton-card {
  border-radius: 18px;
  border: 1px solid rgb(var(--border) / 0.6);
  background: rgb(var(--card));
  padding: 24px;
  text-align: center;
}

.lb-skeleton-avatar {
  height: 88px;
  width: 88px;
  margin: 0 auto;
  border-radius: 9999px;
  background: rgb(var(--muted));
  animation: pulse 1.6s ease-in-out infinite;
}

.lb-skeleton-line {
  height: 14px;
  width: 66%;
  margin: 16px auto 0;
  border-radius: 6px;
  background: rgb(var(--muted));
  animation: pulse 1.6s ease-in-out infinite;
}

.lb-skeleton-line-sm {
  height: 11px;
  width: 44%;
  margin-top: 8px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.lb-podium-wrap {
  margin-top: 24px;
}

.lb-podium-top {
  max-width: 340px;
  margin: 0 auto;
}

.lb-podium-row {
  margin-top: 16px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lb-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 18px;
  background: rgb(var(--card));
  padding: 26px 18px 20px;
  border: 1px solid rgb(var(--border) / 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}

.lb-card-1 {
  border: none;
  border-radius: 21px;
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.09), rgb(var(--card)) 42%);
  box-shadow: none;
  padding-top: 32px;
}

.lb-card-side:hover {
  transform: translateY(-3px);
  border-color: rgba(14, 165, 233, 0.4);
}

:global(html.dark) .lb-card {
  background: #18181b;
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

:global(html.dark) .lb-card-1 {
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.13), #18181b 42%);
  box-shadow: none;
}

.lb-crown {
  color: #f59e0b;
  margin-bottom: 2px;
}

.lb-avatar-wrap {
  position: relative;
}

.lb-avatar {
  height: 86px;
  width: 86px;
  border-radius: 9999px;
  background: rgb(var(--muted));
  transition: transform 0.18s ease;
}

.lb-avatar:hover {
  transform: scale(1.05);
}

.lb-avatar-1 {
  height: 116px;
  width: 116px;
}

.lb-avatar-2,
.lb-avatar-3 {
  height: 82px;
  width: 82px;
}

.lb-gold {
  box-shadow:
    0 0 0 4px rgb(var(--card)),
    0 0 0 8px #fbbf24;
}

.lb-silver {
  box-shadow:
    0 0 0 4px rgb(var(--card)),
    0 0 0 7px #cbd5e1;
}

.lb-bronze {
  box-shadow:
    0 0 0 4px rgb(var(--card)),
    0 0 0 7px #f97316;
}

.lb-badge {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  height: 28px;
  width: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.lb-badge-1 {
  height: 32px;
  width: 32px;
  font-size: 15px;
  background: linear-gradient(135deg, #fcd34d, #f59e0b);
}

.lb-badge-2 {
  background: linear-gradient(135deg, #e2e8f0, #94a3b8);
}

.lb-badge-3 {
  background: linear-gradient(135deg, #fdba74, #ea580c);
}

.lb-name {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  transition: color 0.16s ease;
}

.lb-name-1 {
  font-size: 17px;
}

.lb-name:hover {
  color: #0ea5e9;
}

.lb-username {
  margin-top: 2px;
  font-size: 12px;
  color: rgb(var(--muted-foreground));
}

.lb-stats {
  margin-top: 14px;
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.lb-stat {
  border-radius: 12px;
  background: rgb(var(--muted) / 0.7);
  padding: 8px 4px;
}

.lb-stat-value {
  display: block;
  font-size: 14px;
  font-weight: 700;
}

.lb-stat-label {
  display: block;
  margin-top: 1px;
  font-size: 11px;
  color: rgb(var(--muted-foreground));
}

.lb-follow {
  margin-top: 14px;
  display: inline-flex;
  width: 100%;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  transition:
    background-color 0.16s ease,
    opacity 0.16s ease,
    border-color 0.16s ease;
}

.lb-follow:disabled {
  opacity: 0.5;
}

.lb-follow-primary {
  background: #0ea5e9;
  color: #ffffff;
}

.lb-follow-primary:hover {
  opacity: 0.9;
}

.lb-follow-soft {
  background: rgb(var(--muted));
  border: 1px solid rgb(var(--border) / 0.7);
  color: rgb(var(--foreground));
}

.lb-follow-soft:hover {
  border-color: rgba(14, 165, 233, 0.4);
}

.lb-follow-self {
  border: 1px solid rgb(var(--border));
  color: rgb(var(--muted-foreground));
}

.lb-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgb(var(--border) / 0.6);
  background: rgb(var(--card));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.lb-row:hover {
  transform: translateY(-2px);
  border-color: rgba(14, 165, 233, 0.45);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.09);
}

:global(html.dark) .lb-row {
  background: #18181b;
  border-color: rgba(255, 255, 255, 0.06);
}

.lb-row-rank {
  width: 26px;
  flex-shrink: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--muted-foreground));
}

.lb-row-avatar {
  height: 44px;
  width: 44px;
  border-radius: 9999px;
  background: rgb(var(--muted));
  box-shadow: 0 0 0 2px rgb(var(--border));
  transition: box-shadow 0.16s ease;
}

.lb-row-avatar:hover {
  box-shadow: 0 0 0 2px #0ea5e9;
}

.lb-row-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.16s ease;
}

.lb-row-name:hover {
  color: #0ea5e9;
}

.lb-row-username {
  font-size: 12px;
  color: rgb(var(--muted-foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-row-metric {
  display: none;
  flex-shrink: 0;
  text-align: right;
  min-width: 68px;
}

.lb-row-metric-value {
  display: block;
  font-size: 14px;
  font-weight: 700;
}

.lb-row-metric-label {
  display: block;
  font-size: 11px;
  color: rgb(var(--muted-foreground));
}

.lb-row-follow {
  display: inline-flex;
  flex-shrink: 0;
  height: 32px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  transition:
    background-color 0.16s ease,
    opacity 0.16s ease,
    border-color 0.16s ease;
}

.lb-row-follow:disabled {
  opacity: 0.5;
}

.lb-row-self {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: rgb(var(--muted-foreground));
}

.lb-empty {
  padding: 72px 16px;
  text-align: center;
  font-size: 14px;
  color: rgb(var(--muted-foreground));
}

@media (min-width: 640px) {
  .lb-count {
    display: inline-flex;
  }

  .lb-toolbar {
    flex-direction: row;
    align-items: center;
  }

  .lb-search {
    flex: 1;
    max-width: 320px;
  }

  .lb-sort select {
    flex: none;
    min-width: 190px;
  }

  .lb-row-metric {
    display: block;
  }

  .lb-row {
    gap: 14px;
    padding: 13px 18px;
  }
}

@media (min-width: 768px) {
  .lb-title {
    font-size: 24px;
  }

  .lb-sub {
    font-size: 14px;
  }

  .lb-skeleton {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .lb-podium-top {
    max-width: 360px;
  }

  .lb-podium-row {
    max-width: 720px;
    margin: -14px auto 0;
    gap: 24px;
  }
}
</style>
