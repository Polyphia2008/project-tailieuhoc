<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { num, date, ago } = useFormat()
const { get, statusPill } = useSubjects()

const page = ref(1)
const filter = ref('all')

const query = computed(() => {
  const base: Record<string, any> = { page: page.value, limit: 15 }
  if (filter.value !== 'all') base.status = filter.value
  return base
})

const { data, pending, refresh } = await useFetch<any>('/api/admin/reports', { query })

const counts = computed(() => data.value?.counts || {})
const rows = computed<any[]>(() => data.value?.items || [])

const TABS = [
  { key: 'all', label: 'Tất cả', c: 'all' },
  { key: 'open', label: 'Đang mở', c: 'open' },
  { key: 'resolved', label: 'Đã xử lý', c: 'resolved' },
  { key: 'dismissed', label: 'Từ chối', c: 'dismissed' }
]

function reportPill(status: string) {
  if (status === 'open') return { cls: 'pill-amber', label: 'Đang mở' }
  if (status === 'resolved') return { cls: 'pill-green', label: 'Đã xử lý' }
  if (status === 'dismissed') return { cls: 'pill-slate', label: 'Đã từ chối' }
  return { cls: 'pill-slate', label: String(status || '—') }
}

const busy = ref(false)
const open = ref(false)
const target = ref<any>(null)
const mode = ref<'resolve' | 'dismiss'>('resolve')
const note = ref('')
const rejectDoc = ref(false)

function openAction(r: any, m: 'resolve' | 'dismiss') {
  target.value = r
  mode.value = m
  note.value = r.admin_note || ''
  rejectDoc.value = false
  open.value = true
}

async function submit() {
  busy.value = true
  try {
    await $fetch('/api/admin/reports', {
      method: 'POST',
      body: {
        id: target.value.id,
        action: mode.value,
        note: note.value || undefined,
        reject_document: mode.value === 'resolve' ? rejectDoc.value : false
      }
    })
    await refresh()
    open.value = false
    toast.success(mode.value === 'resolve' ? 'Đã đánh dấu xử lý xong' : 'Đã từ chối khiếu nại')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thực hiện được hành động')
  } finally {
    busy.value = false
  }
}

async function reopen(r: any) {
  busy.value = true
  try {
    await $fetch('/api/admin/reports', { method: 'POST', body: { id: r.id, action: 'reopen' } })
    await refresh()
    toast.success('Đã mở lại khiếu nại')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thực hiện được hành động')
  } finally {
    busy.value = false
  }
}

watch(filter, () => {
  page.value = 1
})

useHead({ title: 'Khiếu nại - MapDocs Admin' })
</script>

