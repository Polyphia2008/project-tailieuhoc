<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { money, num, ago, dateTime } = useFormat()
const { get, statusPill, orderPill, txLabel } = useSubjects()
const page = ref(1); const q = ref(''); const filter = ref('')
const { data, pending, refresh } = await useFetch<any>('/api/admin/orders', { query: computed(() => ({ page: page.value, limit: 15, q: q.value || undefined, status: filter || undefined })) })
const sel = ref<string[]>([])
function toggle(id: string) { sel.value = sel.value.includes(id) ? sel.value.filter(x => x !== id) : [...sel.value, id] }
async function act(action: string, extra: any = {}) {
  if (!sel.value.length && !extra.id) return toast.error('Vui lòng chọn ít nhất một dòng')
  try { const r = await $fetch<any>('/api/admin/orders', { method: 'POST', body: { action, ids: sel.value, ...extra } }); sel.value = []; await refresh(); toast.success(`Đã xử lý ${r.affected ?? 1} bản ghi`) }
  catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') }
}
watch(filter, () => { page.value = 1 })
useHead({ title: 'Giao dịch - MapDocs Admin' })
</script>
<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Giao dịch</span></nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Giao dịch</h1>
    <p class="mt-1 text-[13px] text-mdk-mute">Tổng {{ data?.total || 0 }} bản ghi</p>

    <div class="mt-6 card overflow-hidden">
      <div class="px-4 py-3 border-b border-mdk-line flex flex-wrap items-center gap-2">
        <div class="relative flex-1 min-w-[180px] max-w-[280px]">
          <AppIcon name="solar:magnifer-linear" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="q" type="search" placeholder="Tìm kiếm..." class="input h-9 pl-9 text-[13px]" @keyup.enter="refresh()" />
        </div>
        <div v-if="sel.length" class="flex items-center gap-2 ml-auto">
          <span class="text-[12px] text-mdk-sub">Đã chọn {{ sel.length }}</span>
          <button class="btn-primary btn-sm" @click="act('approve')">Duyệt</button>
          <button class="btn-outline btn-sm" @click="act('reject', { reason: 'Không đạt yêu cầu kiểm duyệt' })">Từ chối</button>
          <button class="btn-danger btn-sm" @click="act('delete')">Xoá</button>
        </div>
      </div>
      <div class="overflow-x-auto"><table class="tbl">
        <thead><tr><th class="w-9"></th><th>Nội dung</th><th>Thông tin</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
        <tbody><tr v-for="it in data?.items || []" :key="it.id">
          <td><input type="checkbox" :checked="sel.includes(it.id)" class="rounded border-mdk-line2 bg-mdk-soft text-primary-600" @change="toggle(it.id)" /></td>
          <td class="max-w-[340px] text-[13px] text-mdk-text"><span class="line-clamp-1">{{ it.title || it.name || it.document?.title || it.code || it.reason || it.note || it.id }}</span>
            <span v-if="it.email || it.seller?.name || it.user?.name" class="block text-[11.5px] text-mdk-mute">{{ it.email || it.seller?.name || it.user?.name }}</span></td>
          <td class="text-[13px] tabular-nums">{{ it.amount !== undefined ? money(it.amount) : it.price !== undefined ? (it.price ? money(it.price) : 'Miễn phí') : it.balance !== undefined ? money(it.balance) : it.document_count !== undefined ? num(it.document_count) + ' tài liệu' : '—' }}</td>
          <td><span v-if="it.status" :class="statusPill(it.status).cls">{{ statusPill(it.status).label }}</span>
            <span v-else-if="it.blocked !== undefined" :class="it.blocked ? 'pill-red' : 'pill-green'">{{ it.blocked ? 'Đã khoá' : 'Hoạt động' }}</span>
            <span v-else-if="it.published !== undefined" :class="it.published ? 'pill-green' : 'pill-slate'">{{ it.published ? 'Đã xuất bản' : 'Bản nháp' }}</span>
            <span v-else class="pill-slate">—</span></td>
          <td class="text-[12.5px] text-mdk-mute whitespace-nowrap">{{ ago(it.created_at) }}</td>
        </tr></tbody>
      </table></div>
      <UiEmpty v-if="!pending && !data?.items?.length" compact title="Chưa có dữ liệu" />
    </div>
    <div v-if="(data?.pages || 1) > 1" class="mt-6 flex items-center justify-center gap-2">
      <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
      <span class="text-[13px] text-mdk-sub px-2">{{ page }} / {{ data?.pages }}</span>
      <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
    </div>
  </div>
</template>
