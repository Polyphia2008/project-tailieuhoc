<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'default' })

const route = useRoute()
const auth = useAuthStore()
const api = useApi()
const { num, ago, price } = useFormat()

const id = computed(() => String(route.params.id || ''))

const { data, error } = await useFetch<any>(() => `/api/community/users/${id.value}`, {
  default: () => ({ data: null as any })
})

if (error.value || !data.value?.data) {
  throw createError({ statusCode: 404, message: 'Không tìm thấy thành viên', fatal: true })
}

const user = ref<any>(data.value.data.user)
const followers = ref<any[]>(data.value.data.followers || [])
const following = ref<any[]>(data.value.data.following || [])
const posts = ref<any[]>(data.value.data.posts || [])

useHead({ title: `${user.value?.name || 'Thành viên'} — MapDocs` })

const TABS = [
  { key: 'intro', label: 'Giới thiệu', icon: 'solar:user-id-bold' },
  { key: 'friends', label: 'Bạn bè', icon: 'solar:users-group-two-rounded-bold-duotone' },
  { key: 'followers', label: 'Người theo dõi', icon: 'solar:users-group-rounded-bold-duotone' },
  { key: 'following', label: 'Đang theo dõi', icon: 'solar:heart-bold' },
  { key: 'posts', label: 'Bài viết', icon: 'solar:document-text-bold' }
]

const POST_FILTERS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'views', label: 'Lượt xem cao' },
  { key: 'sold', label: 'Bán nhiều nhất' },
  { key: 'rating', label: 'Đánh giá cao' }
]

const tab = ref('intro')
const busy = ref(false)
const menuOpen = ref(false)
const postFilter = ref('newest')
const filterOpen = ref(false)

const isSelf = computed(() => Boolean(auth.user && auth.user.id === user.value?.id))

const friends = computed(() => {
  const set = new Set(following.value.map((u: any) => u.id))
  return followers.value.filter((u: any) => set.has(u.id))
})

const sortedPosts = computed(() => {
  const list = [...posts.value]
  if (postFilter.value === 'views') return list.sort((a, b) => (b.views || 0) - (a.views || 0))
  if (postFilter.value === 'sold') return list.sort((a, b) => (b.sold || 0) - (a.sold || 0))
  if (postFilter.value === 'rating') return list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  return list.sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )
})

const activeFilterLabel = computed(
  () => POST_FILTERS.find((f) => f.key === postFilter.value)?.label || 'Mới nhất'
)

const tabList = computed(() => {
  if (tab.value === 'friends') return friends.value
  if (tab.value === 'followers') return followers.value
  return following.value
})

const emptyListText = computed(() => {
  if (tab.value === 'friends') return 'Chưa có bạn bè nào.'
  if (tab.value === 'followers') return 'Chưa có người theo dõi.'
  return 'Chưa theo dõi ai.'
})

