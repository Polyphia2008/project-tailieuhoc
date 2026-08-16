<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý tài liệu - MapDocs' })

const ui = useUiStore()
const { currency, number, date } = useFormat()
const { meta, list } = useSubjects()

const status = ref('all')
const subject = ref('all')
const q = ref('')
const page = ref(1)
const selected = ref<string[]>([])

const { data, pending, refresh } = await useAsyncData('admin-docs',
  () => $fetch<any>('/api/admin/documents', { query: { status: status.value, subject: subject.value, q: q.value, page: page.value, limit: 15 } }),
  { watch: [status, subject, page] })

watch([status, subject, q], () => { page.value = 1; selected.value = [] })
let t: any
watch(q, () => { clearTimeout(t); t = setTimeout(() => refresh(), 400) })

const tabs = [
  { key: 'all', label: 'Tất cả' }, { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' }, { key: 'rejected', label: 'Bị từ chối' }
]
const statusMeta: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700' },
  pending: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700' },
  rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-700' }
}

const items = computed(() => data.value?.data?.items || [])
const allChecked = computed(() => items.value.length > 0 && selected.value.length === items.value.length)
function toggleAll() {
  selected.value = allChecked.value ? [] : items.value.map((d: any) => d.id)
}
function toggle(id: string) {
  const i = selected.value.indexOf(id)
  i >= 0 ? selected.value.splice(i, 1) : selected.value.push(id)
}

const busy = ref(false)
async function act(id: string, action: string, reason?: string) {
  busy.value = true
  try {
    const res: any = await $fetch('/api/admin/documents', { method: 'POST', body: { id, action, reason } })
    ui.success(res.message)
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Thao tác thất bại')
  } finally { busy.value = false }
}

async function bulkApprove() {
  busy.value = true
  try {
    for (const id of selected.value) await $fetch('/api/admin/documents', { method: 'POST', body: { id, action: 'approve' } })
    ui.success(`Đã duyệt ${selected.value.length} tài liệu`)
    selected.value = []
    refresh()
  } catch (e: any) { ui.error(e?.data?.statusMessage || 'Thao tác thất bại') }
  finally { busy.value = false }
}

// Modal từ chối
const rejectOpen = ref(false)
const rejectTarget = ref<any>(null)
const rejectReason = ref('')
const REASONS = ['Nội dung không đạt chất lượng', 'Vi phạm bản quyền', 'Sai môn học / lớp', 'Mô tả không khớp nội dung', 'Giá không hợp lý']
function askReject(d: any) { rejectTarget.value = d; rejectReason.value = REASONS[0]; rejectOpen.value = true }
async function confirmReject() {
  if (!rejectReason.value.trim()) return ui.error('Vui lòng nhập lý do từ chối')
  await act(rejectTarget.value.id, 'reject', rejectReason.value)
  rejectOpen.value = false
}

// Modal xoá
const delOpen = ref(false)
const delTarget = ref<any>(null)
function askDelete(d: any) { delTarget.value = d; delOpen.value = true }
async function confirmDelete() { await act(delTarget.value.id, 'delete'); delOpen.value = false }
</script>

