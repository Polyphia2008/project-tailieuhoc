<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý khiếu nại — MapDocs Admin' })

const ui = useUiStore()
const { dateTime, timeAgo, number } = useFormat()

const page = ref(1)
const status = ref('all')

const TABS = [
  { key: 'all', label: 'Tất cả', icon: 'fa-list' },
  { key: 'open', label: 'Chờ xử lý', icon: 'fa-clock' },
  { key: 'resolved', label: 'Đã giải quyết', icon: 'fa-circle-check' },
  { key: 'rejected', label: 'Đã từ chối', icon: 'fa-circle-xmark' }
]

const { data, pending, refresh } = await useAsyncData(
  'admin-reports',
  () => $fetch<any>('/api/admin/reports', { query: { page: page.value, limit: 15, status: status.value } }),
  { watch: [page, status] }
)

const items = computed<any[]>(() => data.value?.data?.items || [])
const totalPages = computed(() => data.value?.data?.totalPages || 1)
const total = computed(() => data.value?.data?.total || 0)
const openCount = computed(() => items.value.filter((r) => r.status === 'open').length)

watch(status, () => { page.value = 1 })

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  open: { label: 'Chờ xử lý', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'fa-clock' },
  resolved: { label: 'Đã giải quyết', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'fa-circle-check' },
  rejected: { label: 'Đã từ chối', cls: 'bg-red-50 text-red-700 border-red-200', icon: 'fa-circle-xmark' },
  dismissed: { label: 'Đã bỏ qua', cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'fa-ban' }
}
const st = (s: string) => STATUS_MAP[s] || { label: s, cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'fa-flag' }

// Action modal
const showAction = ref(false)
const target = ref<any>(null)
const nextStatus = ref<'resolved' | 'rejected'>('resolved')
const note = ref('')
const busy = ref(false)

const PRESETS: Record<string, string[]> = {
  resolved: [
    'Đã kiểm tra và gỡ tài liệu vi phạm khỏi hệ thống.',
    'Đã yêu cầu tác giả cập nhật lại nội dung tài liệu.',
    'Đã hoàn tiền cho người mua theo chính sách.',
    'Đã cảnh cáo người bán và ghi nhận vi phạm.'
  ],
  rejected: [
    'Nội dung khiếu nại không đủ căn cứ để xử lý.',
    'Tài liệu không vi phạm chính sách của MapDocs.',
    'Khiếu nại trùng lặp với báo cáo đã được xử lý.',
    'Thông tin cung cấp chưa đầy đủ, vui lòng gửi lại.'
  ]
}

const openAction = (r: any, s: 'resolved' | 'rejected') => {
  target.value = r
  nextStatus.value = s
  note.value = ''
  showAction.value = true
}

const submit = async () => {
  if (!target.value) return
  if (!note.value.trim()) return ui.error('Vui lòng nhập ghi chú xử lý')
  busy.value = true
  try {
    const res = await $fetch<any>('/api/admin/reports', {
      method: 'POST',
      body: { id: target.value.id, status: nextStatus.value, note: note.value.trim() }
    })
    ui.success(res.message || 'Đã cập nhật khiếu nại')
    showAction.value = false
    target.value = null
    await refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể cập nhật khiếu nại')
  } finally {
    busy.value = false
  }
}