function avatarOf(u: any): string {
  return (
    u?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u?.username || 'mapdocs')}`
  )
}

async function toggleFollow() {
  if (!auth.loggedIn) {
    toast.error('Bạn cần đăng nhập để theo dõi thành viên')
    return
  }
  if (isSelf.value) return
  busy.value = true
  try {
    const res = user.value.is_following
      ? await api.del<any>(`/api/community/users/${user.value.id}/follow`)
      : await api.post<any>(`/api/community/users/${user.value.id}/follow`)
    if (res?.data) {
      user.value.is_following = res.data.following
      user.value.followers_count = res.data.followers_count
    }
    toast.success(
      user.value.is_following ? `Đã theo dõi ${user.value.name}` : `Đã bỏ theo dõi ${user.value.name}`
    )
  } catch (e: any) {
    toast.error(api.errMessage(e))
  } finally {
    busy.value = false
  }
}

async function message() {
  if (!auth.loggedIn) {
    toast.error('Bạn cần đăng nhập để nhắn tin')
    return
  }
  try {
    await api.post('/api/community/conversations', { member_ids: [user.value.id] })
    await navigateTo('/community')
  } catch (e: any) {
    toast.error(api.errMessage(e))
  }
}

function copyLink() {
  menuOpen.value = false
  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã copy liên kết hồ sơ')
  }
}

function report() {
  menuOpen.value = false
  toast.info('Đã ghi nhận, chúng tôi sẽ xem xét hồ sơ này')
}

function pickFilter(key: string) {
  postFilter.value = key
  filterOpen.value = false
}
</script>

<template>
  <div class="profile-shell">
    <section class="profile-cover">
      <span class="cover-grid" />
      <span class="cover-blob cover-blob-a" />
      <span class="cover-blob cover-blob-b" />
    </section>

    <section class="profile-identity">
      <div class="identity-avatar">
        <img :src="avatarOf(user)" :alt="user.name" class="avatar-img" />
        <span v-if="user.online" class="avatar-dot" />
      </div>

      <div class="identity-main">
        <h1 class="identity-name">
          {{ user.name }}
          <AppIcon
            v-if="user.verified"
            name="solar:verified-check-bold"
            size="20"
            class="shrink-0 text-cmstdev-500"
          />
        </h1>
        <p class="identity-username">@{{ user.username }}</p>
        <p class="identity-stats">
          <span>
            <strong>{{ num(user.followers_count) }}</strong>
            <span class="text-muted-foreground"> người theo dõi</span>
          </span>
          <span class="stats-dot">·</span>
          <span>
            <strong>{{ num(user.following_count) }}</strong>
            <span class="text-muted-foreground"> đang theo dõi</span>
          </span>
          <span class="stats-dot">·</span>
          <span class="inline-flex items-center gap-1 font-semibold text-cmstdev-500">
            <AppIcon name="solar:medal-star-bold" size="15" />
            {{ num(user.popularity) }} độ nổi tiếng
          </span>
        </p>
        <p class="identity-active">
          {{ user.online ? 'Đang hoạt động' : `Hoạt động ${ago(user.last_active)}` }}
        </p>
      </div>

      <div class="identity-actions">
        <button
          v-if="!isSelf"
          type="button"
          class="pf-btn"
          :class="user.is_following ? 'pf-btn-soft' : 'pf-btn-primary'"
          :disabled="busy"
          @click="toggleFollow"
        >
          <AppIcon
            :name="user.is_following ? 'solar:check-circle-bold' : 'solar:user-plus-linear'"
            size="16"
          />
          {{ user.is_following ? 'Bạn bè' : 'Theo dõi' }}
        </button>
        <NuxtLink v-else to="/dashboard/ho-so" class="pf-btn pf-btn-soft">
          <AppIcon name="solar:pen-new-square-bold-duotone" size="16" />
          Chỉnh sửa
        </NuxtLink>

        <button v-if="!isSelf" type="button" class="pf-btn pf-btn-soft" @click="message">
          <AppIcon name="solar:chat-round-line-linear" size="16" />
          Nhắn tin
        </button>

        <div class="relative">
          <button
            type="button"
            class="pf-btn pf-btn-soft pf-btn-icon"
            aria-label="Tùy chọn khác"
            @click="menuOpen = !menuOpen"
          >
            <AppIcon name="solar:alt-arrow-down-linear" size="16" />
          </button>
          <div v-if="menuOpen" class="pf-menu">
            <button type="button" class="pf-menu-item" @click="copyLink">
              <AppIcon name="solar:copy-bold-duotone" size="16" />
              Copy liên kết
            </button>
            <NuxtLink to="/community" class="pf-menu-item">
              <AppIcon name="solar:users-group-rounded-bold-duotone" size="16" />
              Về cộng đồng
            </NuxtLink>
            <button type="button" class="pf-menu-item pf-menu-danger" @click="report">
              <AppIcon name="solar:flag-bold-duotone" size="16" />
              Báo cáo hồ sơ
            </button>
          </div>
        </div>
      </div>
    </section>

    <nav class="pf-tabs" role="tablist">
      <button
        v-for="t in TABS"
        :key="t.key"
        type="button"
        role="tab"
        :aria-selected="tab === t.key"
        class="pf-tab"
        :class="tab === t.key ? 'pf-tab-active' : ''"
        @click="tab = t.key"
      >
        <AppIcon :name="t.icon" size="16" />
        {{ t.label }}
      </button>
    </nav>

    <div v-if="tab === 'intro'" class="mt-5 grid gap-5 md:grid-cols-5">
      <div class="space-y-5 md:col-span-2">
        <article class="profile-card">
          <h2 class="pf-card-title">Giới thiệu</h2>
          <p class="text-sm leading-relaxed">
            {{ user.bio || 'Người dùng chưa thêm giới thiệu.' }}
          </p>
        </article>

        <article class="profile-card">
          <h2 class="pf-card-title">Thông tin cá nhân</h2>
          <ul class="space-y-3 text-sm">
            <li v-if="user.work" class="pf-info-row">
              <AppIcon name="solar:buildings-2-bold-duotone" size="17" class="pf-info-icon" />
              <span>{{ user.work }}</span>
            </li>
            <li v-if="user.school" class="pf-info-row">
              <AppIcon name="solar:diploma-bold-duotone" size="17" class="pf-info-icon" />
              <span>{{ user.school }}</span>
            </li>
            <li class="pf-info-row">
              <AppIcon name="solar:user-circle-bold-duotone" size="17" class="pf-info-icon" />
              <span class="capitalize">Vai trò: {{ user.role }}</span>
            </li>
            <li class="pf-info-row">
              <AppIcon name="solar:clock-circle-bold-duotone" size="17" class="pf-info-icon" />
              <span>Tham gia {{ ago(user.created_at) }}</span>
            </li>
          </ul>

          <div class="pf-metrics">
            <div class="pf-metric">
              <span class="pf-metric-value">{{ num(user.docs_count) }}</span>
              <span class="pf-metric-label">Tài liệu đã đăng</span>
            </div>
            <div class="pf-metric">
              <span class="pf-metric-value">{{ num(user.docs_sold) }}</span>
              <span class="pf-metric-label">Số lượt bán</span>
            </div>
            <div class="pf-metric">
              <span class="pf-metric-value">{{ user.rating || '—' }}</span>
              <span class="pf-metric-label">Đánh giá</span>
            </div>
          </div>
        </article>
      </div>

      <div class="md:col-span-3">
        <article class="profile-card">
          <header class="pf-posts-head">
            <h2 class="text-base font-bold">Bài viết</h2>
            <div class="relative">
              <button type="button" class="pf-btn pf-btn-soft" @click="filterOpen = !filterOpen">
                {{ activeFilterLabel }}
                <AppIcon name="solar:alt-arrow-down-linear" size="14" />
              </button>
              <div v-if="filterOpen" class="pf-menu">
                <button
                  v-for="f in POST_FILTERS"
                  :key="f.key"
                  type="button"
                  class="pf-menu-item"
                  @click="pickFilter(f.key)"
                >
                  <AppIcon
                    :name="
                      postFilter === f.key ? 'solar:check-circle-bold' : 'solar:sort-vertical-linear'
                    "
                    size="15"
                  />
                  {{ f.label }}
                </button>
              </div>
            </div>
          </header>

          <div v-if="sortedPosts.length" class="pf-post-list">
            <NuxtLink
              v-for="p in sortedPosts"
              :key="p.id"
              :to="`/tai-lieu/${p.slug}`"
              class="pf-post-row"
            >
              <span class="pf-post-thumb">
                <AppIcon name="solar:document-text-bold" size="22" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="pf-post-title">{{ p.title }}</span>
                <span class="pf-post-meta">
                  <span class="inline-flex items-center gap-1">
                    <AppIcon name="solar:eye-bold-duotone" size="13" />
                    {{ num(p.views) }} lượt xem
                  </span>
                  <span v-if="p.rating" class="inline-flex items-center gap-1 text-amber-500">
                    <AppIcon name="solar:star-bold" size="12" />
                    {{ p.rating }}
                  </span>
                </span>
              </span>
              <span class="pf-post-price">{{ price(p.price) }}</span>
            </NuxtLink>
          </div>
          <div v-else class="pf-empty">
            <AppIcon name="solar:document-text-bold" size="30" class="text-muted-foreground/50" />
            <p>Thành viên chưa đăng tài liệu nào.</p>
          </div>
        </article>
      </div>
    </div>

    <div v-else-if="tab === 'posts'" class="mt-5">
      <div v-if="sortedPosts.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="p in sortedPosts"
          :key="p.id"
          :to="`/tai-lieu/${p.slug}`"
          class="profile-card pf-doc-card"
        >
          <span class="pf-doc-thumb">
            <AppIcon name="solar:document-text-bold" size="34" />
          </span>
          <p class="line-clamp-2 flex-1 text-sm font-semibold">{{ p.title }}</p>
          <div class="pf-doc-foot">
            <span class="inline-flex items-center gap-1">
              <AppIcon name="solar:eye-bold-duotone" size="14" />
              {{ num(p.views) }}
            </span>
            <span v-if="p.rating" class="inline-flex items-center gap-1 text-amber-500">
              <AppIcon name="solar:star-bold" size="13" />
              {{ p.rating }}
            </span>
            <span class="font-bold text-cmstdev-500">{{ price(p.price) }}</span>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="pf-empty">
        <AppIcon name="solar:document-text-bold" size="30" class="text-muted-foreground/50" />
        <p>Thành viên chưa đăng tài liệu nào.</p>
      </div>
    </div>

    <div v-else class="mt-5">
      <div v-if="tabList.length" class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="u in tabList"
          :key="u.id"
          :to="`/profile/${u.id}`"
          class="profile-card pf-people-row"
        >
          <img :src="avatarOf(u)" :alt="u.name" class="pf-people-avatar" />
          <span class="min-w-0 flex-1">
            <span class="pf-people-name">
              {{ u.name }}
              <AppIcon
                v-if="u.verified"
                name="solar:verified-check-bold"
                size="14"
                class="shrink-0 text-cmstdev-500"
              />
            </span>
            <span class="pf-people-username">@{{ u.username }}</span>
          </span>
          <span class="shrink-0 text-right">
            <span class="block text-sm font-bold">{{ num(u.followers_count) }}</span>
            <span class="block text-[11px] text-muted-foreground">theo dõi</span>
          </span>
        </NuxtLink>
      </div>
      <div v-else class="pf-empty">
        <AppIcon
          name="solar:users-group-rounded-bold-duotone"
          size="30"
          class="text-muted-foreground/50"
        />
        <p>{{ emptyListText }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 16px 32px;
}

.profile-cover {
  position: relative;
  height: 176px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #0ea5e9, #22d3ee);
}

.cover-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.09) 1px, transparent 1px);
  background-size: 42px 42px;
  pointer-events: none;
}

.cover-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(46px);
  pointer-events: none;
}

.cover-blob-a {
  width: 320px;
  height: 320px;
  top: -130px;
  left: 6%;
  background: rgba(255, 255, 255, 0.34);
  animation: pf-drift 18s ease-in-out infinite;
}

.cover-blob-b {
  width: 260px;
  height: 260px;
  bottom: -140px;
  right: 8%;
  background: rgba(56, 189, 248, 0.55);
  animation: pf-drift 22s ease-in-out infinite reverse;
}

@keyframes pf-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(38px, 22px, 0) scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cover-blob {
    animation: none;
  }
}

.profile-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  margin-top: -52px;
}

.identity-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  height: 104px;
  width: 104px;
  border-radius: 9999px;
  background: rgb(var(--card));
  border: 4px solid rgb(var(--background));
  box-shadow:
    0 0 0 2px rgba(14, 165, 233, 0.55),
    0 10px 25px rgba(0, 0, 0, 0.16);
  object-fit: cover;
}

.avatar-dot {
  position: absolute;
  bottom: 8px;
  right: 8px;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  border: 3px solid rgb(var(--background));
  background: #10b981;
}

.identity-main {
  min-width: 0;
  flex: 1;
}

.identity-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 700;
}

.identity-username {
  margin-top: 2px;
  font-size: 14px;
  color: rgb(var(--muted-foreground));
}

.identity-stats {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 12px;
  font-size: 14px;
}

.stats-dot {
  color: rgb(var(--muted-foreground));
}

.identity-active {
  margin-top: 4px;
  font-size: 12px;
  color: rgb(var(--muted-foreground));
}

.identity-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.pf-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition:
    background-color 0.16s ease,
    opacity 0.16s ease,
    border-color 0.16s ease;
}

.pf-btn:disabled {
  opacity: 0.5;
}

.pf-btn-soft {
  background: rgb(var(--muted));
  border: 1px solid rgb(var(--border) / 0.7);
  color: rgb(var(--foreground));
}

.pf-btn-soft:hover {
  background: rgb(var(--muted) / 0.8);
  border-color: rgba(14, 165, 233, 0.4);
}

.pf-btn-primary {
  background: #0ea5e9;
  color: #ffffff;
}

.pf-btn-primary:hover {
  opacity: 0.9;
}

.pf-btn-icon {
  padding: 0 8px;
}

.pf-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 30;
  width: 190px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--popover));
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
  text-align: left;
}

.pf-menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  transition: background-color 0.14s ease;
}

.pf-menu-item:hover {
  background: rgb(var(--muted));
}

.pf-menu-danger {
  color: #ef4444;
}

.pf-tabs {
  margin-top: 20px;
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
  background: rgb(var(--muted));
  border: 1px solid rgb(var(--border) / 0.6);
  overflow-x: auto;
  scrollbar-width: none;
}

.pf-tabs::-webkit-scrollbar {
  display: none;
}

.pf-tab {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--muted-foreground));
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.pf-tab:hover {
  color: rgb(var(--foreground));
}

.pf-tab-active {
  background: rgb(var(--background));
  color: rgb(var(--foreground));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.profile-card {
  border: 1px solid rgb(var(--border) / 0.6);
  background: rgb(var(--card));
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

html.dark .profile-card {
  background: #18181b;
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

.pf-card-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(var(--muted-foreground));
}

.pf-info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.pf-info-icon {
  margin-top: 2px;
  flex-shrink: 0;
  color: #0ea5e9;
}

.pf-metrics {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgb(var(--border) / 0.6);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  text-align: center;
}

.pf-metric-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
}

.pf-metric-label {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: rgb(var(--muted-foreground));
}

.pf-posts-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.pf-post-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pf-post-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.pf-post-row:hover {
  background: rgb(var(--muted) / 0.6);
  border-color: rgba(14, 165, 233, 0.35);
  transform: translateY(-1px);
}

.pf-post-thumb {
  display: inline-flex;
  height: 44px;
  width: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
}

.pf-post-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pf-post-meta {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: rgb(var(--muted-foreground));
}

.pf-post-price {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: #0ea5e9;
}

.pf-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 56px 16px;
  font-size: 14px;
  color: rgb(var(--muted-foreground));
}

.pf-doc-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease;
}

.pf-doc-card:hover {
  transform: translateY(-2px);
  border-color: rgba(14, 165, 233, 0.4);
}

.pf-doc-thumb {
  margin-bottom: 12px;
  display: flex;
  height: 96px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(14, 165, 233, 0.08);
  color: #0ea5e9;
}

.pf-doc-foot {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgb(var(--muted-foreground));
}

.pf-people-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease;
}

.pf-people-row:hover {
  transform: translateY(-2px);
  border-color: rgba(14, 165, 233, 0.4);
}

.pf-people-avatar {
  height: 48px;
  width: 48px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgb(var(--muted));
}

.pf-people-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}

.pf-people-username {
  display: block;
  font-size: 12px;
  color: rgb(var(--muted-foreground));
}

@media (min-width: 768px) {
  .profile-cover {
    height: 240px;
    border-radius: 16px;
  }

  .profile-identity {
    flex-direction: row;
    align-items: flex-end;
    text-align: left;
    gap: 20px;
    margin-top: -72px;
    padding: 0 8px;
  }

  .avatar-img {
    height: 144px;
    width: 144px;
  }

  .avatar-dot {
    bottom: 12px;
    right: 12px;
    height: 20px;
    width: 20px;
  }

  .identity-main {
    padding-bottom: 6px;
  }

  .identity-name {
    justify-content: flex-start;
    font-size: 24px;
  }

  .identity-stats {
    justify-content: flex-start;
  }

  .identity-actions {
    justify-content: flex-end;
    padding-bottom: 10px;
  }
}
</style>
