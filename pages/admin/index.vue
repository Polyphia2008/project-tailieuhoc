<script setup lang="ts">
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Tổng quan quản trị - MapDocs' })

const { currency, number, compact } = useFormat()
const { meta } = useSubjects()

const { data, pending } = await useAsyncData('admin-stats', () => $fetch<any>('/api/admin/stats'))
const s = computed(() => data.value?.data)

const cards = computed(() => {
  const d = s.value
  if (!d) return []
  return [
    { label: 'Người dùng', value: number(d.users), sub: `${d.sellers} người bán · ${d.blocked} bị khoá`, icon: 'fa-users', cls: 'from-primary-800 to-primary-950', tone: 'stat-tone-primary' },
    { label: 'Tài liệu', value: number(d.documents), sub: `${d.approved} đã duyệt`, icon: 'fa-file-lines', cls: 'from-violet-600 to-violet-800', tone: 'stat-tone-violet' },
    { label: 'Chờ duyệt', value: number(d.pending), sub: `${d.rejected} bị từ chối`, icon: 'fa-hourglass-half', cls: 'from-amber-600 to-amber-800', tone: 'stat-tone-warn' },
    { label: 'Đơn hàng', value: number(d.orders), sub: 'Đã thanh toán', icon: 'fa-bag-shopping', cls: 'from-emerald-600 to-emerald-800', tone: 'stat-tone-ok' },
    { label: 'Tổng GMV', value: currency(d.gmv), sub: `Hoa hồng ${currency(d.commission)}`, icon: 'fa-sack-dollar', cls: 'from-accent-500 to-accent-700', tone: 'stat-tone-accent' },
    { label: 'Khiếu nại mở', value: number(d.reports_open), sub: 'Cần xử lý', icon: 'fa-flag', cls: 'from-rose-600 to-rose-800', tone: 'stat-tone-bad' }
  ]
})

const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function renderChart() {
  if (!import.meta.client || !chartEl.value || !s.value) return
  const rows = s.value.chart || []
  chart?.destroy()
  chart = new Chart(chartEl.value, {
    data: {
      labels: rows.map((r: any) => r.label),
      datasets: [
        { type: 'bar', label: 'Hoa hồng (đ)', data: rows.map((r: any) => r.revenue), backgroundColor: '#0b4a8f', borderRadius: 8, maxBarThickness: 44, yAxisID: 'y' },
        { type: 'line', label: 'Số đơn', data: rows.map((r: any) => r.orders), borderColor: '#ff8412', backgroundColor: '#ff8412', tension: 0.35, borderWidth: 3, pointRadius: 4, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { beginAtZero: true, position: 'left', grid: { color: '#f1f5f9' }, ticks: { callback: (v: any) => compact(v) } },
        y1: { beginAtZero: true, position: 'right', grid: { display: false } },
        x: { grid: { display: false } }
      }
    } as any
  })
}

onMounted(() => {
  Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)
  renderChart()
})
watch(s, () => nextTick(renderChart))
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <section id="admin-overview">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><AppIcon name="fa-shield-halved" class="text-primary-900 mr-2" />Tổng quan hệ thống</h1>
      <p class="text-slate-500 text-sm mt-1">Số liệu tổng hợp toàn nền tảng MapDocs.</p>
    </header>

    <UiSpinner v-if="pending" :size="34" label="Đang tải số liệu..." />

    <template v-else-if="s">
      <div id="admin-stat-cards" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <div v-for="(c, i) in cards" :key="c.label" class="stat-card" :class="c.tone"
          v-motion :initial="{ opacity: 0, y: 14 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 380, delay: Math.min(i * 55, 300) } }">
          <span class="stat-card__icon" :class="c.cls"><AppIcon :name="c.icon" /></span>
          <div class="min-w-0">
            <p class="stat-card__label">{{ c.label }}</p>
            <p class="stat-card__value">{{ c.value }}</p>
            <p class="stat-card__sub">{{ c.sub }}</p>
          </div>
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
