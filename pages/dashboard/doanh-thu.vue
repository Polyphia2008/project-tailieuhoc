<script setup lang="ts">
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Ví & doanh thu - MapDocs' })

const auth = useAuthStore()
const ui = useUiStore()
const { currency, dateTime, compact } = useFormat()
const { colors, hexAlpha, baseOptions } = useChartTheme()

const type = ref<'all' | 'sale' | 'purchase' | 'topup' | 'withdraw'>('all')
const page = ref(1)

const { data, pending, refresh } = await useAsyncData('wallet',
  () => $fetch<any>('/api/user/transactions', { query: { type: type.value, page: page.value, limit: 12 } }),
  { watch: [type, page] })

watch(type, () => (page.value = 1))

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'sale', label: 'Bán tài liệu' },
  { key: 'purchase', label: 'Mua tài liệu' },
  { key: 'topup', label: 'Nạp tiền' },
  { key: 'withdraw', label: 'Rút tiền' }
]

const txMeta: Record<string, { label: string; icon: string; cls: string }> = {
  sale: { label: 'Bán tài liệu', icon: 'fa-arrow-trend-up', cls: 'text-green-600 bg-green-50' },
  purchase: { label: 'Mua tài liệu', icon: 'fa-cart-shopping', cls: 'text-red-600 bg-red-50' },
  topup: { label: 'Nạp tiền', icon: 'fa-plus', cls: 'text-primary-900 bg-primary-50' },
  withdraw: { label: 'Rút tiền', icon: 'fa-money-bill-transfer', cls: 'text-amber-600 bg-amber-50' },
  commission: { label: 'Hoa hồng', icon: 'fa-percent', cls: 'text-slate-600 bg-slate-100' }
}

/* ---------- Chart.js ---------- */
const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function renderChart() {
  if (!import.meta.client || !chartEl.value) return
  const rows = data.value?.data?.chart || []
  chart?.destroy()
  chart = new Chart(chartEl.value, {
    type: 'bar',
    data: {
      labels: rows.map((r: any) => r.label),
      datasets: [{
        label: 'Doanh thu bán tài liệu (đ)',
        data: rows.map((r: any) => r.value),
        backgroundColor: hexAlpha(colors.green, 0.62),
        hoverBackgroundColor: colors.green,
        borderColor: colors.green,
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 46
      }]
    },
    options: {
      ...baseOptions({ tickFormat: (v: any) => compact(v), legend: false }),
      plugins: {
        ...baseOptions({ legend: false }).plugins,
        tooltip: {
          ...baseOptions().plugins.tooltip,
          callbacks: { label: (c: any) => ` ${currency(c.parsed.y)}` }
        }
      }
    } as any
  })
}

onMounted(() => {
  Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)
  renderChart()
})
watch(() => data.value?.data?.chart, () => nextTick(renderChart), { deep: true })
onBeforeUnmount(() => chart?.destroy())

/* ---------- Nạp tiền ---------- */
const topupOpen = ref(false)
const topupAmount = ref(100000)
const topupLoading = ref(false)
async function doTopup() {
  if (topupAmount.value < 10000) return ui.error('Số tiền nạp tối thiểu là 10.000đ')
  topupLoading.value = true
  try {
    const res: any = await $fetch('/api/user/topup', { method: 'POST', body: { amount: topupAmount.value } })
    ui.success(res.message || 'Nạp tiền thành công')
    topupOpen.value = false
    await auth.fetchMe()
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể nạp tiền')
  } finally { topupLoading.value = false }
}

/* ---------- Rút tiền ---------- */
const wdOpen = ref(false)
const wdLoading = ref(false)
const wd = reactive({ amount: 200000, bank_name: '', bank_number: '' })
watchEffect(() => {
  wd.bank_name = wd.bank_name || (auth.user as any)?.bank_name || ''
  wd.bank_number = wd.bank_number || (auth.user as any)?.bank_number || ''
})
async function doWithdraw() {
  if (wd.amount < 200000) return ui.error('Số tiền rút tối thiểu là 200.000đ')
  if (!wd.bank_name.trim() || !wd.bank_number.trim()) return ui.error('Vui lòng nhập thông tin ngân hàng')
  wdLoading.value = true
  try {
    const res: any = await $fetch('/api/user/withdraw', { method: 'POST', body: { ...wd } })
    ui.success(res.message || 'Đã gửi yêu cầu rút tiền')
    wdOpen.value = false
    await auth.fetchMe()
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể rút tiền')
  } finally { wdLoading.value = false }
}
</script>

