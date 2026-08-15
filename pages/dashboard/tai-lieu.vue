<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Tài liệu của tôi - MapDocs' })

const ui = useUiStore()
const { currency, number, date } = useFormat()
const { meta } = useSubjects()

const status = ref<'all' | 'approved' | 'pending' | 'rejected'>('all')
const page = ref(1)

const { data, pending, refresh } = await useAsyncData('my-docs',
  () => $fetch<any>('/api/user/documents', { query: { status: status.value, page: page.value, limit: 10 } }),
  { watch: [status, page] })

watch(status, () => (page.value = 1))

const tabs = computed(() => [
  { key: 'all', label: 'Tất cả', count: data.value?.data?.counts?.all ?? 0 },
  { key: 'approved', label: 'Đã duyệt', count: data.value?.data?.counts?.approved ?? 0 },
  { key: 'pending', label: 'Chờ duyệt', count: data.value?.data?.counts?.pending ?? 0 },
  { key: 'rejected', label: 'Bị từ chối', count: data.value?.data?.counts?.rejected ?? 0 }
])

const statusMeta: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700' },
  pending: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700' },
  rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-700' }
}

// Modal sửa
const editOpen = ref(false)
const saving = ref(false)
const form = reactive({ id: '', title: '', description: '', price: 0, is_free: false })
function openEdit(d: any) {
  Object.assign(form, { id: d.id, title: d.title, description: d.description, price: d.price, is_free: d.is_free })
  editOpen.value = true
}
async function saveEdit() {
  if (form.title.trim().length < 10) return ui.error('Tiêu đề phải có ít nhất 10 ký tự')
  if (form.description.trim().length < 30) return ui.error('Mô tả phải có ít nhất 30 ký tự')
  saving.value = true
  try {
    const res: any = await $fetch(`/api/documents/${form.id}`, {
      method: 'PUT',
      body: { title: form.title, description: form.description, price: form.is_free ? 0 : form.price, is_free: form.is_free }
    })
    ui.success(res.message || 'Đã cập nhật tài liệu')
    editOpen.value = false
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể cập nhật tài liệu')
  } finally { saving.value = false }
}

// Xoá
const delOpen = ref(false)
const target = ref<any>(null)
const deleting = ref(false)
function askDelete(d: any) { target.value = d; delOpen.value = true }
async function confirmDelete() {
  deleting.value = true
  try {
    const res: any = await $fetch(`/api/documents/${target.value.id}`, { method: 'DELETE' })
    ui.success(res.message || 'Đã xoá tài liệu')
    delOpen.value = false
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể xoá tài liệu')
  } finally { deleting.value = false }
}
</script>

