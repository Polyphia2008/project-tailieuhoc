<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { money, num, compact, date, ago } = useFormat()
const { subjects, grades, get, statusPill, fileIcon } = useSubjects()

const page = ref(1)
const q = ref('')
const filter = ref('all')
const subject = ref('')
const grade = ref('')

const query = computed(() => {
  const base: Record<string, any> = { page: page.value, limit: 15, q: q.value || undefined }
  if (filter.value === 'featured') base.featured = true
  else if (filter.value !== 'all') base.status = filter.value
  if (subject.value) base.subject = subject.value
  if (grade.value) base.grade = grade.value
  return base
})

const { data, pending, refresh } = await useFetch<any>('/api/admin/documents', { query })

const counts = computed(() => data.value?.counts || {})
const rows = computed<any[]>(() => data.value?.items || [])

const TABS = [
  { key: 'all', label: 'Tất cả', c: 'all' },
  { key: 'pending', label: 'Chờ duyệt', c: 'pending' },
  { key: 'approved', label: 'Đã duyệt', c: 'approved' },
  { key: 'rejected', label: 'Từ chối', c: 'rejected' },
  { key: 'featured', label: 'Nổi bật', c: 'featured' }
]

const sel = ref<string[]>([])
const busy = ref(false)

const allChecked = computed(() => rows.value.length > 0 && rows.value.every((r) => sel.value.includes(r.id)))

function toggle(id: string) {
  sel.value = sel.value.includes(id) ? sel.value.filter((x) => x !== id) : [...sel.value, id]
}

function toggleAll() {
  sel.value = allChecked.value ? [] : rows.value.map((r) => r.id)
}

async function act(action: string, ids: string[], extra: Record<string, any> = {}) {
  if (!ids.length) {
    toast.error('Vui lòng chọn ít nhất một tài liệu')
    return
  }
  busy.value = true
  try {
    const r = await $fetch<any>('/api/admin/documents', { method: 'POST', body: { action, ids, ...extra } })
    sel.value = []
    await refresh()
    toast.success(`Đã xử lý ${r.affected ?? ids.length} tài liệu`)
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thực hiện được hành động')
  } finally {
    busy.value = false
  }
}

const QUICK_REASONS = [
  'Nội dung vi phạm bản quyền',
  'File bị lỗi hoặc không mở được',
  'Chất lượng scan quá thấp, không đọc được',
  'Mô tả không khớp với nội dung tài liệu',
  'Giá bán không hợp lý so với nội dung',
  'Tài liệu trùng lặp với tài liệu đã có'
]

const rejectOpen = ref(false)
const rejectIds = ref<string[]>([])
const reason = ref('')

function openReject(ids: string[]) {
  if (!ids.length) {
    toast.error('Vui lòng chọn ít nhất một tài liệu')
    return
  }
  rejectIds.value = ids
  reason.value = ''
  rejectOpen.value = true
}

async function submitReject() {
  if (!reason.value.trim()) {
    toast.error('Vui lòng nhập lý do từ chối')
    return
  }
  await act('reject', rejectIds.value, { reason: reason.value.trim() })
  rejectOpen.value = false
}

const delOpen = ref(false)
const delIds = ref<string[]>([])

function openDelete(ids: string[]) {
  if (!ids.length) {
    toast.error('Vui lòng chọn ít nhất một tài liệu')
    return
  }
  delIds.value = ids
  delOpen.value = true
}

async function submitDelete() {
  await act('delete', delIds.value)
  delOpen.value = false
}

watch([filter, subject, grade], () => {
  page.value = 1
  sel.value = []
})

useHead({ title: 'Tài liệu - MapDocs Admin' })
</script>

