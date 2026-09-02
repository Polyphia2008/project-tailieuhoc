<script setup lang="ts">
import { toast } from 'vue-sonner'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from 'radix-vue'

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
const replyingTo = ref<any>(null)
const groupOpen = ref(false)
const groupTitle = ref('')
const groupSearch = ref('')
const groupCandidates = ref<any[]>([])
const groupLoading = ref(false)
const groupPicked = ref<string[]>([])

let poller: any = null
let searchTimer: any = null
let groupTimer: any = null

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
  return new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function dayKeyOf(v: any): string {
  if (!v) return ''
  const d = new Date(v)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dayLabelOf(v: any): string {
  if (!v) return ''
  const d = new Date(v)
  const now = new Date()
  const diff = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000
  )
  if (diff === 0) return 'Hôm nay'
  if (diff === 1) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function showDay(index: number): boolean {
  const cur = messages.value[index]
  const prev = messages.value[index - 1]
  if (!prev) return true
  return dayKeyOf(cur.created_at) !== dayKeyOf(prev.created_at)
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

function autoGrow() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 128)}px`
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
      body,
      type: 'text',
      reply_to_id: replyingTo.value?.id || null
    })
    if (res?.data) messages.value = [...messages.value, res.data]
    draft.value = ''
    replyingTo.value = null
    nextTick(autoGrow)
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

watch(draft, () => nextTick(autoGrow))

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

function startReply(message: any) {
  if (!message || message.type === 'system') return
  replyingTo.value = message
  nextTick(() => inputEl.value?.focus())
}

function cancelReply() {
  replyingTo.value = null
}

function replyName(message: any): string {
  if (!message) return 'thành viên'
  if (message.is_self || isMine(message)) return 'chính bạn'
  return message.sender?.name || 'thành viên'
}

const groupCount = computed(() => groupPicked.value.length)
const canCreateGroup = computed(
  () => groupCount.value >= 2 && groupTitle.value.trim().length > 0 && !creatingGroup.value
)

function openGroupDialog() {
  if (!loggedIn.value) {
    toast.error('Bạn cần đăng nhập để tạo nhóm')
    return
  }
  groupTitle.value = ''
  groupSearch.value = ''
  groupPicked.value = []
  drawerOpen.value = false
  groupOpen.value = true
  loadGroupCandidates()
}

async function loadGroupCandidates() {
  groupLoading.value = true
  try {
    const res = await api.get<any>('/api/community/users/search', {
      q: groupSearch.value.trim(),
      limit: 20
    })
    const mine = auth.user?.id
    groupCandidates.value = (res?.data?.items || []).filter((u: any) => u.id !== mine)
  } catch {
    groupCandidates.value = []
  } finally {
    groupLoading.value = false
  }
}

watch(groupSearch, () => {
  clearTimeout(groupTimer)
  groupTimer = setTimeout(loadGroupCandidates, 320)
})

function isPicked(id: string): boolean {
  return groupPicked.value.includes(id)
}

function toggleGroupMember(id: string) {
  if (!id || id === auth.user?.id) return
  const at = groupPicked.value.indexOf(id)
  if (at >= 0) groupPicked.value.splice(at, 1)
  else groupPicked.value.push(id)
}

async function submitGroup() {
  if (!canCreateGroup.value) return
  creatingGroup.value = true
  try {
    const res = await api.post<any>('/api/community/conversations', {
      kind: 'group',
      title: groupTitle.value.trim(),
      member_ids: [...groupPicked.value]
    })
    groupOpen.value = false
    await loadConversations()
    if (res?.data?.id) await selectConversation(res.data.id)
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
  if (showDay(index)) return true
  if (prev.sender?.id !== cur.sender?.id) return true
  return new Date(cur.created_at).getTime() - new Date(prev.created_at).getTime() > 300000
}

onMounted(async () => {
  await loadConversations()
})

onBeforeUnmount(() => {
  stopPolling()
  clearTimeout(searchTimer)
  clearTimeout(groupTimer)
})
</script>

<template>
  <div class="cm-page">
    <div class="cm-shell">
      <div v-if="drawerOpen" class="cm-backdrop" @click="drawerOpen = false" />

      <aside class="cm-sidebar" :class="drawerOpen ? 'cm-sidebar-open' : ''">
        <div class="cm-side-head">
          <span class="cm-side-head-icon">
            <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="20" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="cm-side-head-title">Cộng đồng</span>
            <span class="cm-side-head-sub">Trò chuyện &amp; tin nhắn riêng</span>
          </span>
          <button
            type="button"
            class="cm-icon-btn cm-side-close"
            aria-label="Đóng danh sách"
            @click="drawerOpen = false"
          >
            <AppIcon name="solar:close-circle-linear" size="20" />
          </button>
        </div>

        <div class="cm-side-search">
          <label class="cm-search">
            <AppIcon name="solar:magnifer-line-duotone" size="17" class="cm-search-icon" />
            <input v-model="search" type="text" placeholder="Tìm thành viên để nhắn tin..." />
          </label>
        </div>

        <div class="cm-side-body">
          <div v-if="searchResults.length" class="cm-side-block">
            <p class="cm-side-label">Kết quả tìm kiếm</p>
            <button v-for="u in searchResults" :key="u.id" type="button" class="cm-conv" @click="openWith(u)">
              <img :src="avatarOf(u)" :alt="u.name" class="cm-conv-avatar" />
              <span class="min-w-0 flex-1">
                <span class="cm-conv-title">
                  {{ u.name }}
                  <AppIcon
                    v-if="u.verified"
                    name="solar:verified-check-bold"
                    size="13"
                    class="text-cmstdev-500"
                  />
                </span>
                <span class="cm-conv-preview">@{{ u.username }}</span>
              </span>
            </button>
          </div>

          <p class="cm-side-label">Tin nhắn chung</p>
          <div v-if="loadingList" class="cm-skel-list">
            <div v-for="n in 2" :key="n" class="cm-skel-row">
              <div class="cm-skel-avatar" />
              <div class="flex-1 space-y-1.5">
                <div class="cm-skel-line" />
                <div class="cm-skel-line cm-skel-line-sm" />
              </div>
            </div>
          </div>
          <button
            v-for="c in publicConversations"
            :key="c.id"
            type="button"
            class="cm-conv"
            :class="activeId === c.id ? 'cm-conv-active' : ''"
            @click="selectConversation(c.id)"
          >
            <span class="cm-conv-icon">
              <AppIcon :name="c.icon || 'solar:hashtag-square-bold-duotone'" size="20" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="cm-conv-title">
                {{ c.title }}
                <span v-if="c.id === 'c_ai'" class="cm-tag">AI</span>
              </span>
              <span class="cm-conv-preview">{{ c.last_message?.body || c.subtitle }}</span>
            </span>
            <span v-if="c.unread" class="cm-unread">{{ c.unread }}</span>
          </button>

          <div class="cm-divider" />

          <div class="cm-side-label-row">
            <p class="cm-side-label cm-side-label-flush">Tin nhắn riêng</p>
            <button type="button" class="cm-side-action" @click="openGroupDialog">
              <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="14" />
              Tạo nhóm
            </button>
          </div>

          <p v-if="!privateConversations.length && !loadingList" class="cm-side-empty">
            {{ allowPrivate ? 'Chưa có cuộc trò chuyện riêng nào.' : 'Bạn đã tắt tin nhắn riêng.' }}
          </p>

          <button
            v-for="c in privateConversations"
            :key="c.id"
            type="button"
            class="cm-conv"
            :class="activeId === c.id ? 'cm-conv-active' : ''"
            @click="selectConversation(c.id)"
          >
            <span class="relative shrink-0">
              <img :src="avatarOf(c)" :alt="c.title" class="cm-conv-avatar" />
              <span v-if="c.partner?.id" class="cm-conv-dot" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="cm-conv-title">
                {{ c.title }}
                <AppIcon
                  v-if="c.verified"
                  name="solar:verified-check-bold"
                  size="13"
                  class="text-cmstdev-500"
                />
              </span>
              <span class="cm-conv-preview">
                {{ c.last_message?.body || 'Bắt đầu cuộc trò chuyện' }}
              </span>
            </span>
            <span v-if="c.unread" class="cm-unread">{{ c.unread }}</span>
          </button>
        </div>

        <div class="cm-side-foot">
          <div class="cm-switch-card">
            <span class="cm-switch-icon">
              <AppIcon name="solar:bell-bold-duotone" size="18" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="cm-switch-title">Nhận tin nhắn riêng</span>
              <span class="cm-switch-sub">Tắt để chỉ xem chat cộng đồng</span>
            </span>
            <button
              type="button"
              role="switch"
              :aria-checked="allowPrivate"
              class="cm-switch"
              :class="allowPrivate ? 'cm-switch-on' : ''"
              @click="toggleAllowPrivate"
            >
              <span class="cm-switch-knob" />
            </button>
          </div>
        </div>
      </aside>

      <section class="cm-chat">
        <header class="cm-chat-head">
          <button type="button" class="cm-icon-btn cm-open-btn" aria-label="Mở danh sách" @click="drawerOpen = true">
            <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="20" />
          </button>
          <span v-if="activeConv?.kind === 'public'" class="cm-conv-icon">
            <AppIcon :name="activeConv?.icon || 'solar:hashtag-square-bold-duotone'" size="20" />
          </span>
          <img
            v-else-if="activeConv"
            :src="avatarOf(activeConv)"
            :alt="activeConv.title"
            class="cm-conv-avatar"
          />
          <div class="min-w-0 flex-1">
            <p class="cm-chat-title">
              {{ activeConv?.title || 'Cộng đồng MapDocs' }}
              <AppIcon
                v-if="activeConv?.verified"
                name="solar:verified-check-bold"
                size="14"
                class="text-cmstdev-500"
              />
            </p>
            <p class="cm-chat-sub">
              {{
                activeConv?.kind === 'public'
                  ? activeConv?.subtitle || 'Kênh chung của cộng đồng'
                  : 'Trực tuyến'
              }}
            </p>
          </div>
          <span class="cm-online">
            <span class="cm-online-dot" />
            Trực tuyến
          </span>
          <button type="button" class="cm-icon-btn" aria-label="Tìm trong hội thoại">
            <AppIcon name="solar:magnifer-line-duotone" size="18" />
          </button>
          <button type="button" class="cm-icon-btn" aria-label="Tùy chọn">
            <AppIcon name="solar:settings-linear" size="18" />
          </button>
        </header>

        <div ref="listEl" class="cm-messages">
          <div v-if="loadingMessages" class="space-y-4">
            <div v-for="n in 4" :key="n" class="flex gap-2.5" :class="n % 2 ? '' : 'flex-row-reverse'">
              <div class="cm-skel-avatar" />
              <div class="cm-skel-bubble" />
            </div>
          </div>

          <div v-else-if="!messages.length" class="cm-chat-empty">
            <span class="cm-chat-empty-icon">
              <AppIcon name="solar:chat-round-line-linear" size="26" />
            </span>
            <p class="cm-chat-empty-title">Chưa có tin nhắn</p>
            <p class="cm-chat-empty-sub">Hãy là người mở lời đầu tiên trong cuộc trò chuyện này.</p>
          </div>

          <template v-else>
            <template v-for="(m, i) in messages" :key="m.id">
              <div v-if="showDay(i)" class="cm-day">
                <span class="cm-day-pill">{{ dayLabelOf(m.created_at) }}</span>
              </div>
              <div :id="`cm-m-${m.id}`" class="cm-msg cm-message" :class="isMine(m) ? 'cm-msg-mine' : ''">
                <img
                  v-if="!isMine(m)"
                  :src="avatarOf(m.sender)"
                  :alt="m.sender?.name"
                  class="cm-msg-avatar"
                  :class="showMeta(i) ? '' : 'invisible'"
                />
                <div class="cm-msg-col">
                  <div v-if="showMeta(i)" class="cm-msg-meta">
                    <template v-if="!isMine(m)">
                      <span class="cm-msg-sender">{{ m.sender?.name }}</span>
                      <AppIcon
                        v-if="m.sender?.verified"
                        name="solar:verified-check-bold"
                        size="12"
                        class="text-cmstdev-500"
                      />
                      <span>@{{ m.sender?.username }}</span>
                    </template>
                    <span v-else class="cm-msg-sender">Bạn</span>
                  </div>
                  <div class="cm-bubble-row">
                    <div
                      class="cm-bubble"
                      :class="
                        m.type === 'system'
                          ? 'cm-bubble-system'
                          : isMine(m)
                            ? 'cm-bubble-mine'
                            : 'cm-bubble-other'
                      "
                    >
                      <div v-if="m.reply_to" class="cm-reply-preview">
                        <span>{{ m.reply_to.sender?.name }}</span>
                        <p>{{ m.reply_to.body }}</p>
                      </div>
                      {{ m.body }}
                    </div>
                    <button
                      v-if="m.type !== 'system'"
                      type="button"
                      title="Phản hồi"
                      aria-label="Phản hồi tin nhắn"
                      class="cm-reply-button"
                      @click="startReply(m)"
                    >
                      <AppIcon name="solar:reply-2-linear" size="16" />
                    </button>
                    <span class="cm-time">{{ timeOf(m.created_at) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>

        <footer class="cm-composer-wrap">
          <div v-if="replyingTo" class="cm-reply-bar">
            <AppIcon name="solar:reply-2-linear" size="16" />
            <div class="min-w-0 flex-1">
              <p>Đang trả lời {{ replyName(replyingTo) }}</p>
              <p>{{ replyingTo.body }}</p>
            </div>
            <button
              type="button"
              class="cm-reply-cancel"
              aria-label="Hủy trả lời"
              @click="cancelReply"
            >
              <AppIcon name="solar:close-circle-linear" size="16" />
            </button>
          </div>
          <div class="cm-composer">
            <button type="button" class="cm-icon-btn shrink-0" aria-label="Đính kèm">
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
              class="cm-textarea"
              @keydown="onKeydown"
              @input="autoGrow"
            />
            <button
              type="button"
              class="cm-send"
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
          <p class="cm-hint">Enter để gửi · Shift + Enter để xuống dòng</p>
        </footer>
      </section>
    </div>

    <DialogRoot v-model:open="groupOpen">
      <DialogPortal>
        <DialogOverlay class="cg-overlay" />
        <DialogContent class="cg-content">
          <div class="cg-head">
            <span class="cg-head-icon">
              <AppIcon name="solar:users-group-two-rounded-bold-duotone" size="20" />
            </span>
            <div class="min-w-0 flex-1">
              <DialogTitle class="cg-title">Tạo nhóm chat</DialogTitle>
              <DialogDescription class="cg-desc">
                Chỉ có thể thêm bạn bè vào nhóm. Cần tối thiểu 2 thành viên.
              </DialogDescription>
            </div>
            <DialogClose class="cg-close" aria-label="Đóng">
              <AppIcon name="solar:close-circle-linear" size="20" />
            </DialogClose>
          </div>

          <div class="cg-body">
            <label class="cg-field">
              <span class="cg-label">Tên nhóm</span>
              <input
                v-model="groupTitle"
                type="text"
                maxlength="60"
                placeholder="Tên nhóm..."
                class="cg-input"
              />
            </label>

            <label class="cg-search">
              <AppIcon name="solar:magnifer-line-duotone" size="17" class="cg-search-icon" />
              <input v-model="groupSearch" type="text" placeholder="Tìm bạn bè..." />
            </label>

            <div class="cg-list">
              <p v-if="groupLoading" class="cg-empty">Đang tải danh sách...</p>
              <p v-else-if="!groupCandidates.length" class="cg-empty">
                Không tìm thấy bạn bè phù hợp.
              </p>
              <button
                v-for="u in groupCandidates"
                :key="u.id"
                type="button"
                class="cg-row"
                :class="isPicked(u.id) ? 'cg-row-active' : ''"
                :aria-pressed="isPicked(u.id)"
                @click="toggleGroupMember(u.id)"
              >
                <img :src="avatarOf(u)" :alt="u.name" class="cg-avatar" />
                <span class="min-w-0 flex-1 text-left">
                  <span class="cg-name">
                    {{ u.name }}
                    <AppIcon
                      v-if="u.verified"
                      name="solar:verified-check-bold"
                      size="13"
                      class="text-cmstdev-500"
                    />
                  </span>
                  <span class="cg-username">@{{ u.username }}</span>
                </span>
                <span class="cg-check" :class="isPicked(u.id) ? 'cg-check-on' : ''">
                  <AppIcon v-if="isPicked(u.id)" name="solar:check-circle-bold" size="16" />
                </span>
              </button>
            </div>
          </div>

          <div class="cg-foot">
            <DialogClose class="cg-btn cg-btn-ghost">Hủy</DialogClose>
            <button
              type="button"
              class="cg-btn cg-btn-primary"
              :disabled="!canCreateGroup"
              @click="submitGroup"
            >
              Tạo nhóm ({{ groupCount }})
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<style scoped>
.cm-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 12px 20px;
}

.cm-shell {
  position: relative;
  display: flex;
  min-height: calc(100dvh - 176px);
  height: calc(100dvh - 176px);
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--background));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.cm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(0, 0, 0, 0.45);
  animation: cm-fade-in 0.2s ease;
}

.cm-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 80;
  display: flex;
  width: min(86vw, 320px);
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e5e5e5;
  color: #0a0a0a;
  transform: translateX(-100%);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.cm-sidebar-open {
  transform: translateX(0);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

html.dark .cm-sidebar {
  background: #18181b;
  border-right-color: #27272a;
  color: #fafafa;
}

@keyframes cm-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cm-sidebar {
    transition: none;
  }

  .cm-backdrop {
    animation: none;
  }
}

.cm-side-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid #e5e5e5;
}

html.dark .cm-side-head {
  border-bottom-color: #27272a;
}

.cm-side-head-icon {
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(14, 165, 233, 0.12);
  color: #0ea5e9;
}

html.dark .cm-side-head-icon {
  color: #38bdf8;
}

.cm-side-head-title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #0a0a0a;
}

.cm-side-head-sub {
  display: block;
  font-size: 11px;
  color: #737373;
}

html.dark .cm-side-head-title {
  color: #fafafa;
}

html.dark .cm-side-head-sub {
  color: #a1a1aa;
}

.cm-side-search {
  padding: 12px 12px 6px;
}

.cm-search {
  position: relative;
  display: flex;
  align-items: center;
}

.cm-search-icon {
  position: absolute;
  left: 12px;
  color: #737373;
  pointer-events: none;
}

html.dark .cm-search-icon {
  color: #a1a1aa;
}

.cm-search input {
  width: 100%;
  height: 38px;
  padding: 0 12px 0 36px;
  border-radius: 9999px;
  border: 1px solid #e5e5e5;
  background: #f5f5f5;
  font-size: 13px;
  color: #0a0a0a;
  outline: none;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease;
}

.cm-search input:focus {
  border-color: #0ea5e9;
  background: #ffffff;
}

html.dark .cm-search input {
  border-color: #27272a;
  background: #27272a;
  color: #fafafa;
}

html.dark .cm-search input:focus {
  border-color: #38bdf8;
  background: #18181b;
}

.cm-side-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 8px 8px;
}

.cm-side-block {
  margin-bottom: 4px;
}

.cm-side-label {
  padding: 10px 8px 4px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #737373;
}

html.dark .cm-side-label {
  color: #a1a1aa;
}

.cm-side-label-flush {
  padding: 0;
}

.cm-side-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px 4px;
}

.cm-side-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #0ea5e9;
  transition: opacity 0.16s ease;
}

.cm-side-action:hover {
  opacity: 0.8;
}

.cm-side-action:disabled {
  opacity: 0.5;
}

html.dark .cm-side-action {
  color: #38bdf8;
}

.cm-side-empty {
  padding: 10px 8px;
  font-size: 12px;
  color: #737373;
}

html.dark .cm-side-empty {
  color: #a1a1aa;
}

.cm-divider {
  height: 1px;
  margin: 8px 8px 0;
  background: #e5e5e5;
}

html.dark .cm-divider {
  background: #27272a;
}

.cm-conv {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 12px;
  text-align: left;
  transition: background-color 0.16s ease;
}

.cm-conv:hover {
  background: #f5f5f5;
}

.cm-conv-active {
  background: #f0f9ff;
}

html.dark .cm-conv:hover {
  background: #27272a;
}

html.dark .cm-conv-active {
  background: rgba(14, 165, 233, 0.14);
}

.cm-conv-avatar {
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgb(var(--muted));
}

.cm-conv-icon {
  display: flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(14, 165, 233, 0.12);
  color: #0ea5e9;
}

html.dark .cm-conv-icon {
  color: #38bdf8;
}

.cm-conv-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  height: 11px;
  width: 11px;
  border-radius: 9999px;
  border: 2px solid #ffffff;
  background: #10b981;
}

html.dark .cm-conv-dot {
  border-color: #18181b;
}

.cm-conv-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13.5px;
  font-weight: 600;
  color: #0a0a0a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.dark .cm-conv-title {
  color: #fafafa;
}

.cm-conv-preview {
  display: block;
  margin-top: 1px;
  font-size: 11.5px;
  color: #737373;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.dark .cm-conv-preview {
  color: #a1a1aa;
}

.cm-tag {
  border-radius: 5px;
  background: rgba(14, 165, 233, 0.15);
  padding: 1px 5px;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: #0ea5e9;
}

.cm-unread {
  flex-shrink: 0;
  border-radius: 9999px;
  background: #0ea5e9;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
}

.cm-side-foot {
  padding: 12px;
  border-top: 1px solid #e5e5e5;
}

html.dark .cm-side-foot {
  border-top-color: #27272a;
}

.cm-switch-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: #f5f5f5;
}

html.dark .cm-switch-card {
  background: #27272a;
}

.cm-switch-icon {
  display: flex;
  height: 34px;
  width: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(14, 165, 233, 0.14);
  color: #0ea5e9;
}

html.dark .cm-switch-icon {
  color: #38bdf8;
}

.cm-switch-title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #0a0a0a;
}

.cm-switch-sub {
  display: block;
  font-size: 10.5px;
  color: #737373;
}

html.dark .cm-switch-title {
  color: #fafafa;
}

html.dark .cm-switch-sub {
  color: #a1a1aa;
}

.cm-switch {
  position: relative;
  height: 22px;
  width: 40px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgba(115, 115, 115, 0.35);
  transition: background-color 0.18s ease;
}

.cm-switch-on {
  background: #0ea5e9;
}

.cm-switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: #ffffff;
  transition: left 0.18s ease;
}

.cm-switch-on .cm-switch-knob {
  left: 20px;
}

.cm-chat {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  background: rgb(var(--background));
}

.cm-chat-head {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid rgb(var(--border));
  background: rgb(var(--card));
}

.cm-chat-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cm-chat-sub {
  margin-top: 1px;
  font-size: 11.5px;
  color: rgb(var(--muted-foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cm-online {
  display: none;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.12);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #059669;
}

html.dark .cm-online {
  color: #34d399;
}

.cm-online-dot {
  height: 6px;
  width: 6px;
  border-radius: 9999px;
  background: #10b981;
}

.cm-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 7px;
  color: rgb(var(--muted-foreground));
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.cm-icon-btn:hover {
  background: rgb(var(--muted));
  color: rgb(var(--foreground));
}

.cm-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 14px;
  background: linear-gradient(180deg, rgb(var(--muted) / 0.35), rgb(var(--background)) 190px);
}

.cm-day {
  display: flex;
  justify-content: center;
  margin: 10px 0 14px;
}

.cm-day-pill {
  border-radius: 9999px;
  border: 1px solid rgb(var(--border) / 0.7);
  background: rgb(var(--card));
  padding: 3px 12px;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--muted-foreground));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.cm-msg {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.cm-msg-mine {
  flex-direction: row-reverse;
}

.cm-msg-avatar {
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  align-self: flex-end;
  border-radius: 9999px;
  background: rgb(var(--muted));
}

.cm-msg-col {
  display: flex;
  max-width: 76%;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
}

.cm-msg-mine .cm-msg-col {
  align-items: flex-end;
}

.cm-msg-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 4px;
  font-size: 11px;
  color: rgb(var(--muted-foreground));
}

.cm-msg-sender {
  font-weight: 700;
  color: rgb(var(--foreground));
}

.cm-bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.cm-msg-mine .cm-bubble-row {
  flex-direction: row-reverse;
}

.cm-bubble {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 8px 13px;
  font-size: 13.5px;
  line-height: 1.55;
  border-radius: 16px;
}

.cm-bubble-other {
  background: rgb(var(--muted));
  border-bottom-left-radius: 6px;
}

.cm-bubble-mine {
  background: #0ea5e9;
  color: #ffffff;
  border-bottom-right-radius: 6px;
}

.cm-bubble-system {
  background: rgb(var(--muted) / 0.6);
  font-size: 11.5px;
  font-style: italic;
  color: rgb(var(--muted-foreground));
}

.cm-time {
  flex-shrink: 0;
  padding-bottom: 3px;
  font-size: 10.5px;
  color: rgb(var(--muted-foreground));
  opacity: 0;
  transition: opacity 0.16s ease;
}

.cm-msg:hover .cm-time {
  opacity: 1;
}

.cm-chat-empty {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}

.cm-chat-empty-icon {
  display: inline-flex;
  height: 52px;
  width: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgb(var(--muted));
  color: rgb(var(--muted-foreground));
}

.cm-chat-empty-title {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
}

.cm-chat-empty-sub {
  font-size: 12.5px;
  color: rgb(var(--muted-foreground));
}

.cm-reply-button {
  display: grid;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 999px;
  color: rgb(var(--muted-foreground));
  opacity: 0;
  transition:
    opacity 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.cm-message:hover .cm-reply-button,
.cm-reply-button:focus-visible {
  opacity: 1;
}

.cm-reply-button:hover {
  background: rgb(var(--muted));
  color: #0ea5e9;
}

.cm-reply-preview {
  margin-bottom: 5px;
  border-left: 2px solid #0ea5e9;
  border-radius: 5px;
  background: rgb(var(--background) / 0.35);
  padding: 5px 8px;
  font-size: 11px;
}

.cm-bubble-mine .cm-reply-preview {
  border-left-color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

.cm-reply-preview span {
  display: block;
  color: #0ea5e9;
  font-weight: 700;
}

.cm-bubble-mine .cm-reply-preview span {
  color: #ffffff;
}

.cm-reply-preview p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgb(var(--muted-foreground));
}

.cm-bubble-mine .cm-reply-preview p {
  color: rgba(255, 255, 255, 0.85);
}

.cm-reply-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 8px;
  border-top: 1px solid rgb(var(--border));
  border-radius: 12px;
  background: rgb(var(--muted) / 0.4);
  padding: 0.5rem 1rem;
}

.cm-reply-bar > svg {
  flex-shrink: 0;
  color: #0ea5e9;
}

.cm-reply-bar p:first-child {
  color: #0ea5e9;
  font-size: 11px;
  font-weight: 700;
}

.cm-reply-bar p:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgb(var(--muted-foreground));
  font-size: 12px;
}

.cm-reply-cancel {
  display: grid;
  height: 26px;
  width: 26px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 999px;
  color: rgb(var(--muted-foreground));
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.cm-reply-cancel:hover {
  background: rgb(var(--muted));
  color: rgb(var(--foreground));
}

.cm-composer-wrap {
  flex-shrink: 0;
  padding: 10px 14px 14px;
  background: rgb(var(--background));
}

.cm-composer {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 6px;
  border-radius: 24px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--muted) / 0.4);
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease;
}

.cm-composer:focus-within {
  border-color: #0ea5e9;
  background: rgb(var(--background));
}

.cm-textarea {
  flex: 1;
  min-height: 36px;
  max-height: 128px;
  resize: none;
  overflow-y: auto;
  padding: 8px 4px;
  background: transparent;
  font-size: 13.5px;
  line-height: 1.5;
  outline: none;
}

.cm-textarea::placeholder {
  color: rgb(var(--muted-foreground));
}

.cm-send {
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #0ea5e9;
  color: #ffffff;
  transition: opacity 0.16s ease;
}

.cm-send:hover {
  opacity: 0.9;
}

.cm-send:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.cm-hint {
  padding: 6px 12px 0;
  font-size: 10.5px;
  color: rgb(var(--muted-foreground));
}

.cm-skel-list {
  padding: 0 8px;
}

.cm-skel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.cm-skel-avatar {
  height: 36px;
  width: 36px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgb(var(--muted));
  animation: cm-pulse 1.6s ease-in-out infinite;
}

.cm-skel-line {
  height: 11px;
  width: 66%;
  border-radius: 5px;
  background: rgb(var(--muted));
  animation: cm-pulse 1.6s ease-in-out infinite;
}

.cm-skel-line-sm {
  height: 9px;
  width: 100%;
}

.cm-skel-bubble {
  height: 48px;
  width: 48%;
  border-radius: 16px;
  background: rgb(var(--muted));
  animation: cm-pulse 1.6s ease-in-out infinite;
}

@keyframes cm-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (min-width: 640px) {
  .cm-online {
    display: inline-flex;
  }
}

@media (min-width: 1024px) {
  .cm-page {
    padding: 16px 20px 24px;
  }

  .cm-shell {
    min-height: calc(100dvh - 92px);
    height: calc(100dvh - 92px);
    border-radius: 24px;
  }

  .cm-backdrop {
    display: none;
  }

  .cm-sidebar {
    position: relative;
    inset: auto;
    z-index: 1;
    width: 320px;
    flex-shrink: 0;
    transform: none;
    box-shadow: none;
  }

  .cm-side-head {
    display: none;
  }

  .cm-side-close,
  .cm-open-btn {
    display: none;
  }

  .cm-side-search {
    padding: 14px 12px 6px;
  }

  .cm-messages {
    padding: 18px 22px;
  }

  .cm-composer-wrap {
    padding: 12px 22px 18px;
  }
}
</style>

<style>
.cg-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  animation: cg-fade 0.18s ease;
}

.cg-content {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 100;
  display: flex;
  max-height: min(88dvh, 640px);
  width: min(calc(100vw - 24px), 480px);
  transform: translate(-50%, -50%);
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--card));
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.32);
  animation: cg-pop 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.cg-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-shrink: 0;
  padding: 16px;
  border-bottom: 1px solid rgb(var(--border));
}

.cg-head-icon {
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(14, 165, 233, 0.12);
  color: #0ea5e9;
}

.cg-title {
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--foreground));
}

.cg-desc {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.45;
  color: rgb(var(--muted-foreground));
}

.cg-close {
  display: grid;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  color: rgb(var(--muted-foreground));
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.cg-close:hover {
  background: rgb(var(--muted));
  color: rgb(var(--foreground));
}

.cg-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
}

.cg-field {
  display: block;
  margin-bottom: 12px;
}

.cg-label {
  display: block;
  margin-bottom: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--muted-foreground));
}

.cg-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--background));
  font-size: 13.5px;
  color: rgb(var(--foreground));
  outline: none;
  transition: border-color 0.16s ease;
}

.cg-input:focus {
  border-color: #0ea5e9;
}

.cg-search {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.cg-search-icon {
  position: absolute;
  left: 12px;
  pointer-events: none;
  color: rgb(var(--muted-foreground));
}

.cg-search input {
  width: 100%;
  height: 38px;
  padding: 0 12px 0 36px;
  border-radius: 9999px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--muted) / 0.5);
  font-size: 13px;
  color: rgb(var(--foreground));
  outline: none;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease;
}

.cg-search input:focus {
  border-color: #0ea5e9;
  background: rgb(var(--background));
}

.cg-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cg-empty {
  padding: 14px 6px;
  font-size: 12.5px;
  color: rgb(var(--muted-foreground));
}

.cg-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 12px;
  transition: background-color 0.16s ease;
}

.cg-row:hover {
  background: rgb(var(--muted) / 0.7);
}

.cg-row-active {
  background: rgba(14, 165, 233, 0.1);
}

.cg-avatar {
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgb(var(--muted));
}

.cg-name {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13.5px;
  font-weight: 600;
  color: rgb(var(--foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cg-username {
  display: block;
  margin-top: 1px;
  font-size: 11.5px;
  color: rgb(var(--muted-foreground));
}

.cg-check {
  display: grid;
  height: 22px;
  width: 22px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  border: 1.5px solid rgb(var(--border));
  color: #ffffff;
}

.cg-check-on {
  border-color: #0ea5e9;
  background: #0ea5e9;
}

.cg-foot {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgb(var(--border));
  background: rgb(var(--muted) / 0.3);
}

.cg-btn {
  display: inline-flex;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  transition:
    opacity 0.16s ease,
    background-color 0.16s ease;
}

.cg-btn-ghost {
  background: rgb(var(--muted));
  color: rgb(var(--foreground));
}

.cg-btn-ghost:hover {
  opacity: 0.85;
}

.cg-btn-primary {
  background: #0ea5e9;
  color: #ffffff;
}

.cg-btn-primary:hover {
  opacity: 0.9;
}

.cg-btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@keyframes cg-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes cg-pop {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cg-overlay,
  .cg-content {
    animation: none;
  }
}
</style>
