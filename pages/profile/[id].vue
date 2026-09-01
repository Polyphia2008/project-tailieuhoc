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
  throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy thành viên', fatal: true })
}

const user = ref<any>(data.value.data.user)
const followers = ref<any[]>(data.value.data.followers || [])
const following = ref<any[]>(data.value.data.following || [])
const posts = ref<any[]>(data.value.data.posts || [])

useHead({ title: `${user.value?.name || 'Thành viên'} — MapDocs` })

const TABS = [
  { key: 'intro', label: 'Giới thiệu', icon: 'solar:user-id-bold' },
  { key: 'followers', label: 'Người theo dõi', icon: 'solar:users-group-rounded-bold-duotone' },
  { key: 'following', label: 'Đang theo dõi', icon: 'solar:heart-bold' },
  { key: 'posts', label: 'Bài viết', icon: 'solar:document-text-bold' }
]

const tab = ref('intro')
const busy = ref(false)
const menuOpen = ref(false)

const isSelf = computed(() => Boolean(auth.user && auth.user.id === user.value?.id))

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
</script>

<template>
  <div class="pb-14">
    <div
      class="h-40 w-full bg-gradient-to-br from-cmstdev-400 via-cmstdev-500 to-cmstdev-700 sm:h-56"
    />

    <div class="mx-auto w-full max-w-5xl px-4">
      <section class="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
        <div class="relative shrink-0">
          <img
            :src="avatarOf(user)"
            :alt="user.name"
            class="h-28 w-28 rounded-full bg-card ring-4 ring-background sm:h-32 sm:w-32"
          />
          <span
            v-if="user.online"
            class="absolute bottom-2 right-2 h-4 w-4 rounded-full border-[3px] border-background bg-emerald-500"
          />
        </div>

        <div class="min-w-0 flex-1 pb-1">
          <h1 class="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            {{ user.name }}
            <AppIcon
              v-if="user.verified"
              name="solar:verified-check-bold"
              size="20"
              class="text-cmstdev-500"
            />
          </h1>
          <p class="text-sm text-muted-foreground">@{{ user.username }}</p>
          <p class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span>
              <strong>{{ num(user.followers_count) }}</strong>
              <span class="text-muted-foreground"> người theo dõi</span>
            </span>
            <span class="text-muted-foreground">·</span>
            <span>
              <strong>{{ num(user.following_count) }}</strong>
              <span class="text-muted-foreground"> đang theo dõi</span>
            </span>
            <span class="text-muted-foreground">·</span>
            <span class="inline-flex items-center gap-1 font-semibold text-cmstdev-500">
              <AppIcon name="solar:medal-star-bold" size="15" />
              {{ num(user.popularity) }} độ nổi tiếng
            </span>
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ user.online ? 'Đang hoạt động' : `Hoạt động ${ago(user.last_active)}` }}
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-2 pb-1">
          <button
            v-if="!isSelf"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
            :class="
              user.is_following
                ? 'border border-border hover:bg-muted'
                : 'bg-cmstdev-500 text-white hover:opacity-90'
            "
            :disabled="busy"
            @click="toggleFollow"
          >
            <AppIcon
              :name="user.is_following ? 'solar:check-circle-bold' : 'solar:user-plus-linear'"
              size="16"
            />
            {{ user.is_following ? 'Đang theo dõi' : 'Theo dõi' }}
          </button>
          <NuxtLink
            v-else
            to="/dashboard/ho-so"
            class="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            <AppIcon name="solar:pen-new-square-bold-duotone" size="16" />
            Chỉnh sửa
          </NuxtLink>

          <button
            v-if="!isSelf"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            @click="message"
          >
            <AppIcon name="solar:chat-round-line-linear" size="16" />
            Nhắn tin
          </button>

          <div class="relative">
            <button
              type="button"
              class="rounded-xl border border-border p-2 transition hover:bg-muted"
              aria-label="Tùy chọn khác"
              @click="menuOpen = !menuOpen"
            >
              <AppIcon name="solar:alt-arrow-down-linear" size="16" />
            </button>
            <div
              v-if="menuOpen"
              class="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-muted"
                @click="copyLink"
              >
                <AppIcon name="solar:copy-bold-duotone" size="16" />
                Copy liên kết
              </button>
              <NuxtLink
                to="/community"
                class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-muted"
              >
                <AppIcon name="solar:users-group-rounded-bold-duotone" size="16" />
                Về cộng đồng
              </NuxtLink>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-muted"
                @click="report"
              >
                <AppIcon name="solar:flag-bold-duotone" size="16" />
                Báo cáo hồ sơ
              </button>
            </div>
          </div>
        </div>
      </section>

      <nav class="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5">
        <button
          v-for="t in TABS"
          :key="t.key"
          type="button"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition"
          :class="
            tab === t.key ? 'bg-cmstdev-500 text-white' : 'text-muted-foreground hover:bg-muted'
          "
          @click="tab = t.key"
        >
          <AppIcon :name="t.icon" size="16" />
          {{ t.label }}
        </button>
      </nav>

      <div v-if="tab === 'intro'" class="mt-5 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div class="space-y-4">
          <div class="rounded-2xl border border-border bg-card p-5">
            <h2 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Giới thiệu
            </h2>
            <p class="text-sm leading-relaxed">
              {{ user.bio || 'Người dùng chưa thêm giới thiệu.' }}
            </p>
          </div>

          <div class="rounded-2xl border border-border bg-card p-5">
            <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Thông tin công khai
            </h2>
            <ul class="space-y-2.5 text-sm">
              <li v-if="user.work" class="flex items-start gap-2.5">
                <AppIcon
                  name="solar:buildings-2-bold-duotone"
                  size="17"
                  class="mt-0.5 shrink-0 text-cmstdev-500"
                />
                <span>{{ user.work }}</span>
              </li>
              <li v-if="user.school" class="flex items-start gap-2.5">
                <AppIcon
                  name="solar:diploma-bold-duotone"
                  size="17"
                  class="mt-0.5 shrink-0 text-cmstdev-500"
                />
                <span>{{ user.school }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <AppIcon
                  name="solar:user-circle-bold-duotone"
                  size="17"
                  class="mt-0.5 shrink-0 text-cmstdev-500"
                />
                <span class="capitalize">Vai trò: {{ user.role }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <AppIcon
                  name="solar:clock-circle-bold-duotone"
                  size="17"
                  class="mt-0.5 shrink-0 text-cmstdev-500"
                />
                <span>Tham gia {{ ago(user.created_at) }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-border bg-card p-5">
            <AppIcon name="solar:document-text-bold" size="22" class="text-cmstdev-500" />
            <p class="mt-2 text-2xl font-bold">{{ num(user.docs_count) }}</p>
            <p class="text-xs text-muted-foreground">Tài liệu đã đăng</p>
          </div>
          <div class="rounded-2xl border border-border bg-card p-5">
            <AppIcon name="solar:cart-large-4-bold-duotone" size="22" class="text-cmstdev-500" />
            <p class="mt-2 text-2xl font-bold">{{ num(user.docs_sold) }}</p>
            <p class="text-xs text-muted-foreground">Lượt bán</p>
          </div>
          <div v-if="user.rating" class="rounded-2xl border border-border bg-card p-5">
            <AppIcon name="solar:star-bold" size="22" class="text-amber-400" />
            <p class="mt-2 text-2xl font-bold">{{ user.rating }}</p>
            <p class="text-xs text-muted-foreground">Đánh giá trung bình</p>
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'followers' || tab === 'following'" class="mt-5">
        <div
          v-if="(tab === 'followers' ? followers : following).length"
          class="grid gap-3 sm:grid-cols-2"
        >
          <NuxtLink
            v-for="u in tab === 'followers' ? followers : following"
            :key="u.id"
            :to="`/profile/${u.id}`"
            class="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:-translate-y-0.5 hover:border-cmstdev-500/40"
          >
            <img :src="avatarOf(u)" :alt="u.name" class="h-12 w-12 shrink-0 rounded-full bg-muted" />
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-1.5 truncate text-sm font-semibold">
                {{ u.name }}
                <AppIcon
                  v-if="u.verified"
                  name="solar:verified-check-bold"
                  size="14"
                  class="shrink-0 text-cmstdev-500"
                />
              </p>
              <p class="truncate text-xs text-muted-foreground">@{{ u.username }}</p>
            </div>
            <span class="shrink-0 text-right">
              <span class="block text-sm font-bold">{{ num(u.followers_count) }}</span>
              <span class="block text-[11px] text-muted-foreground">theo dõi</span>
            </span>
          </NuxtLink>
        </div>
        <p v-else class="py-16 text-center text-sm text-muted-foreground">
          {{ tab === 'followers' ? 'Chưa có người theo dõi.' : 'Chưa theo dõi ai.' }}
        </p>
      </div>

      <div v-else class="mt-5">
        <div v-if="posts.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="p in posts"
            :key="p.id"
            :to="`/tai-lieu/${p.slug}`"
            class="flex flex-col rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-cmstdev-500/40"
          >
            <span
              class="mb-3 flex h-24 items-center justify-center rounded-xl bg-cmstdev-500/8 text-cmstdev-500"
            >
              <AppIcon name="solar:document-text-bold" size="34" />
            </span>
            <p class="line-clamp-2 flex-1 text-sm font-semibold">{{ p.title }}</p>
            <div class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
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
        <p v-else class="py-16 text-center text-sm text-muted-foreground">
          Thành viên chưa đăng tài liệu nào.
        </p>
      </div>
    </div>
  </div>
</template>