<template>
  <section id="wallet-page">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><AppIcon name="fa-wallet" class="text-primary-900 mr-2" />Ví &amp; doanh thu</h1>
      <p class="text-slate-500 text-sm mt-1">Theo dõi số dư, doanh thu bán tài liệu và lịch sử giao dịch của bạn.</p>
    </header>

    <div class="grid gap-4 lg:grid-cols-3 mb-6">
      <div id="balance-card" class="lg:col-span-1 rounded-2xl p-6 text-white bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 shadow-hover relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent-500/25 blur-2xl" />
        <p class="text-sm text-white/70 relative">Số dư khả dụng</p>
        <p class="text-3xl font-extrabold mt-1 relative">{{ currency(data?.data?.summary?.balance || 0) }}</p>
        <div class="flex gap-2 mt-6 relative">
          <button class="btn btn-accent btn-sm flex-1" @click="topupOpen = true"><AppIcon name="fa-plus" class="mr-2" />Nạp tiền</button>
          <button class="btn btn-sm flex-1 bg-white/15 text-white hover:bg-white/25" @click="wdOpen = true"><AppIcon name="fa-money-bill-transfer" class="mr-2" />Rút tiền</button>
        </div>
      </div>

      <div class="stat-card stat-tone-ok">
        <span class="stat-card__icon from-emerald-600 to-emerald-800"><AppIcon name="fa-arrow-trend-up" /></span>
        <div class="min-w-0">
          <p class="stat-card__label">Tổng tiền vào</p>
          <p class="stat-card__value text-ok">{{ currency(data?.data?.summary?.income || 0) }}</p>
        </div>
      </div>
      <div class="stat-card stat-tone-bad">
        <span class="stat-card__icon from-rose-600 to-rose-800"><AppIcon name="fa-arrow-trend-down" /></span>
        <div class="min-w-0">
          <p class="stat-card__label">Tổng tiền ra</p>
          <p class="stat-card__value text-bad">{{ currency(data?.data?.summary?.outcome || 0) }}</p>
        </div>
      </div>
    </div>

    <div class="card p-5 mb-6">
      <h2 class="font-bold text-slate-800 mb-4"><AppIcon name="fa-chart-column" class="text-accent-500 mr-2" />Doanh thu 6 tháng gần nhất</h2>
      <div class="h-64"><canvas ref="chartEl" /></div>
    </div>

    <div class="card p-5">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="font-bold text-slate-800"><AppIcon name="fa-receipt" class="text-primary-900 mr-2" />Lịch sử giao dịch</h2>
        <div class="flex flex-wrap gap-2">
          <button v-for="t in tabs" :key="t.key" class="tab" :class="type === t.key ? 'tab-on' : ''" @click="type = t.key as any">{{ t.label }}</button>
        </div>
      </div>

      <UiSpinner v-if="pending" :size="30" label="Đang tải giao dịch..." />

      <template v-else-if="data?.data">
        <UiEmpty v-if="!data.data.items.length" icon="fa-receipt" title="Chưa có giao dịch nào"
          desc="Nạp tiền hoặc bán tài liệu để bắt đầu ghi nhận giao dịch." />
        <div v-else class="overflow-x-auto -mx-5 px-5">
          <table class="w-full text-sm min-w-[620px]">
            <thead><tr class="text-left border-b border-slate-100 bg-slate-50/60">
              <th class="table-th">Loại</th><th class="table-th">Nội dung</th>
              <th class="table-th">Thời gian</th><th class="table-th text-right">Số tiền</th>
              <th class="table-th text-right">Số dư sau</th>
            </tr></thead>
            <tbody>
              <tr v-for="t in data.data.items" :key="t.id" class="table-row">
                <td class="table-td">
                  <span class="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full" :class="txMeta[t.type]?.cls">
                    <AppIcon :name="txMeta[t.type]?.icon" />{{ txMeta[t.type]?.label || t.type }}
                  </span>
                </td>
                <td class="table-td text-slate-600 max-w-xs"><span class="line-clamp-1">{{ t.note }}</span></td>
                <td class="table-td text-slate-500 whitespace-nowrap">{{ dateTime(t.created_at) }}</td>
                <td class="table-td text-right font-bold whitespace-nowrap" :class="t.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ t.amount >= 0 ? '+' : '-' }}{{ currency(Math.abs(t.amount)) }}
                </td>
                <td class="table-td text-right text-slate-600 whitespace-nowrap">{{ currency(t.balance_after) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <UiPagination :page="page" :total-pages="data.data.totalPages" @change="(p:number) => (page = p)" />
      </template>
    </div>

    <UiModal v-model="topupOpen" title="Nạp tiền vào ví" width="max-w-md">
      <div class="space-y-4">
        <div>
          <label class="label" for="topup-amount">Số tiền nạp (đ)</label>
          <input id="topup-amount" v-model.number="topupAmount" type="number" min="10000" step="10000" class="input" />
          <p class="text-xs text-slate-500 mt-1">Tối thiểu 10.000đ - tối đa 50.000.000đ</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="a in [50000, 100000, 200000, 500000, 1000000]" :key="a" type="button"
            class="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-primary-900 hover:text-primary-900 transition"
            @click="topupAmount = a">{{ currency(a) }}</button>
        </div>
        <p class="text-xs text-primary-900 bg-primary-50 rounded-lg p-3">
          <AppIcon name="fa-circle-info" class="mr-1" />Đây là môi trường demo — tiền sẽ được cộng ngay vào ví mà không cần thanh toán thật.
        </p>
      </div>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="topupOpen = false">Huỷ</button>
        <button class="btn btn-primary btn-sm" :disabled="topupLoading" @click="doTopup">
          <AppIcon name="fa-spinner" class="mr-2" v-if="topupLoading" />Nạp {{ currency(topupAmount) }}
        </button>
      </template>
    </UiModal>

    <UiModal v-model="wdOpen" title="Rút tiền về ngân hàng" width="max-w-md">
      <div class="space-y-4">
        <div>
          <label class="label" for="wd-amount">Số tiền rút (đ)</label>
          <input id="wd-amount" v-model.number="wd.amount" type="number" min="200000" step="50000" class="input" />
          <p class="text-xs text-slate-500 mt-1">Tối thiểu 200.000đ · Số dư: <strong>{{ currency(data?.data?.summary?.balance || 0) }}</strong></p>
        </div>
        <div>
          <label class="label" for="wd-bank">Ngân hàng</label>
          <input id="wd-bank" v-model="wd.bank_name" type="text" class="input" placeholder="VD: Vietcombank" />
        </div>
        <div>
          <label class="label" for="wd-number">Số tài khoản</label>
          <input id="wd-number" v-model="wd.bank_number" type="text" class="input" placeholder="VD: 0123456789" />
        </div>
        <p class="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
          <AppIcon name="fa-clock" class="mr-1" />Yêu cầu rút tiền được xử lý trong 1-3 ngày làm việc.
        </p>
      </div>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="wdOpen = false">Huỷ</button>
        <button class="btn btn-accent btn-sm" :disabled="wdLoading" @click="doWithdraw">
          <AppIcon name="fa-spinner" class="mr-2" v-if="wdLoading" />Gửi yêu cầu
        </button>
      </template>
    </UiModal>
  </section>
</template>

<style scoped>
.tab { @apply px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:border-primary-900 hover:text-primary-900 transition; }
.tab-on { @apply bg-primary-900 border-primary-900 text-white hover:text-white; }
</style>