<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Khiếu nại</span>
    </nav>
    <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-bold text-mdk-text font-ui tracking-tight">Khiếu nại & báo cáo</h1>
        <p class="mt-1 text-[13px] text-mdk-mute">
          {{ num(counts.all || 0) }} khiếu nại · {{ num(counts.open || 0) }} đang chờ xử lý
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
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tài liệu bị báo cáo</th>
              <th>Người báo cáo</th>
              <th>Lý do</th>
              <th>Chi tiết</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td class="max-w-[220px]">
                <NuxtLink v-if="r.document" :to="`/tai-lieu/${r.document.slug}`" class="block text-[13px] font-medium text-mdk-text hover:text-primary-300 line-clamp-1">
                  {{ r.document.title }}
                </NuxtLink>
                <span v-else class="text-[13px] text-mdk-mute">Tài liệu đã xoá</span>
                <span v-if="r.document" class="mt-0.5 flex items-center gap-1.5">
                  <span class="pill-slate text-[10.5px]">{{ get(r.document.subject).name }}</span>
                  <span :class="statusPill(r.document.status).cls" class="text-[10.5px]">{{ statusPill(r.document.status).label }}</span>
                </span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <UiAvatar :name="r.user?.name" :src="r.user?.avatar" :size="26" />
                  <div class="min-w-0">
                    <p class="text-[12.5px] text-mdk-sub truncate max-w-[120px]">{{ r.user?.name || '—' }}</p>
                    <p class="text-[11px] text-mdk-mute truncate max-w-[120px]">{{ r.user?.email || '' }}</p>
                  </div>
                </div>
              </td>
              <td><span class="pill-red text-[11px]">{{ r.reason }}</span></td>
              <td class="max-w-[280px]">
                <p class="text-[12.5px] text-mdk-sub leading-relaxed line-clamp-2">{{ r.detail }}</p>
                <p v-if="r.admin_note" class="mt-1 text-[11.5px] text-emerald-400 line-clamp-1">Ghi chú: {{ r.admin_note }}</p>
              </td>
              <td><span :class="reportPill(r.status).cls" class="text-[11px]">{{ reportPill(r.status).label }}</span></td>
              <td class="text-[12.5px] text-mdk-mute whitespace-nowrap">
                {{ date(r.created_at) }}
                <span class="block text-[11px]">{{ ago(r.created_at) }}</span>
              </td>
              <td>
                <div class="flex items-center justify-end gap-1">
                  <template v-if="r.status === 'open'">
                    <button class="btn-primary btn-sm" :disabled="busy" @click="openAction(r, 'resolve')">Xử lý</button>
                    <button class="btn-outline btn-sm" :disabled="busy" @click="openAction(r, 'dismiss')">Từ chối</button>
                  </template>
                  <button v-else class="btn-outline btn-sm" :disabled="busy" @click="reopen(r)">Mở lại</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiEmpty v-if="!pending && !rows.length" compact icon="solar:flag-bold-duotone" title="Không có khiếu nại nào" description="Hệ thống chưa ghi nhận báo cáo nào ở trạng thái này." />
    </div>

    <div v-if="(data?.pages || 1) > 1" class="mt-6 flex items-center justify-center gap-2">
      <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
      <span class="text-[13px] text-mdk-sub px-2">{{ page }} / {{ data?.pages }}</span>
      <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
    </div>

    <UiDialog
      v-model="open"
      :title="mode === 'resolve' ? 'Xử lý khiếu nại' : 'Từ chối khiếu nại'"
      :description="target?.reason ? `Lý do báo cáo: ${target.reason}` : ''"
    >
      <div class="space-y-3">
        <div v-if="target" class="rounded-xl border border-mdk-line bg-mdk-soft p-3">
          <p class="text-[12px] font-semibold text-mdk-mute uppercase tracking-wider">Nội dung khiếu nại</p>
          <p class="mt-1.5 text-[13px] text-mdk-sub leading-relaxed">{{ target.detail }}</p>
        </div>
        <div>
          <label class="label">Ghi chú xử lý (gửi tới người báo cáo)</label>
          <textarea v-model="note" rows="3" class="textarea" placeholder="Mô tả cách xử lý..." />
        </div>
        <label v-if="mode === 'resolve'" class="flex items-start gap-2.5 cursor-pointer">
          <input v-model="rejectDoc" type="checkbox" class="mt-0.5 rounded border-mdk-line2 bg-mdk-soft text-primary-600" />
          <span>
            <span class="block text-[13px] font-medium text-mdk-text">Đồng thời từ chối tài liệu bị báo cáo</span>
            <span class="block text-[12px] text-mdk-mute mt-0.5">Tài liệu sẽ chuyển sang trạng thái Từ chối và bị ẩn khỏi trang công khai.</span>
          </span>
        </label>
      </div>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="open = false">Huỷ</button>
        <button :class="mode === 'resolve' ? 'btn-primary btn-sm' : 'btn-danger btn-sm'" :disabled="busy" @click="submit">
          <UiSpinner v-if="busy" :size="14" /> {{ mode === 'resolve' ? 'Xác nhận xử lý' : 'Xác nhận từ chối' }}
        </button>
      </template>
    </UiDialog>
  </div>
</template>
