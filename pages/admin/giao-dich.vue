<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { money, num, date } = useFormat()
const { get, orderPill } = useSubjects()

const page = ref(1)
const q = ref('')
const filter = ref('all')
const method = ref('')

const query = computed(() => {
  const base: Record<string, any> = { page: page.value, limit: 15, q: q.value || undefined }
  if (filter.value !== 'all') base.status = filter.value
  if (method.value) base.method = method.value
  return base
})

const { data, pending, refresh } = await useFetch<any>('/api/admin/orders', { query })

const counts = computed(() => data.value?.counts || {})
const rows = computed<any[]>(() => data.value?.items || [])

const TABS = [
  { key: 'all', label: 'Tất cả', c: 'all' },
  { key: 'paid', label: 'Đã thanh toán', c: 'paid' },
  { key: 'pending', label: 'Chờ thanh toán', c: 'pending' },
  { key: 'failed', label: 'Thất bại', c: 'failed' }
]

function methodPill(m: string) {
  return m === 'vnpay' ? 'pill-blue' : 'pill-slate'
}

function methodLabel(m: string) {
  return m === 'vnpay' ? 'VNPay' : m === 'wallet' ? 'Ví MapDocs' : String(m || '—')
}

watch([filter, method], () => {
  page.value = 1
})

useHead({ title: 'Giao dịch - MapDocs Admin' })
</script>

<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Giao dịch</span>
    </nav>
    <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-bold text-mdk-text font-ui tracking-tight">Giao dịch & đơn hàng</h1>
        <p class="mt-1 text-[13px] text-mdk-mute">{{ num(counts.all || 0) }} đơn hàng trong hệ thống</p>
      </div>
      <button class="btn-outline btn-sm" :disabled="pending" @click="refresh()">
        <AppIcon name="solar:refresh-linear" size="15" /> Làm mới
      </button>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-3">
      <DashboardStatCard label="Tổng GMV" :value="money(counts.gmv || 0)" icon="solar:dollar-minimalistic-bold-duotone" tone="blue" :index="0" :hint="`${num(counts.paid || 0)} đơn hoàn tất`" />
      <DashboardStatCard label="Hoa hồng thu được" :value="money(counts.commission || 0)" icon="solar:sale-square-bold-duotone" tone="orange" :index="1" hint="15% mỗi giao dịch" />
      <DashboardStatCard label="Đơn completed" :value="num(counts.paid || 0)" icon="solar:cart-check-bold-duotone" tone="green" :index="2" :hint="`${num(counts.pending || 0)} chờ · ${num(counts.failed || 0)} lỗi`" />
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
          <input v-model="q" type="search" placeholder="Tìm theo mã đơn..." class="input h-9 pl-9 text-[13px]" @keyup.enter="page = 1; refresh()" />
        </div>
        <select v-model="method" class="input h-9 w-auto text-[13px]">
          <option value="">Tất cả phương thức</option>
          <option value="wallet">Ví MapDocs</option>
          <option value="vnpay">VNPay</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Người mua</th>
              <th>Tài liệu</th>
              <th>Người bán</th>
              <th class="text-right">Số tiền</th>
              <th class="text-right">Hoa hồng</th>
              <th class="text-right">Thực nhận</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in rows" :key="o.id">
              <td class="whitespace-nowrap">
                <code class="text-[12px] font-mono text-primary-300">{{ o.code }}</code>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <UiAvatar :name="o.buyer?.name" :src="o.buyer?.avatar" :size="26" />
                  <span class="text-[12.5px] text-mdk-sub truncate max-w-[120px]">{{ o.buyer?.name || '—' }}</span>
                </div>
              </td>
              <td class="max-w-[240px]">
                <NuxtLink v-if="o.document" :to="`/tai-lieu/${o.document.slug}`" class="block text-[13px] text-mdk-text hover:text-primary-300 line-clamp-1">
                  {{ o.document.title }}
                </NuxtLink>
                <span v-else class="text-[13px] text-mdk-mute">Tài liệu đã xoá</span>
                <span v-if="o.document" class="text-[11.5px] text-mdk-mute">{{ get(o.document.subject).name }}</span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <UiAvatar :name="o.seller?.name" :src="o.seller?.avatar" :size="26" />
                  <span class="text-[12.5px] text-mdk-sub truncate max-w-[120px]">{{ o.seller?.name || '—' }}</span>
                </div>
              </td>
              <td class="text-right text-[13px] font-medium text-mdk-text tabular-nums whitespace-nowrap">{{ money(o.amount || 0) }}</td>
              <td class="text-right text-[13px] text-accent-400 tabular-nums whitespace-nowrap">{{ money(o.commission || 0) }}</td>
              <td class="text-right text-[13px] text-emerald-400 tabular-nums whitespace-nowrap">{{ money(o.seller_amount || 0) }}</td>
              <td><span :class="methodPill(o.method)" class="text-[11px]">{{ methodLabel(o.method) }}</span></td>
              <td><span :class="orderPill(o.status).cls">{{ orderPill(o.status).label }}</span></td>
              <td class="text-[12.5px] text-mdk-mute whitespace-nowrap">{{ date(o.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiEmpty v-if="!pending && !rows.length" compact icon="solar:cart-cross-bold-duotone" title="Không có giao dịch nào" description="Thử đổi bộ lọc trạng thái hoặc phương thức thanh toán." />
    </div>

    <div v-if="(data?.pages || 1) > 1" class="mt-6 flex items-center justify-center gap-2">
      <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
      <span class="text-[13px] text-mdk-sub px-2">{{ page }} / {{ data?.pages }}</span>
      <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
    </div>
  </div>
</template>
