<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý giao dịch — MapDocs Admin' })

const { currency, number, dateTime } = useFormat()

const page = ref(1)
const status = ref('all')
const q = ref('')
const search = ref('')

const TABS = [
  { key: 'all', label: 'Tất cả', icon: 'fa-list' },
  { key: 'paid', label: 'Đã thanh toán', icon: 'fa-circle-check' },
  { key: 'pending', label: 'Chờ thanh toán', icon: 'fa-clock' },
  { key: 'cancelled', label: 'Đã huỷ', icon: 'fa-circle-xmark' }
]

const { data, pending, refresh } = await useAsyncData(
  'admin-orders',
  () => $fetch<any>('/api/admin/orders', { query: { page: page.value, limit: 15, status: status.value, q: search.value } }),
  { watch: [page, status, search] }
)

const items = computed<any[]>(() => data.value?.data?.items || [])
const summary = computed(() => data.value?.data?.summary || { gmv: 0, commission: 0, count: 0 })
const totalPages = computed(() => data.value?.data?.totalPages || 1)
const total = computed(() => data.value?.data?.total || 0)

let timer: any = null
watch(q, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { search.value = v.trim(); page.value = 1 }, 400)
})
watch(status, () => { page.value = 1 })

const setTab = (k: string) => { status.value = k }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Đã thanh toán', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Đã huỷ', cls: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Đã hoàn tiền', cls: 'bg-slate-100 text-slate-600 border-slate-200' }
}
const st = (s: string) => STATUS_MAP[s] || { label: s, cls: 'bg-slate-100 text-slate-600 border-slate-200' }

const PAY_MAP: Record<string, { label: string; icon: string }> = {
  wallet: { label: 'Ví MapDocs', icon: 'fa-wallet' },
  vnpay: { label: 'VNPay', icon: 'fa-credit-card' },
  momo: { label: 'Momo', icon: 'fa-mobile-screen' },
  stripe: { label: 'Stripe', icon: 'fa-stripe-s' },
  free: { label: 'Miễn phí', icon: 'fa-gift' }
}
const pay = (p: string) => PAY_MAP[p] || { label: p || '—', icon: 'fa-money-bill' }