<template>
  <section id="admin-documents">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><AppIcon name="fa-file-lines" class="text-primary-900 mr-2" />Quản lý tài liệu</h1>
      <p class="text-slate-500 text-sm mt-1">Duyệt, từ chối, đặt nổi bật hoặc xoá tài liệu trên hệ thống.</p>
    </header>

    <div class="card p-4 mb-5 space-y-3">
      <div class="flex flex-wrap gap-2">
        <button v-for="tb in tabs" :key="tb.key" class="tab" :class="status === tb.key ? 'tab-on' : ''" @click="status = tb.key">{{ tb.label }}</button>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <AppIcon name="fa-magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input v-model="q" type="search" class="input pl-10" placeholder="Tìm theo tiêu đề, mô tả..." />
        </div>
        <select v-model="subject" class="input sm:w-52">
          <option value="all">Tất cả môn học</option>
          <option v-for="sj in list" :key="sj.key" :value="sj.key">{{ sj.label }}</option>
        </select>
      </div>
      <div v-if="selected.length" class="flex items-center gap-3 pt-2 border-t border-slate-100">
        <span class="text-sm text-slate-600">Đã chọn <strong>{{ selected.length }}</strong> tài liệu</span>
        <button class="btn btn-primary btn-sm" :disabled="busy" @click="bulkApprove"><AppIcon name="fa-check" variant="bold" class="mr-2" />Duyệt hàng loạt</button>
        <button class="btn btn-ghost btn-sm" @click="selected = []">Bỏ chọn</button>
      </div>
    </div>

    <UiSpinner v-if="pending" :size="34" label="Đang tải tài liệu..." />

    <template v-else-if="data?.data">
      <UiEmpty v-if="!items.length" icon="fa-file-circle-question" title="Không tìm thấy tài liệu" desc="Thử đổi bộ lọc hoặc từ khoá tìm kiếm." />

      <div v-else class="card overflow-x-auto">
        <table class="w-full text-sm min-w-[900px]">
          <thead><tr class="text-left border-b border-slate-100 bg-slate-50/60">
            <th class="table-th w-10"><input type="checkbox" :checked="allChecked" @change="toggleAll" /></th>
            <th class="table-th">Tài liệu</th><th class="table-th">Người bán</th><th class="table-th">Giá</th>
            <th class="table-th">Bán</th><th class="table-th">Trạng thái</th><th class="table-th text-right">Thao tác</th>
          </tr></thead>
          <tbody>
            <tr v-for="d in items" :key="d.id" class="border-b border-slate-50 hover:bg-slate-50/60">
              <td class="table-td"><input type="checkbox" :checked="selected.includes(d.id)" @change="toggle(d.id)" /></td>
              <td class="table-td">
                <div class="flex items-center gap-3">
                  <span class="w-9 h-9 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0" :class="meta(d.subject).gradient">
                    <AppIcon :name="meta(d.subject).icon" class="text-xs" />
                  </span>
                  <div class="min-w-0 max-w-xs">
                    <NuxtLink :to="`/tai-lieu/${d.slug}`" class="block font-medium text-slate-800 line-clamp-1 hover:text-primary-900">
                      <AppIcon name="fa-fire" variant="bold" class="text-accent-500 mr-1" v-if="d.featured" />{{ d.title }}
                    </NuxtLink>
                    <span class="text-xs text-slate-400">{{ meta(d.subject).label }} · Lớp {{ d.grade }} · {{ date(d.created_at) }}</span>
                  </div>
                </div>
              </td>
              <td class="table-td">
                <div class="flex items-center gap-2">
                  <UiAvatar :name="d.seller?.name" :src="d.seller?.avatar" :size="24" />
                  <span class="text-slate-600 truncate max-w-[120px]">{{ d.seller?.name || '—' }}</span>
                </div>
              </td>
              <td class="table-td font-semibold" :class="d.is_free ? 'text-green-600' : 'text-accent-500'">{{ currency(d.price) }}</td>
              <td class="table-td">{{ number(d.sold_count) }}</td>
              <td class="table-td"><span class="badge" :class="statusMeta[d.status]?.cls">{{ statusMeta[d.status]?.label }}</span></td>
              <td class="table-td">
                <div class="flex items-center justify-end gap-1.5">
                  <button v-if="d.status !== 'approved'" class="act hover:!text-green-600 hover:!border-green-300" title="Duyệt" :disabled="busy" @click="act(d.id, 'approve')"><AppIcon name="fa-check" variant="bold" /></button>
                  <button v-if="d.status !== 'rejected'" class="act hover:!text-amber-600 hover:!border-amber-300" title="Từ chối" :disabled="busy" @click="askReject(d)"><AppIcon name="fa-xmark" /></button>
                  <button class="act" :class="d.featured ? '!text-accent-500 !border-accent-300' : ''" title="Nổi bật" :disabled="busy" @click="act(d.id, 'feature')"><AppIcon name="fa-fire" variant="bold" /></button>
                  <button class="act hover:!text-red-600 hover:!border-red-300" title="Xoá" :disabled="busy" @click="askDelete(d)"><AppIcon name="fa-trash" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiPagination :page="page" :total-pages="data.data.totalPages" @change="(p:number) => (page = p)" />
    </template>

    <UiModal v-model="rejectOpen" title="Từ chối tài liệu" width="max-w-md">
      <p class="text-sm text-slate-600 mb-4">Tài liệu: <strong class="text-slate-800">{{ rejectTarget?.title }}</strong></p>
      <label class="label">Lý do từ chối</label>
      <div class="space-y-2 mb-3">
        <label v-for="r in REASONS" :key="r" class="flex items-center gap-2 text-sm">
          <input v-model="rejectReason" type="radio" :value="r" />{{ r }}
        </label>
      </div>
      <textarea v-model="rejectReason" rows="3" class="input" maxlength="300" placeholder="Hoặc nhập lý do khác..." />
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="rejectOpen = false">Huỷ</button>
        <button class="btn btn-danger btn-sm" :disabled="busy" @click="confirmReject">Từ chối</button>
      </template>
    </UiModal>

    <UiModal v-model="delOpen" title="Xác nhận xoá" width="max-w-md">
      <p class="text-sm text-slate-600">Xoá vĩnh viễn tài liệu <strong class="text-slate-800">{{ delTarget?.title }}</strong>? Hành động này không thể hoàn tác.</p>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn btn-danger btn-sm" :disabled="busy" @click="confirmDelete">Xoá</button>
      </template>
    </UiModal>
  </section>
</template>

<style scoped>
.tab { @apply px-4 py-2 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:border-primary-900 hover:text-primary-900 transition; }
.tab-on { @apply bg-primary-900 border-primary-900 text-white hover:text-white; }
.act { @apply w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-primary-900 hover:border-primary-900 transition grid place-items-center disabled:opacity-40; }
</style>
