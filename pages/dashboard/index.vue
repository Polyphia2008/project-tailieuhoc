<script setup lang="ts">
import { Chart, LineController, LineElement, PointElement, Filler, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Bảng điều khiển - MapDocs' })

const auth = useAuthStore()
const { currency, number, compact, timeAgo, date } = useFormat()
const { meta } = useSubjects()
const { colors, areaGradient, baseOptions } = useChartTheme()

const { data, pending, refresh } = await useAsyncData('dash-home', async () => {
  const [docs, orders, notis, tx] = await Promise.all([
    $fetch<any>('/api/user/documents', { query: { limit: 5 } }),
    $fetch<any>('/api/orders', { query: { limit: 5 } }),
    $fetch<any>('/api/user/notifications'),
    $fetch<any>('/api/user/transactions', { query: { limit: 1 } })
  ])
  return {
    docs: docs.data.items, counts: docs.data.counts,
    orders: orders.data.items, orderTotal: orders.data.total,
    notis: notis.data.items.slice(0, 5), unread: notis.data.unread,
    summary: tx.data.summary, chart: tx.data.chart || []
  }
})

/** Loi chao theo gio (kieu thegioidev: "Chao buoi chieu, ...") */
const greet = computed(() => {
  const h = new Date().getHours()
  if (h < 11) return 'Chào buổi sáng'
  if (h < 14) return 'Chào buổi trưa'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})

const statCards = computed(() => {
  const d = data.value
  if (!d) return []
  const series = d.chart.map((r: any) => r.value)
  return [
    { label: 'Số dư khả dụng', value: currency(d.summary.balance), sub: 'Có thể rút về ngân hàng', icon: 'fa-wallet', tone: 'blue' as const, series },
    { label: 'Tổng doanh thu', value: currency(d.summary.total_revenue), sub: `Đã chi ${currency(d.summary.outcome)}`, icon: 'fa-sack-dollar', tone: 'green' as const, series },
    { label: 'Tài liệu đã mua', value: number(d.orderTotal), sub: 'Tải về không giới hạn', icon: 'fa-bag-shopping', tone: 'amber' as const },
    { label: 'Tài liệu đăng bán', value: number(d.counts.all), sub: `${d.counts.approved || 0} đã duyệt`, icon: 'fa-folder-open', tone: 'violet' as const }
  ]
})

const statusMeta: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Đã duyệt', cls: 'pill-ok' },
  pending: { label: 'Chờ duyệt', cls: 'pill-warn' },
  rejected: { label: 'Từ chối', cls: 'pill-bad' }
}

/* ---------- Chart lon: Thong ke giao dich ---------- */
const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function renderChart() {
  if (!import.meta.client || !chartEl.value || !data.value) return
  const rows = data.value.chart || []
  chart?.destroy()
  const ctx = chartEl.value.getContext('2d')!
  const base = baseOptions({ tickFormat: (v: any) => compact(v) })
  chart = new Chart(chartEl.value, {
    type: 'line',
    data: {
      labels: rows.map((r: any) => r.label),
      datasets: [
        {
          label: 'Doanh thu bán tài liệu',
          data: rows.map((r: any) => r.value),
          borderColor: colors.green,
          backgroundColor: areaGradient(ctx, chartEl.value.clientHeight || 260, colors.green, 0.3),
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: colors.green,
          pointHoverBorderColor: '#09090b',
          pointHoverBorderWidth: 2
        }
      ]
    },
    options: {
      ...base,
      plugins: {
        ...base.plugins,
        tooltip: {
          ...base.plugins.tooltip,
          callbacks: { label: (c: any) => ` Doanh thu: ${currency(c.parsed.y)}` }
        }
      }
    } as any
  })
}

onMounted(() => {
  Chart.register(LineController, LineElement, PointElement, Filler, CategoryScale, LinearScale, Tooltip, Legend)
  renderChart()
})
watch(data, () => nextTick(renderChart))
onBeforeUnmount(() => chart?.destroy())

const quickActions = [
  { to: '/dashboard/dang-ban', icon: 'fa-cloud-arrow-up', label: 'Đăng bán', tone: 'blue' as const },
  { to: '/tai-lieu', icon: 'fa-magnifying-glass', label: 'Tìm tài liệu', tone: 'cyan' as const },
  { to: '/dashboard/doanh-thu', icon: 'fa-money-bill-transfer', label: 'Nạp tiền', tone: 'green' as const },
  { to: '/dashboard/da-mua', icon: 'fa-bag-shopping', label: 'Đã mua', tone: 'amber' as const },
  { to: '/dashboard/yeu-thich', icon: 'fa-heart', label: 'Yêu thích', tone: 'rose' as const },
  { to: '/dashboard/tai-lieu', icon: 'fa-folder-open', label: 'Tài liệu', tone: 'violet' as const },
  { to: '/dashboard/ho-so', icon: 'fa-user-gear', label: 'Hồ sơ', tone: 'blue' as const },
  { to: '/blog', icon: 'fa-newspaper', label: 'Tin tức', tone: 'cyan' as const }
]

async function readAll() {
  await $fetch('/api/user/notifications', { method: 'POST', body: { action: 'read_all' } })
  useUiStore().success('Đã đánh dấu tất cả là đã đọc')
  refresh()
}
</script>