const reopen = async (r: any) => {
  busy.value = true
  try {
    await $fetch<any>('/api/admin/reports', { method: 'POST', body: { id: r.id, status: 'open', note: 'Mở lại để xem xét thêm.' } })
    ui.success('Đã mở lại khiếu nại')
    await refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể mở lại khiếu nại')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Quản lý khiếu nại</h2>
        <p class="text-sm text-slate-500 mt-0.5">
          Tổng {{ number(total) }} khiếu nại
          <span v-if="openCount" class="text-amber-600 font-semibold">· {{ openCount }} đang chờ xử lý</span>
        </p>
      </div>
      <button class="btn btn-outline btn-sm" :disabled="pending" @click="refresh()">
        <i class="fa-solid fa-rotate" :class="pending ? 'fa-spin' : ''" /> Làm mới
      </button>
    </div>

    <div class="card p-4 flex flex-wrap gap-2">
      <button v-for="t in TABS" :key="t.key" class="tab" :class="status === t.key ? 'tab-on' : ''" @click="status = t.key">
        <i class="fa-solid" :class="t.icon" /> {{ t.label }}
      </button>
    </div>

    <div v-if="pending" class="card p-10 text-center text-slate-400">
      <UiSpinner /> <span class="ml-2 text-sm">Đang tải khiếu nại…</span>
    </div>

    <UiEmpty v-else-if="!items.length" icon="fa-flag" title="Không có khiếu nại"
      desc="Chưa có khiếu nại nào khớp với bộ lọc hiện tại." />

    <div v-else class="space-y-3">
      <article v-for="r in items" :key="r.id" class="card p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge border" :class="st(r.status).cls">
                <i class="fa-solid mr-1" :class="st(r.status).icon" />{{ st(r.status).label }}
              </span>
              <span class="badge bg-red-50 text-red-700 border border-red-200">
                <i class="fa-solid fa-triangle-exclamation mr-1" />{{ r.reason }}
              </span>
              <span class="text-xs text-slate-400">{{ timeAgo(r.created_at) }}</span>
            </div>

            <h3 class="font-bold text-slate-800 mt-2">
              <NuxtLink v-if="r.document_slug" :to="`/tai-lieu/${r.document_slug}`" class="link">
                {{ r.document_title || 'Tài liệu #' + r.document_id }}
              </NuxtLink>
              <span v-else>{{ r.document_title || 'Tài liệu #' + r.document_id }}</span>
            </h3>

            <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">{{ r.detail }}</p>

            <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
              <span class="flex items-center gap-1.5">
                <UiAvatar :name="r.user_name" :size="22" />
                {{ r.user_name || 'Người dùng #' + r.user_id }}
              </span>
              <span><i class="fa-regular fa-clock mr-1" />{{ dateTime(r.created_at) }}</span>
            </div>

            <div v-if="r.admin_note" class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div class="text-xs font-semibold text-slate-500 mb-1">
                <i class="fa-solid fa-user-shield mr-1" />Ghi chú của quản trị viên
                <span v-if="r.resolved_at" class="font-normal text-slate-400">· {{ dateTime(r.resolved_at) }}</span>
              </div>
              <p class="text-sm text-slate-700">{{ r.admin_note }}</p>
            </div>
          </div>

          <div class="flex sm:flex-col gap-2 shrink-0">
            <template v-if="r.status === 'open'">
              <button class="btn btn-primary btn-sm whitespace-nowrap" :disabled="busy" @click="openAction(r, 'resolved')">
                <i class="fa-solid fa-check" /> Giải quyết
              </button>
              <button class="btn btn-outline btn-sm whitespace-nowrap" :disabled="busy" @click="openAction(r, 'rejected')">
                <i class="fa-solid fa-xmark" /> Từ chối
              </button>
            </template>
            <button v-else class="btn btn-ghost btn-sm whitespace-nowrap" :disabled="busy" @click="reopen(r)">
              <i class="fa-solid fa-rotate-left" /> Mở lại
            </button>
          </div>
        </div>
      </article>
    </div>

    <UiPagination :page="page" :total-pages="totalPages" @change="(p:number) => (page = p)" />

    <!-- Action modal -->
    <UiModal v-model="showAction" :title="nextStatus === 'resolved' ? 'Giải quyết khiếu nại' : 'Từ chối khiếu nại'">
      <div v-if="target" class="space-y-4">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-xs text-slate-500">Khiếu nại về</div>
          <div class="font-semibold text-slate-800 mt-0.5">{{ target.document_title || 'Tài liệu #' + target.document_id }}</div>
          <div class="text-sm text-slate-600 mt-1">Lý do: <strong>{{ target.reason }}</strong></div>
        </div>

        <div>
          <label class="label">Chọn nhanh ghi chú</label>
          <div class="space-y-1.5">
            <button v-for="p in PRESETS[nextStatus]" :key="p" type="button" class="ropt w-full text-left"
              :class="note === p ? 'ropt-on' : ''" @click="note = p">
              {{ p }}
            </button>
          </div>
        </div>

        <div>
          <label class="label">Ghi chú xử lý <span class="text-red-500">*</span></label>
          <textarea v-model="note" rows="3" class="input" maxlength="500"
            placeholder="Nhập nội dung phản hồi gửi tới người khiếu nại…" />
          <div class="text-xs text-slate-400 mt-1 text-right">{{ note.length }}/500</div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-outline btn-sm" :disabled="busy" @click="showAction = false">Huỷ</button>
        <button class="btn btn-sm" :class="nextStatus === 'resolved' ? 'btn-primary' : 'btn-danger'" :disabled="busy" @click="submit">
          <i v-if="busy" class="fa-solid fa-spinner fa-spin" />
          {{ nextStatus === 'resolved' ? 'Xác nhận giải quyết' : 'Xác nhận từ chối' }}
        </button>
      </template>
    </UiModal>
  </div>
</template>

<style scoped>
.tab { @apply px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:border-primary-900 hover:text-primary-900 transition flex items-center gap-1.5; }
.tab-on { @apply bg-primary-900 border-primary-900 text-white hover:text-white; }
.ropt { @apply px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-primary-900 transition; }
.ropt-on { @apply border-primary-900 bg-primary-50 text-primary-900 font-medium; }
</style>