<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Tài liệu</span>
    </nav>
    <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-bold text-mdk-text font-ui tracking-tight">Quản lý tài liệu</h1>
        <p class="mt-1 text-[13px] text-mdk-mute">
          Tổng {{ num(counts.all || 0) }} tài liệu · {{ num(counts.pending || 0) }} chờ duyệt · {{ num(counts.featured || 0) }} nổi bật
        </p>
      </div>
      <button class="btn-outline btn-sm" :disabled="pending" @click="refresh()">
        <AppIcon name="solar:refresh-linear" size="15" /> Làm mới
      </button>
    </div>

    <div class="mt-5 tab-row no-scrollbar">
      <button v-for="t in TABS" :key="t.key" class="tab whitespace-nowrap" :class="filter === t.key ? 'tab-on' : ''" @click="filter = t.key">
        {{ t.label }} <span class="text-xs opacity-70">({{ counts[t.c] || 0 }})</span>
      </button>
    </div>

    <div class="mt-4 card overflow-hidden">
      <div class="px-4 py-3 border-b border-mdk-line flex flex-wrap items-center gap-2">
        <div class="relative flex-1 min-w-[180px] max-w-[280px]">
          <AppIcon name="solar:magnifer-line-duotone" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="q" type="search" placeholder="Tìm theo tiêu đề, tag..." class="input h-9 pl-9 text-[13px]" @keyup.enter="page = 1; refresh()" />
        </div>
        <select v-model="subject" class="input h-9 w-auto text-[13px]">
          <option value="">Tất cả môn</option>
          <option v-for="s in subjects" :key="s.key" :value="s.key">{{ s.name }}</option>
        </select>
        <select v-model="grade" class="input h-9 w-auto text-[13px]">
          <option value="">Tất cả lớp</option>
          <option v-for="g in grades" :key="g" :value="g">Lớp {{ g }}</option>
        </select>
      </div>

      <div v-if="sel.length" class="px-4 py-2.5 border-b border-mdk-line bg-primary-500/10 flex flex-wrap items-center gap-2">
        <span class="text-[12.5px] font-medium text-primary-300">Đã chọn {{ sel.length }} tài liệu</span>
        <div class="ml-auto flex items-center gap-2">
          <button class="btn-primary btn-sm" :disabled="busy" @click="act('approve', sel)">
            <AppIcon name="solar:check-circle-bold" size="14" /> Duyệt
          </button>
          <button class="btn-outline btn-sm" :disabled="busy" @click="openReject(sel)">
            <AppIcon name="solar:close-circle-bold" size="14" /> Từ chối
          </button>
          <button class="btn-outline btn-sm" :disabled="busy" @click="act('feature', sel)">
            <AppIcon name="solar:star-bold" size="14" /> Nổi bật
          </button>
          <button class="btn-danger btn-sm" :disabled="busy" @click="openDelete(sel)">
            <AppIcon name="solar:trash-bin-trash-bold" size="14" /> Xoá
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th class="w-9">
                <input type="checkbox" :checked="allChecked" class="rounded border-mdk-line2 bg-mdk-soft text-primary-600" @change="toggleAll" />
              </th>
              <th>Tài liệu</th>
              <th>Người bán</th>
              <th>Môn</th>
              <th>Lớp</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th class="text-right">Đã bán</th>
              <th class="text-right">Lượt xem</th>
              <th class="text-right">Đánh giá</th>
              <th>Ngày đăng</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in rows" :key="d.id">
              <td>
                <input type="checkbox" :checked="sel.includes(d.id)" class="rounded border-mdk-line2 bg-mdk-soft text-primary-600" @change="toggle(d.id)" />
              </td>
              <td class="max-w-[280px]">
                <div class="flex items-center gap-2.5">
                  <span
                    class="shrink-0 w-8 h-10 rounded-md grid place-items-center text-white text-[13px]"
                    :style="{ background: `linear-gradient(140deg, ${get(d.subject).from}, ${get(d.subject).to})` }"
                  >
                    <AppIcon :name="fileIcon(d.file_type)" size="15" />
                  </span>
                  <div class="min-w-0">
                    <NuxtLink :to="`/tai-lieu/${d.slug}`" class="block text-[13px] font-medium text-mdk-text hover:text-primary-300 line-clamp-1">
                      {{ d.title }}
                    </NuxtLink>
                    <span class="text-[11.5px] text-mdk-mute">
                      {{ (d.file_type || '').toUpperCase() }} · {{ num(d.pages || 0) }} trang
                      <span v-if="d.featured" class="text-amber-400"> · Nổi bật</span>
                    </span>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <UiAvatar :name="d.seller?.name" :src="d.seller?.avatar" :size="26" />
                  <span class="text-[12.5px] text-mdk-sub truncate max-w-[130px]">{{ d.seller?.name || '—' }}</span>
                </div>
              </td>
              <td><span class="pill-slate text-[11px]">{{ get(d.subject).name }}</span></td>
              <td class="text-[13px] text-mdk-sub tabular-nums">{{ d.grade || '—' }}</td>
              <td class="text-[13px] tabular-nums whitespace-nowrap">
                <span v-if="d.is_free || !d.price" class="pill-green text-[11px]">Miễn phí</span>
                <span v-else class="text-mdk-text font-medium">{{ money(d.price) }}</span>
              </td>
              <td>
                <span :class="statusPill(d.status).cls">{{ statusPill(d.status).label }}</span>
                <span v-if="d.status === 'rejected' && d.reject_reason" class="block mt-1 text-[11px] text-mdk-mute line-clamp-1 max-w-[160px]">
                  {{ d.reject_reason }}
                </span>
              </td>
              <td class="text-right text-[13px] text-mdk-sub tabular-nums">{{ num(d.sold_count || 0) }}</td>
              <td class="text-right text-[13px] text-mdk-sub tabular-nums">{{ compact(d.view_count || 0) }}</td>
              <td class="text-right text-[13px] text-mdk-sub tabular-nums whitespace-nowrap">
                {{ d.rating_avg ? `${d.rating_avg} (${d.rating_count || 0})` : '—' }}
              </td>
              <td class="text-[12.5px] text-mdk-mute whitespace-nowrap">{{ date(d.created_at) }}</td>
              <td>
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="d.status !== 'approved'"
                    class="w-7 h-7 grid place-items-center rounded-md text-emerald-400 hover:bg-emerald-500/15"
                    title="Duyệt"
                    :disabled="busy"
                    @click="act('approve', [d.id])"
                  >
                    <AppIcon name="solar:check-circle-bold" size="17" />
                  </button>
                  <button
                    v-if="d.status !== 'rejected'"
                    class="w-7 h-7 grid place-items-center rounded-md text-amber-400 hover:bg-amber-500/15"
                    title="Từ chối"
                    :disabled="busy"
                    @click="openReject([d.id])"
                  >
                    <AppIcon name="solar:close-circle-bold" size="17" />
                  </button>
                  <button
                    class="w-7 h-7 grid place-items-center rounded-md hover:bg-mdk-line"
                    :class="d.featured ? 'text-amber-400' : 'text-mdk-mute'"
                    :title="d.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'"
                    :disabled="busy"
                    @click="act(d.featured ? 'unfeature' : 'feature', [d.id])"
                  >
                    <AppIcon name="solar:star-bold" size="16" />
                  </button>
                  <button
                    class="w-7 h-7 grid place-items-center rounded-md text-red-400 hover:bg-red-500/15"
                    title="Xoá"
                    :disabled="busy"
                    @click="openDelete([d.id])"
                  >
                    <AppIcon name="solar:trash-bin-trash-bold" size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiEmpty v-if="!pending && !rows.length" compact icon="solar:documents-bold-duotone" title="Không có tài liệu nào" description="Thử đổi bộ lọc hoặc từ khoá tìm kiếm khác." />
    </div>

    <div v-if="(data?.pages || 1) > 1" class="mt-6 flex items-center justify-center gap-2">
      <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
      <span class="text-[13px] text-mdk-sub px-2">{{ page }} / {{ data?.pages }}</span>
      <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
    </div>

    <UiDialog v-model="rejectOpen" title="Từ chối tài liệu" :description="`Lý do sẽ được gửi tới người bán qua thông báo (${rejectIds.length} tài liệu).`">
      <div class="space-y-3">
        <div>
          <p class="text-[12px] font-semibold text-mdk-mute uppercase tracking-wider">Lý do nhanh</p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="r in QUICK_REASONS"
              :key="r"
              class="text-[12px] px-2.5 py-1.5 rounded-lg border transition"
              :class="reason === r ? 'border-primary-500 bg-primary-500/15 text-primary-200' : 'border-mdk-line text-mdk-sub hover:border-mdk-line2'"
              @click="reason = r"
            >
              {{ r }}
            </button>
          </div>
        </div>
        <div>
          <label class="label">Lý do chi tiết</label>
          <textarea v-model="reason" rows="3" class="textarea" placeholder="Nhập lý do từ chối..." />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="rejectOpen = false">Huỷ</button>
        <button class="btn-danger btn-sm" :disabled="busy" @click="submitReject">
          <UiSpinner v-if="busy" :size="14" /> Xác nhận từ chối
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="delOpen" title="Xoá tài liệu" :description="`Bạn sắp xoá ${delIds.length} tài liệu. Hành động này không thể hoàn tác.`" width="max-w-md">
      <p class="text-[13px] text-mdk-sub leading-relaxed">
        Toàn bộ dữ liệu liên quan (đánh giá, lượt xem) sẽ không còn hiển thị. Đơn hàng đã hoàn tất vẫn được giữ lại trong lịch sử giao dịch.
      </p>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn-danger btn-sm" :disabled="busy" @click="submitDelete">
          <UiSpinner v-if="busy" :size="14" /> Xoá vĩnh viễn
        </button>
      </template>
    </UiDialog>
  </div>
</template>
