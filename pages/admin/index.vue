<script setup lang="ts">
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, Filler, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Tổng quan quản trị - MapDocs' })

const { currency, number, compact } = useFormat()
const { meta } = useSubjects()
const { colors, hexAlpha, areaGradient, baseOptions } = useChartTheme()

const { data, pending } = await useAsyncData('admin-stats', () => $fetch<any>('/api/admin/stats'))
const s = computed(() => data.value?.data)

const cards = computed(() => {
  const d = s.value
  if (!d) return []
  return [
    { label: 'Người dùng', value: number(d.users), sub: `${d.sellers} người bán · ${d.blocked} bị khoá`, icon: 'fa-users', tone: 'blue' as const },
    { label: 'Tài liệu', value: number(d.documents), sub: `${d.approved} đã duyệt`, icon: 'fa-file-lines', tone: 'violet' as const },
    { label: 'Chờ duyệt', value: number(d.pending), sub: `${d.rejected} bị từ chối`, icon: 'fa-hourglass-half', tone: 'amber' as const },
    { label: 'Đơn hàng', value: number(d.orders), sub: 'Đã thanh toán', icon: 'fa-bag-shopping', tone: 'green' as const, series: (d.chart || []).map((r: any) => r.orders) },
    { label: 'Tổng GMV', value: currency(d.gmv), sub: `Hoa hồng ${currency(d.commission)}`, icon: 'fa-sack-dollar', tone: 'cyan' as const, series: (d.chart || []).map((r: any) => r.revenue) },
    { label: 'Khiếu nại mở', value: number(d.reports_open), sub: 'Cần xử lý', icon: 'fa-flag', tone: 'rose' as const }
  ]
})

const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function renderChart() {
  if (!import.meta.client || !chartEl.value || !s.value) return
  const rows = s.value.chart || []
  chart?.destroy()
  const ctx = chartEl.value.getContext('2d')!
  const base = baseOptions({ tickFormat: (v: any) => compact(v) })
  chart = new Chart(chartEl.value, {
    data: {
      labels: rows.map((r: any) => r.label),
      datasets: [
        {
          type: 'bar', label: 'Hoa hồng (đ)', data: rows.map((r: any) => r.revenue),
          backgroundColor: hexAlpha(colors.blue, 0.6), hoverBackgroundColor: colors.blue,
          borderColor: colors.blue, borderWidth: 1, borderRadius: 8, maxBarThickness: 44, yAxisID: 'y'
        },
        {
          type: 'line', label: 'Số đơn', data: rows.map((r: any) => r.orders),
          borderColor: colors.amber,
          backgroundColor: areaGradient(ctx, chartEl.value.clientHeight || 288, colors.amber, 0.22),
          fill: true, tension: 0.4, borderWidth: 2.5,
          pointRadius: 0, pointHoverRadius: 5,
          pointHoverBackgroundColor: colors.amber, pointHoverBorderColor: '#09090b', pointHoverBorderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      ...base,
      scales: {
        ...base.scales,
        y: { ...base.scales.y, position: 'left' },
        y1: {
          beginAtZero: true, position: 'right',
          border: { display: false },
          grid: { display: false },
          ticks: { color: colors.text, font: { size: 11 }, padding: 6 }
        }
      }
    } as any
  })
}

onMounted(() => {
  Chart.register(BarController, BarElement, LineController, LineElement, PointElement, Filler, CategoryScale, LinearScale, Tooltip, Legend)
  renderChart()
})
watch(s, () => nextTick(renderChart))
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <section id="admin-overview">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-white"><AppIcon name="fa-shield-halved" class="mr-2 text-blue-400" />Tổng quan hệ thống</h1>
      <p class="text-slate-500 text-sm mt-1">Số liệu tổng hợp toàn nền tảng MapDocs.</p>
    </header>

    <UiSpinner v-if="pending" :size="34" label="Đang tải số liệu..." />

    <template v-else-if="s">
      <div id="admin-stat-cards" class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="(c, i) in cards" :key="c.label"
          v-motion :initial="{ opacity: 0, y: 14 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 380, delay: Math.min(i * 55, 300) } }">
          <DashboardStatCard :label="c.label" :value="c.value" :sub="c.sub" :icon="c.icon" :tone="c.tone" :series="c.series" />
        </div>
      </div>

      <div class="card p-5 mb-6">
        <h2 class="font-bold text-slate-800 mb-4"><AppIcon name="fa-chart-line" class="text-accent-500 mr-2" />Doanh thu &amp; đơn hàng 6 tháng gần nhất</h2>
        <div class="h-72"><canvas ref="chartEl" /></div>
      </div>

      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-800"><AppIcon name="fa-trophy" variant="bold" class="text-amber-500 mr-2" />Top 8 tài liệu bán chạy</h2>
          <NuxtLink to="/admin/tai-lieu" class="link text-sm">Quản lý tài liệu</NuxtLink>
        </div>
        <UiEmpty v-if="!s.top?.length" icon="fa-chart-simple" title="Chưa có dữ liệu bán hàng" />
        <div v-else class="overflow-x-auto -mx-5 px-5">
          <table class="w-full text-sm min-w-[620px]">
            <thead><tr class="text-left border-b border-slate-100 bg-slate-50/60">
              <th class="table-th">#</th><th class="table-th">Tài liệu</th><th class="table-th">Môn</th>
              <th class="table-th text-right">Giá</th><th class="table-th text-right">Lượt bán</th><th class="table-th text-right">Doanh thu</th>
            </tr></thead>
            <tbody>
              <tr v-for="(d, i) in s.top" :key="d.id" class="table-row">
                <td class="table-td font-bold text-slate-400">{{ i + 1 }}</td>
                <td class="table-td">
                  <NuxtLink :to="`/tai-lieu/${d.slug}`" class="font-medium text-slate-800 hover:text-primary-900 line-clamp-1 max-w-sm block">{{ d.title }}</NuxtLink>
                </td>
                <td class="table-td"><span class="badge" :class="[meta(d.subject).bg, meta(d.subject).text]">{{ meta(d.subject).label }}</span></td>
                <td class="table-td text-right">{{ currency(d.price) }}</td>
                <td class="table-td text-right font-semibold">{{ number(d.sold_count) }}</td>
                <td class="table-td text-right font-bold text-primary-900">{{ currency(d.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>