const detail = ref<any>(null)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Quản lý giao dịch</h2>
        <p class="text-sm text-slate-500 mt-0.5">Theo dõi toàn bộ đơn hàng và doanh thu nền tảng</p>
      </div>
      <button class="btn btn-outline btn-sm" :disabled="pending" @click="refresh()">
        <AppIcon name="fa-rotate" :class="pending ? 'fa-spin' : ''" /> Làm mới
      </button>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="rounded-2xl p-5 text-white bg-gradient-to-br from-primary-900 to-primary-950 shadow-card">
        <div class="flex items-center gap-2 text-white/80 text-sm font-medium">
          <AppIcon name="fa-sack-dollar" /> Tổng GMV
        </div>
        <div class="text-2xl font-extrabold mt-2">{{ currency(summary.gmv) }}</div>
        <div class="text-xs text-white/70 mt-1">Tổng giá trị đơn đã thanh toán</div>
      </div>
      <div class="rounded-2xl p-5 text-white bg-gradient-to-br from-accent-500 to-orange-600 shadow-card">
        <div class="flex items-center gap-2 text-white/80 text-sm font-medium">
          <AppIcon name="fa-percent" /> Hoa hồng nền tảng
        </div>
        <div class="text-2xl font-extrabold mt-2">{{ currency(summary.commission) }}</div>
        <div class="text-xs text-white/70 mt-1">15% mỗi giao dịch thành công</div>
      </div>
      <div class="rounded-2xl p-5 bg-white border border-slate-200 shadow-card">
        <div class="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <AppIcon name="fa-receipt" /> Đơn thành công
        </div>
        <div class="text-2xl font-extrabold mt-2 text-slate-800">{{ number(summary.count) }}</div>
        <div class="text-xs text-slate-500 mt-1">Tổng {{ number(total) }} bản ghi theo bộ lọc</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 space-y-3">
      <div class="flex flex-wrap gap-2">
        <button v-for="t in TABS" :key="t.key" class="tab" :class="status === t.key ? 'tab-on' : ''" @click="setTab(t.key)">
          <AppIcon :name="t.icon" /> {{ t.label }}
        </button>
      </div>
      <div class="relative max-w-md">
        <AppIcon name="fa-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input v-model="q" type="text" class="input pl-9" placeholder="Tìm mã đơn, tên tài liệu, người mua…" >
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="pending" class="p-10 text-center text-slate-400">
        <UiSpinner /> <span class="ml-2 text-sm">Đang tải giao dịch…</span>
      </div>

      <UiEmpty v-else-if="!items.length" icon="fa-receipt" title="Không có giao dịch"
        desc="Chưa có đơn hàng nào khớp với bộ lọc hiện tại." />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[900px]">
          <thead class="bg-slate-50">
            <tr>
              <th class="table-th">Mã đơn</th>
              <th class="table-th">Tài liệu</th>
              <th class="table-th">Người mua</th>
              <th class="table-th text-right">Số tiền</th>
              <th class="table-th text-right">Hoa hồng</th>
              <th class="table-th">Thanh toán</th>
              <th class="table-th">Trạng thái</th>
              <th class="table-th">Thời gian</th>
              <th class="table-th text-center">#</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="o in items" :key="o.code || o.id" class="table-row">
              <td class="table-td font-mono text-xs font-bold text-primary-900">{{ o.code }}</td>
              <td class="table-td max-w-[240px]">
                <NuxtLink v-if="o.document_slug" :to="`/tai-lieu/${o.document_slug}`" class="link line-clamp-2">
                  {{ o.document_title }}
                </NuxtLink>
                <span v-else class="line-clamp-2 text-slate-700">{{ o.document_title || '—' }}</span>
              </td>
              <td class="table-td">
                <div class="flex items-center gap-2">
                  <UiAvatar :name="o.buyer_name" :size="26" />
                  <span class="text-slate-700 truncate max-w-[120px]">{{ o.buyer_name || '—' }}</span>
                </div>
              </td>
              <td class="table-td text-right font-bold text-slate-800">{{ currency(o.amount) }}</td>
              <td class="table-td text-right text-accent-500 font-semibold">{{ currency(o.commission || 0) }}</td>
              <td class="table-td whitespace-nowrap text-slate-600">
                <AppIcon :name="pay(o.payment_method).icon" class="mr-1 text-slate-400" />{{ pay(o.payment_method).label }}
              </td>
              <td class="table-td">
                <span class="badge border" :class="st(o.status).cls">{{ st(o.status).label }}</span>
              </td>
              <td class="table-td text-slate-500 whitespace-nowrap text-xs">{{ dateTime(o.created_at) }}</td>
              <td class="table-td text-center">
                <UiTooltip text="Xem chi tiết">
                  <button class="act" @click="detail = o"><AppIcon name="fa-eye" /></button>
                </UiTooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UiPagination :page="page" :total-pages="totalPages" @change="(p:number) => (page = p)" />

    <!-- Detail modal -->
    <UiModal :model-value="!!detail" title="Chi tiết giao dịch" width="max-w-xl"
      @update:model-value="(v:boolean) => { if (!v) detail = null }">
      <div v-if="detail" class="space-y-3 text-sm">
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50">
          <span class="text-slate-500">Mã đơn hàng</span>
          <span class="font-mono font-bold text-primary-900">{{ detail.code }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl border border-slate-200">
            <div class="text-slate-500 text-xs">Tài liệu</div>
            <div class="font-semibold text-slate-800 mt-1">{{ detail.document_title || '—' }}</div>
          </div>
          <div class="p-3 rounded-xl border border-slate-200">
            <div class="text-slate-500 text-xs">Người mua</div>
            <div class="font-semibold text-slate-800 mt-1">{{ detail.buyer_name || '—' }}</div>
          </div>
          <div class="p-3 rounded-xl border border-slate-200">
            <div class="text-slate-500 text-xs">Tổng tiền</div>
            <div class="font-bold text-slate-800 mt-1">{{ currency(detail.amount) }}</div>
          </div>
          <div class="p-3 rounded-xl border border-slate-200">
            <div class="text-slate-500 text-xs">Hoa hồng nền tảng</div>
            <div class="font-bold text-accent-500 mt-1">{{ currency(detail.commission || 0) }}</div>
          </div>
          <div class="p-3 rounded-xl border border-slate-200">
            <div class="text-slate-500 text-xs">Người bán nhận</div>
            <div class="font-bold text-emerald-600 mt-1">{{ currency(detail.seller_amount || 0) }}</div>
          </div>
          <div class="p-3 rounded-xl border border-slate-200">
            <div class="text-slate-500 text-xs">Phương thức</div>
            <div class="font-semibold text-slate-800 mt-1">{{ pay(detail.payment_method).label }}</div>
          </div>
        </div>
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50">
          <span class="text-slate-500">Trạng thái</span>
          <span class="badge border" :class="st(detail.status).cls">{{ st(detail.status).label }}</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50">
          <span class="text-slate-500">Thời gian tạo</span>
          <span class="font-medium text-slate-700">{{ dateTime(detail.created_at) }}</span>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="detail = null">Đóng</button>
      </template>
    </UiModal>
  </div>
</template>