<template>
  <section id="dashboard-overview">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-white">{{ greet }}, {{ auth.user?.name }} 👋</h1>
      <p class="mt-1 text-sm text-[#a1a1aa]">Quản lý và theo dõi hoạt động tài liệu của bạn trên MapDocs.</p>
    </header>

    <UiSpinner v-if="pending" :size="34" label="Đang tải dữ liệu..." />

    <template v-else-if="data">
      <!-- ===== Stat cards ===== -->
      <div id="stat-cards" class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="(c, i) in statCards" :key="c.label"
          v-motion :initial="{ opacity: 0, y: 14 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 380, delay: Math.min(i * 70, 280) } }">
          <DashboardStatCard :label="c.label" :value="c.value" :sub="c.sub" :icon="c.icon" :tone="c.tone" :series="c.series" />
        </div>
      </div>

      <!-- ===== Chart lon + Truy cap nhanh ===== -->
      <div class="mb-6 grid gap-4 lg:grid-cols-3">
        <div id="transaction-chart" class="card p-5 lg:col-span-2">
          <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-bold text-white">Thống kê giao dịch</h2>
              <p class="mt-0.5 text-xs text-[#71717a]">Biến động doanh thu 6 tháng gần nhất</p>
            </div>
            <NuxtLink to="/dashboard/doanh-thu" class="mdk-chip">
              <AppIcon name="fa-arrow-trend-up" />Chi tiết
            </NuxtLink>
          </div>
          <div class="h-[260px]"><canvas ref="chartEl" /></div>
        </div>

        <div id="quick-access" class="card p-5">
          <h2 class="mb-4 font-bold text-white">Truy cập nhanh</h2>
          <div class="grid grid-cols-4 gap-2.5">
            <DashboardQuickAction v-for="q in quickActions" :key="q.to" v-bind="q" />
          </div>
        </div>
      </div>

      <!-- ===== Tai lieu + Thong bao ===== -->
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="card p-5 lg:col-span-2">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-bold text-white">
              <AppIcon name="fa-clock-rotate-left" class="mr-2 text-blue-400" />Tài liệu gần đây
            </h2>
            <NuxtLink to="/dashboard/tai-lieu" class="link text-sm">Xem tất cả</NuxtLink>
          </div>
          <UiEmpty v-if="!data.docs.length" icon="fa-folder-open" title="Bạn chưa đăng tài liệu nào"
            desc="Chia sẻ tài liệu của bạn và nhận 85% doanh thu mỗi lượt bán.">
            <NuxtLink to="/dashboard/dang-ban" class="btn btn-accent"><AppIcon name="fa-cloud-arrow-up" class="mr-2" />Đăng bán ngay</NuxtLink>
          </UiEmpty>
          <div v-else class="-mx-5 overflow-x-auto px-5">
            <table class="w-full text-sm">
              <thead><tr class="text-left">
                <th class="table-th">Tài liệu</th><th class="table-th">Giá</th>
                <th class="table-th">Lượt bán</th><th class="table-th">Trạng thái</th>
              </tr></thead>
              <tbody>
                <tr v-for="d in data.docs" :key="d.id" class="table-row">
                  <td class="table-td">
                    <NuxtLink :to="`/tai-lieu/${d.slug}`" class="group flex items-center gap-3">
                      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white" :class="meta(d.subject).gradient">
                        <AppIcon :name="meta(d.subject).icon" class="text-xs" />
                      </span>
                      <span class="min-w-0">
                        <span class="line-clamp-1 block font-medium text-white group-hover:text-blue-300">{{ d.title }}</span>
                        <span class="text-xs text-[#71717a]">{{ date(d.created_at) }}</span>
                      </span>
                    </NuxtLink>
                  </td>
                  <td class="table-td font-semibold" :class="d.is_free ? 'text-green-600' : 'text-accent-500'">{{ currency(d.price) }}</td>
                  <td class="table-td">{{ number(d.sold_count) }}</td>
                  <td class="table-td"><span :class="statusMeta[d.status]?.cls">{{ statusMeta[d.status]?.label }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-bold text-white">
              <AppIcon name="fa-bell" class="mr-2 text-orange-400" />Thông báo
              <span v-if="data.unread" class="pill-bad ml-1">{{ data.unread }}</span>
            </h2>
            <button v-if="data.unread" class="link text-xs" @click="readAll">Đọc tất cả</button>
          </div>
          <UiEmpty v-if="!data.notis.length" icon="fa-bell-slash" title="Chưa có thông báo" />
          <ul v-else class="space-y-2.5">
            <li v-for="n in data.notis" :key="n.id" class="flex gap-3 rounded-xl border border-[#27272a] p-3"
              :class="n.read ? 'bg-[#1c1c1f]' : 'border-blue-500/25 bg-blue-500/[.08]'">
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#27272a] text-blue-300">
                <AppIcon name="fa-circle-info" class="text-xs" />
              </span>
              <div class="min-w-0">
                <NuxtLink :to="n.link || '/dashboard'" class="line-clamp-1 block text-sm font-semibold text-white hover:text-blue-300">{{ n.title }}</NuxtLink>
                <p class="mt-0.5 line-clamp-2 text-xs text-[#a1a1aa]">{{ n.body }}</p>
                <p class="mt-1 text-[11px] text-[#52525b]">{{ timeAgo(n.created_at) }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </section>
</template>
