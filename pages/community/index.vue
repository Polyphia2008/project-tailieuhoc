<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'default' })
useHead({ title: 'Cộng đồng MapDocs' })

const auth = useAuthStore()
const api = useApi()


const conversations = ref<any[]>([])
const messages = ref<any[]>([])
const activeId = ref('')
const activeConv = ref<any>(null)
const loadingList = ref(true)
const loadingMessages = ref(false)
const sending = ref(false)
const draft = ref('')
const search = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)
const allowPrivate = ref(true)
const drawerOpen = ref(false)
const creatingGroup = ref(false)
const listEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)

let poller: any = null
let searchTimer: any = null

const publicConversations = computed(() => conversations.value.filter((c) => c.kind === 'public'))
const privateConversations = computed(() =>
  allowPrivate.value ? conversations.value.filter((c) => c.kind !== 'public') : []
)
const canSend = computed(() => draft.value.trim().length > 0 && !sending.value)
const loggedIn = computed(() => auth.loggedIn)

function avatarOf(item: any): string {
  if (item?.avatar) return item.avatar
  const seed = item?.username || item?.title || item?.id || 'mapdocs'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

function timeOf(v: any): string {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function nearBottom(): boolean {
  const el = listEl.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 140
}

function scrollToBottom(force = false) {
  nextTick(() => {
    const el = listEl.value
    if (!el) return
    if (force || nearBottom()) el.scrollTop = el.scrollHeight
  })
}

async function loadConversations() {
  loadingList.value = true
  try {
    const res = await api.get<any>('/api/community/conversations')
    conversations.value = res?.data?.items || []
    if (!activeId.value && conversations.value.length) {
      await selectConversation(conversations.value[0].id)
    }
  } catch {
    conversations.value = []
  } finally {
    loadingList.value = false
  }
}

async function loadMessages(silent = false) {
  if (!activeId.value) return
  if (!silent) loadingMessages.value = true
  const wasNear = nearBottom()
  try {
    const res = await api.get<any>(`/api/community/conversations/${activeId.value}/messages`, {
      limit: 60
    })
    messages.value = res?.data?.items || []
    scrollToBottom(!silent || wasNear)
  } catch {
    if (!silent) messages.value = []
  } finally {
    if (!silent) loadingMessages.value = false
  }
}

function stopPolling() {
  if (poller) {
    clearInterval(poller)
    poller = null
  }
}

function startPolling() {
  stopPolling()
  poller = setInterval(() => {
    if (!document.hidden) loadMessages(true)
  }, 5000)
}

async function selectConversation(id: string) {
  if (!id) return
  stopPolling()
  activeId.value = id
  activeConv.value = conversations.value.find((c) => c.id === id) || null
  messages.value = []
  drawerOpen.value = false
  await loadMessages()
  startPolling()
  if (loggedIn.value) {
    try {
      await api.post(`/api/community/conversations/${id}/read`)
      const found = conversations.value.find((c) => c.id === id)
      if (found) found.unread = 0
    } catch {}
  }
}

async function send() {
  const body = draft.value.trim()
  if (!body) return
  if (!loggedIn.value) {
    toast.error('Bạn cần đăng nhập để gửi tin nhắn')
    return
  }
  sending.value = true
  try {
    const res = await api.post<any>(`/api/community/conversations/${activeId.value}/messages`, {
      body
    })
    if (res?.data) messages.value = [...messages.value, res.data]
    draft.value = ''
    scrollToBottom(true)
    const found = conversations.value.find((c) => c.id === activeId.value)
    if (found) found.last_message = res?.data || found.last_message
  } catch (e: any) {
    toast.error(api.errMessage(e))
  } finally {
    sending.value = false
    nextTick(() => inputEl.value?.focus())
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (canSend.value) send()
  }
}

async function runSearch() {
  const q = search.value.trim()
  if (q.length < 1) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await api.get<any>('/api/community/users/search', { q, limit: 8 })
    searchResults.value = res?.data?.items || []
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(runSearch, 320)
})

async function openWith(user: any) {
  if (!loggedIn.value) {
    toast.error('Bạn cần đăng nhập để nhắn tin')
    return
  }
  try {
    const res = await api.post<any>('/api/community/conversations', { member_ids: [user.id] })
    search.value = ''
    searchResults.value = []
    await loadConversations()
    if (res?.data?.id) await selectConversation(res.data.id)
  } catch (e: any) {
    toast.error(api.errMessage(e))
  }
}

async function createGroup() {
  if (!loggedIn.value) {
    toast.error('Bạn cần đăng nhập để tạo nhóm')
    return
  }
  const picked = searchResults.value.slice(0, 3)
  if (!picked.length) {
    toast.info('Hãy tìm thành viên trước khi tạo nhóm')
    return
  }
  creatingGroup.value = true
  try {
    await api.post('/api/community/conversations', {
      kind: 'group',
      title: `Nhóm ${picked.map((p) => p.name.split(' ').slice(-1)[0]).join(', ')}`,
      member_ids: picked.map((p) => p.id)
    })
    search.value = ''
    searchResults.value = []
    await loadConversations()
    toast.success('Đã tạo nhóm trò chuyện')
  } catch (e: any) {
    toast.error(api.errMessage(e))
  } finally {
    creatingGroup.value = false
  }
}

function toggleAllowPrivate() {
  allowPrivate.value = !allowPrivate.value
  if (!allowPrivate.value && activeConv.value?.kind !== 'public') {
    const first = publicConversations.value[0]
    if (first) selectConversation(first.id)
  }
}

function isMine(m: any): boolean {
  if (m.is_self) return true
  return Boolean(auth.user && m.sender?.id === auth.user.id)
}

function showMeta(index: number): boolean {
  const cur = messages.value[index]
  const prev = messages.value[index - 1]
  if (!prev) return true
  if (prev.sender?.id !== cur.sender?.id) return true
  return new Date(cur.created_at).getTime() - new Date(prev.created_at).getTime() > 300000
}

onMounted(async () => {
  await loadConversations()
})

onBeforeUnmount(() => {
  stopPolling()
  clearTimeout(searchTimer)
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 sm:py-6">
    <div class="mb-4 flex items-center justify-between gap-3 lg:hidden">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium"
        @click="drawerOpen = true"
      >
        <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="18" />
        Danh sách trò chuyện
      </button>
      <NuxtLink
        to="/community/leaderboard"
        class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium"
      >
        <AppIcon name="solar:ranking-bold-duotone" size="18" />
        Xếp hạng
      </NuxtLink>
    </div>

    <div
      class="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
      :style="{ height: 'min(78vh, 780px)' }"
    >
      <aside
        class="hidden flex-col overflow-hidden rounded-2xl border border-border bg-card lg:flex"
      >
        <div class="border-b border-border p-3">
          <div class="relative">
            <AppIcon
              name="solar:magnifer-line-duotone"
              size="17"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              v-model="search"
              type="text"
              placeholder="Tìm thành viên để nhắn tin..."
              class="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-cmstdev-500"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-2 pb-2">
          <div v-if="searchResults.length" class="mb-2 mt-2">
            <p class="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Kết quả tìm kiếm
            </p>
            <button
              v-for="u in searchResults"
              :key="u.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-muted"
              @click="openWith(u)"
            >
              <img :src="avatarOf(u)" :alt="u.name" class="h-9 w-9 rounded-full bg-muted" />
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-1 truncate text-sm font-medium">
                  {{ u.name }}
                  <AppIcon
                    v-if="u.verified"
                    name="solar:verified-check-bold"
                    size="13"
                    class="text-cmstdev-500"
                  />
                </span>
                <span class="block truncate text-xs text-muted-foreground">@{{ u.username }}</span>
              </span>
            </button>
          </div>

          <p class="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tin nhắn chung
          </p>
          <div v-if="loadingList" class="space-y-2 px-2">
            <div v-for="n in 2" :key="n" class="flex items-center gap-2.5 py-2">
              <div class="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div class="flex-1 space-y-1.5">
                <div class="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div class="h-2.5 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
          <button
            v-for="c in publicConversations"
            :key="c.id"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left transition"
            :class="activeId === c.id ? 'bg-muted' : 'hover:bg-muted/60'"
            @click="selectConversation(c.id)"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cmstdev-500/12 text-cmstdev-500"
            >
              <AppIcon :name="c.icon || 'solar:hashtag-square-bold-duotone'" size="20" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-1.5 truncate text-sm font-semibold">
                {{ c.title }}
                <span
                  v-if="c.id === 'c_ai'"
                  class="rounded-md bg-cmstdev-500/15 px-1.5 py-px text-[10px] font-bold uppercase text-cmstdev-500"
                >
                  AI
                </span>
              </span>
              <span class="block truncate text-xs text-muted-foreground">
                {{ c.last_message?.body || c.subtitle }}
              </span>
            </span>
            <span
              v-if="c.unread"
              class="rounded-full bg-cmstdev-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
            >
              {{ c.unread }}
            </span>
          </button>

          <div class="flex items-center justify-between px-2 pb-1 pt-4">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tin nhắn riêng
            </p>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-[11px] font-semibold text-cmstdev-500 transition hover:opacity-80 disabled:opacity-50"
              :disabled="creatingGroup"
              @click="createGroup"
            >
              <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="14" />
              Tạo nhóm
            </button>
          </div>

          <p
            v-if="!privateConversations.length && !loadingList"
            class="px-2 py-3 text-xs text-muted-foreground"
          >
            {{ allowPrivate ? 'Chưa có cuộc trò chuyện riêng nào.' : 'Bạn đã tắt tin nhắn riêng.' }}
          </p>

          <button
            v-for="c in privateConversations"
            :key="c.id"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left transition"
            :class="activeId === c.id ? 'bg-muted' : 'hover:bg-muted/60'"
            @click="selectConversation(c.id)"
          >
            <span class="relative shrink-0">
              <img :src="avatarOf(c)" :alt="c.title" class="h-10 w-10 rounded-full bg-muted" />
              <span
                v-if="c.partner?.id"
                class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-1 truncate text-sm font-semibold">
                {{ c.title }}
                <AppIcon
                  v-if="c.verified"
                  name="solar:verified-check-bold"
                  size="13"
                  class="text-cmstdev-500"
                />
              </span>
              <span class="block truncate text-xs text-muted-foreground">
                {{ c.last_message?.body || 'Bắt đầu cuộc trò chuyện' }}
              </span>
            </span>
            <span
              v-if="c.unread"
              class="rounded-full bg-cmstdev-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
            >
              {{ c.unread }}
            </span>
          </button>
        </div>

        <div class="border-t border-border p-3">
          <div class="flex items-center gap-2.5 rounded-xl bg-muted/50 p-2.5">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cmstdev-500/12 text-cmstdev-500"
            >
              <AppIcon name="solar:bell-bold-duotone" size="18" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-xs font-semibold">Nhận tin nhắn riêng</span>
              <span class="block text-[11px] text-muted-foreground">Tắt để chỉ xem chat chung</span>
            </span>
            <button
              type="button"
              role="switch"
              :aria-checked="allowPrivate"
              class="relative h-6 w-11 shrink-0 rounded-full transition"
              :class="allowPrivate ? 'bg-cmstdev-500' : 'bg-muted-foreground/30'"
              @click="toggleAllowPrivate"
            >
              <span
                class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                :class="allowPrivate ? 'left-[22px]' : 'left-0.5'"
              />
            </button>
          </div>
        </div>
      </aside>

      <section class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <header class="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            class="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted lg:hidden"
            @click="drawerOpen = true"
          >
            <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="20" />
          </button>
          <span
            v-if="activeConv?.kind === 'public'"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cmstdev-500/12 text-cmstdev-500"
          >
            <AppIcon :name="activeConv?.icon || 'solar:hashtag-square-bold-duotone'" size="20" />
          </span>
          <img
            v-else-if="activeConv"
            :src="avatarOf(activeConv)"
            :alt="activeConv.title"
            class="h-10 w-10 shrink-0 rounded-full bg-muted"
          />
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 truncate text-sm font-semibold">
              {{ activeConv?.title || 'Cộng đồng MapDocs' }}
              <AppIcon
                v-if="activeConv?.verified"
                name="solar:verified-check-bold"
                size="14"
                class="text-cmstdev-500"
              />
            </p>
            <p class="truncate text-xs text-muted-foreground">
              {{
                activeConv?.kind === 'public'
                  ? activeConv?.subtitle || 'Kênh chung của cộng đồng'
                  : 'Trực tuyến'
              }}
            </p>
          </div>
          <span
            class="hidden items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 sm:inline-flex dark:text-emerald-400"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Trực tuyến
          </span>
          <button
            type="button"
            class="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
            aria-label="Tùy chọn"
          >
            <AppIcon name="solar:settings-linear" size="18" />
          </button>
        </header>

        <div ref="listEl" class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div v-if="loadingMessages" class="space-y-4">
            <div v-for="n in 4" :key="n" class="flex gap-2.5" :class="n % 2 ? '' : 'flex-row-reverse'">
              <div class="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
              <div class="h-12 w-1/2 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>

          <p
            v-else-if="!messages.length"
            class="py-16 text-center text-sm text-muted-foreground"
          >
            Chưa có tin nhắn nào. Hãy là người bắt đầu!
          </p>

          <template v-else>
            <div
              v-for="(m, i) in messages"
              :key="m.id"
              class="flex gap-2.5"
              :class="isMine(m) ? 'flex-row-reverse' : ''"
            >
              <img
                v-if="!isMine(m)"
                :src="avatarOf(m.sender)"
                :alt="m.sender?.name"
                class="h-8 w-8 shrink-0 self-end rounded-full bg-muted"
                :class="showMeta(i) ? '' : 'invisible'"
              />
              <div class="flex max-w-[76%] flex-col gap-1" :class="isMine(m) ? 'items-end' : 'items-start'">
                <div
                  v-if="showMeta(i)"
                  class="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground"
                >
                  <template v-if="!isMine(m)">
                    <span class="font-semibold text-foreground">{{ m.sender?.name }}</span>
                    <AppIcon
                      v-if="m.sender?.verified"
                      name="solar:verified-check-bold"
                      size="12"
                      class="text-cmstdev-500"
                    />
                    <span>@{{ m.sender?.username }}</span>
                  </template>
                  <span v-else class="font-semibold text-foreground">Bạn</span>
                  <span>·</span>
                  <span>{{ timeOf(m.created_at) }}</span>
                </div>
                <div
                  class="whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
                  :class="
                    m.type === 'system'
                      ? 'bg-muted/60 text-xs italic text-muted-foreground'
                      : isMine(m)
                        ? 'bg-cmstdev-500 text-white'
                        : 'bg-muted'
                  "
                >
                  {{ m.body }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <footer class="border-t border-border p-3">
          <div class="flex items-end gap-2 rounded-2xl border border-border bg-background p-2">
            <button
              type="button"
              class="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
              aria-label="Đính kèm"
            >
              <AppIcon name="solar:gallery-add-bold-duotone" size="20" />
            </button>
            <textarea
              ref="inputEl"
              v-model="draft"
              rows="1"
              maxlength="2000"
              :placeholder="
                loggedIn
                  ? `Nhắn tới ${activeConv?.title || 'cộng đồng'}...`
                  : 'Đăng nhập để tham gia trò chuyện'
              "
              class="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              @keydown="onKeydown"
            />
            <button
              type="button"
              class="shrink-0 rounded-xl bg-cmstdev-500 p-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!canSend"
              aria-label="Gửi tin nhắn"
              @click="send"
            >
              <AppIcon
                :name="sending ? 'solar:refresh-circle-linear' : 'solar:send-square-bold'"
                size="20"
                :class="sending ? 'animate-spin' : ''"
              />
            </button>
          </div>
          <p class="px-2 pt-1.5 text-[11px] text-muted-foreground">
            Enter để gửi · Shift + Enter để xuống dòng
          </p>
        </footer>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="drawerOpen" class="fixed inset-0 z-[60] lg:hidden">
        <div class="absolute inset-0 bg-black/50" @click="drawerOpen = false" />
        <div class="absolute inset-y-0 left-0 flex w-[86%] max-w-[330px] flex-col bg-card shadow-2xl">
          <div class="flex items-center justify-between border-b border-border px-4 py-3">
            <p class="text-sm font-semibold">Cuộc trò chuyện</p>
            <button
              type="button"
              class="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
              @click="drawerOpen = false"
            >
              <AppIcon name="solar:close-circle-linear" size="20" />
            </button>
          </div>
          <div class="border-b border-border p-3">
            <div class="relative">
              <AppIcon
                name="solar:magnifer-line-duotone"
                size="17"
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                v-model="search"
                type="text"
                placeholder="Tìm thành viên để nhắn tin..."
                class="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cmstdev-500"
              />
            </div>
          </div>
          <div class="flex-1 overflow-y-auto px-2 py-2">
            <button
              v-for="u in searchResults"
              :key="u.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-muted"
              @click="openWith(u)"
            >
              <img :src="avatarOf(u)" :alt="u.name" class="h-9 w-9 rounded-full bg-muted" />
              <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ u.name }}</span>
            </button>
            <p class="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tin nhắn chung
            </p>
            <button
              v-for="c in publicConversations"
              :key="c.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left transition"
              :class="activeId === c.id ? 'bg-muted' : 'hover:bg-muted/60'"
              @click="selectConversation(c.id)"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cmstdev-500/12 text-cmstdev-500"
              >
                <AppIcon :name="c.icon || 'solar:hashtag-square-bold-duotone'" size="18" />
              </span>
              <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ c.title }}</span>
            </button>
            <p class="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tin nhắn riêng
            </p>
            <button
              v-for="c in privateConversations"
              :key="c.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left transition"
              :class="activeId === c.id ? 'bg-muted' : 'hover:bg-muted/60'"
              @click="selectConversation(c.id)"
            >
              <img :src="avatarOf(c)" :alt="c.title" class="h-9 w-9 rounded-full bg-muted" />
              <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ c.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