<template>
  <section id="my-documents-page">
    <header class="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800"><i class="fa-solid fa-folder-open text-primary-900 mr-2" />Tài liệu của tôi</h1>
        <p class="text-slate-500 text-sm mt-1">Quản lý các tài liệu bạn đã đăng bán trên MapDocs.</p>
      </div>
      <NuxtLink to="/dashboard/dang-ban" class="btn btn-accent btn-sm"><i class="fa-solid fa-plus mr-2" />Đăng tài liệu mới</NuxtLink>
    </header>

    <div class="flex flex-wrap gap-2 mb-5">
      <button v-for="t in tabs" :key="t.key" class="tab" :class="status === t.key ? 'tab-on' : ''" @click="status = t.key as any">
        {{ t.label }} <span class="ml-1 opacity-70">({{ t.count }})</span>
      </button>
    </div>

    <UiSpinner v-if="pending" :size="34" label="Đang tải tài liệu..." />

    <template v-else-if="data?.data">
      <UiEmpty v-if="!data.data.items.length" icon="fa-folder-open" title="Chưa có tài liệu ở mục này"
        desc="Đăng bán tài liệu đầu tiên của bạn và nhận 85% doanh thu mỗi lượt bán.">
        <NuxtLink to="/dashboard/dang-ban" class="btn btn-accent"><i class="fa-solid fa-cloud-arrow-up mr-2" />Đăng bán ngay</NuxtLink>
      </UiEmpty>

      <div v-else class="card overflow-x-auto">
        <table class="w-full text-sm min-w-[760px]">
          <thead><tr class="text-left border-b border-slate-100 bg-slate-50/60">
            <th class="table-th">Tài liệu</th><th class="table-th">Giá</th><th class="table-th">Lượt xem</th>
            <th class="table-th">Lượt bán</th><th class="table-th">Doanh thu</th>
            <th class="table-th">Trạng thái</th><th class="table-th text-right">Thao tác</th>
          </tr></thead>
          <tbody>
            <tr v-for="d in data.data.items" :key="d.id" class="border-b border-slate-50 hover:bg-slate-50/60">
              <td class="table-td">
                <div class="flex items-center gap-3">
                  <span class="w-9 h-9 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0" :class="meta(d.subject).gradient">
                    <i class="fa-solid text-xs" :class="meta(d.subject).icon" />
                  </span>
                  <div class="min-w-0 max-w-xs">
                    <NuxtLink :to="`/tai-lieu/${d.slug}`" class="block font-medium text-slate-800 line-clamp-1 hover:text-primary-900">{{ d.title }}</NuxtLink>
                    <span class="text-xs text-slate-400">{{ meta(d.subject).label }} · Lớp {{ d.grade }} · {{ date(d.created_at) }}</span>
                    <p v-if="d.status === 'rejected' && d.reject_reason" class="text-xs text-red-600 mt-0.5 line-clamp-1">
                      <i class="fa-solid fa-circle-exclamation mr-1" />{{ d.reject_reason }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="table-td font-semibold" :class="d.is_free ? 'text-green-600' : 'text-accent-500'">{{ currency(d.price) }}</td>
              <td class="table-td">{{ number(d.view_count) }}</td>
              <td class="table-td">{{ number(d.sold_count) }}</td>
              <td class="table-td font-semibold text-primary-900">{{ currency(Math.round((d.sold_count || 0) * d.price * 0.85)) }}</td>
              <td class="table-td"><span class="badge" :class="statusMeta[d.status]?.cls">{{ statusMeta[d.status]?.label }}</span></td>
              <td class="table-td">
                <div class="flex items-center justify-end gap-1.5">
                  <NuxtLink :to="`/tai-lieu/${d.slug}`" class="act" title="Xem"><i class="fa-regular fa-eye" /></NuxtLink>
                  <button class="act" title="Sửa" @click="openEdit(d)"><i class="fa-solid fa-pen" /></button>
                  <button class="act hover:!text-red-600 hover:!border-red-300" title="Xoá" @click="askDelete(d)"><i class="fa-solid fa-trash" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiPagination :page="page" :total-pages="data.data.totalPages" @change="(p:number) => (page = p)" />
    </template>

    <UiModal v-model="editOpen" title="Chỉnh sửa tài liệu">
      <div class="space-y-4">
        <div>
          <label class="label">Tiêu đề</label>
          <input v-model="form.title" type="text" class="input" maxlength="200" />
        </div>
        <div>
          <label class="label">Mô tả</label>
          <textarea v-model="form.description" rows="5" class="input" maxlength="8000" />
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm"><input v-model="form.is_free" type="radio" :value="true" />Miễn phí</label>
          <label class="flex items-center gap-2 text-sm"><input v-model="form.is_free" type="radio" :value="false" />Có phí</label>
        </div>
        <div v-if="!form.is_free">
          <label class="label">Giá bán (đ)</label>
          <input v-model.number="form.price" type="number" min="10000" step="1000" class="input" />
        </div>
        <p class="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
          <i class="fa-solid fa-circle-info mr-1" />Sau khi chỉnh sửa, tài liệu có thể cần được quản trị viên duyệt lại.
        </p>
      </div>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="editOpen = false">Huỷ</button>
        <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveEdit">
          <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-2" />Lưu thay đổi
        </button>
      </template>
    </UiModal>

    <UiModal v-model="delOpen" title="Xác nhận xoá" width="max-w-md">
      <p class="text-sm text-slate-600">
        Bạn có chắc muốn xoá tài liệu <strong class="text-slate-800">{{ target?.title }}</strong>?
        Hành động này không thể hoàn tác.
      </p>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn btn-danger btn-sm" :disabled="deleting" @click="confirmDelete">
          <i v-if="deleting" class="fa-solid fa-spinner fa-spin mr-2" />Xoá tài liệu
        </button>
      </template>
    </UiModal>
  </section>
</template>

<style scoped>
.tab { @apply px-4 py-2 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:border-primary-900 hover:text-primary-900 transition; }
.tab-on { @apply bg-primary-900 border-primary-900 text-white hover:text-white; }
.act { @apply w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-primary-900 hover:border-primary-900 transition grid place-items-center; }
</style>
