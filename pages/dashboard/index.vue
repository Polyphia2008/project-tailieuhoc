<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const auth = useAuthStore()
const { money, moneyShort, num, compact } = useFormat()
const { data } = await useFetch<any>('/api/user/stats', { query: { days: 30 } })
const c = computed(() => data.value?.cards || {})
const ch = computed(() => data.value?.chart || { labels: [], revenue: [], orders: [], spent: [], downloads: [] })

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: any = null

onMounted(async () => {
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  const { baseOptions, lineDataset, palette } = useChartTheme()
  if (!canvas.value) return
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: ch.value.labels.map((d: string) => d.slice(8) + '/' + d.slice(5, 7)),
      datasets: [
        lineDataset('Doanh thu', ch.value.revenue, palette.green),
        lineDataset('Chi tiêu', ch.value.spent, palette.rose),
        lineDataset('Lượt tải', ch.value.downloads, palette.blue)
      ]
    },
    options: baseOptions()
  })
})
onUnmounted(() => chart?.destroy())

const hour = new Date().getHours()
const greet = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

const QUICK = [
  { label: 'Thư viện tài liệu', icon: 'solar:book-2-bold-duotone', to: '/tai-lieu', tone: 'blue' },
  { label: 'Đăng bán tài liệu', icon: 'solar:cloud-upload-bold-duotone', to: '/dashboard/tai-lieu', tone: 'cyan' },
  { label: 'Kho của tôi', icon: 'solar:folder-with-files-bold-duotone', to: '/dashboard/da-mua', tone: 'orange' },
  { label: 'Doanh thu', icon: 'solar:chart-square-bold-duotone', to: '/dashboard/doanh-thu', tone: 'purple' },
  { label: 'Yêu thích', icon: 'solar:heart-bold-duotone', to: '/dashboard/yeu-thich', tone: 'rose' },
  { label: 'Đang bán', icon: 'solar:tag-price-bold-duotone', to: '/dashboard/dang-ban', tone: 'green' },
  { label: 'Hồ sơ cá nhân', icon: 'solar:user-circle-bold-duotone', to: '/dashboard/ho-so', tone: 'amber' },
  { label: 'Blog kiến thức', icon: 'solar:notes-bold-duotone', to: '/blog', tone: 'indigo' }
]
useHead({ title: 'Tổng quan - MapDocs' })
</script>
<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/" class="hover:text-mdk-sub">Trang chủ</NuxtLink> / <span class="text-mdk-sub">Dashboard</span></nav>
    <h1 class="mt-3 text-[22px] sm:text-[26px] font-bold text-mdk-text font-ui tracking-tight">{{ greet }}, {{ auth.user?.name }} 👋</h1>
    <p class="mt-1 text-[13px] text-mdk-mute">Quản lý tài liệu, doanh thu và hoạt động học tập của bạn.</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        to="/dashboard/doanh-thu"
        data-testid="wallet-stat-card"
        class="stat-card stat-card-flat group relative flex min-h-[132px] flex-col gap-6 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-background p-5 text-card-foreground shadow-[inset_0_1px_1px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/[0.03] dark:from-[#1a1a1a] dark:to-[#131313] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_1px_rgba(0,0,0,0.2)]"
      >
        <div class="relative z-10 flex items-center gap-x-4">
          <span class="grid size-12 shrink-0 place-items-center rounded-xl border border-border/50 bg-muted/40">
            <AppIcon name="solar:wallet-money-bold-duotone" size="24" class="text-cmstdev" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-xl font-semibold tabular-nums text-foreground">{{ money(c.balance) }}</span>
            <span class="block truncate text-sm text-muted-foreground">Số dư hiện tại</span>
          </span>
        </div>
        <AppIcon
          name="solar:wallet-money-bold-duotone"
          size="96"
          class="pointer-events-none absolute -bottom-5 -right-4 text-muted-foreground/5 transition-transform duration-500 group-hover:scale-110"
        />
      </NuxtLink>
      <DashboardStatCard label="Tổng doanh thu" :value="money(c.revenue)" icon="solar:hand-money-bold-duotone" tone="green" :spark="ch.revenue" :index="1" hint="Đã trừ hoa hồng 15%" to="/dashboard/doanh-thu" />
      <NuxtLink
        to="/dashboard/dang-ban"
        data-testid="cart-stat-card"
        class="stat-card stat-card-flat group relative flex min-h-[132px] flex-col gap-6 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-background p-5 text-card-foreground shadow-[inset_0_1px_1px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/[0.03] dark:from-[#1a1a1a] dark:to-[#131313] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_1px_rgba(0,0,0,0.2)]"
      >
        <div class="relative z-10 flex items-center gap-x-4">
          <span class="grid size-12 shrink-0 place-items-center rounded-xl border border-border/50 bg-muted/40">
            <AppIcon name="solar:cart-large-4-bold-duotone" size="24" class="text-cmstdev" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-xl font-semibold tabular-nums text-foreground">{{ num(c.documents_approved) }}</span>
            <span class="block truncate text-sm text-muted-foreground">Tài liệu đang bán</span>
          </span>
        </div>
        <AppIcon
          name="solar:cart-large-4-bold-duotone"
          size="96"
          class="pointer-events-none absolute -bottom-5 -right-4 text-muted-foreground/5 transition-transform duration-500 group-hover:scale-110"
        />
      </NuxtLink>
      <DashboardStatCard label="Tài liệu đã mua" :value="num(c.bought)" icon="solar:cart-large-4-bold-duotone" tone="purple" :spark="ch.downloads" :index="3" :hint="`${c.downloads || 0} lượt tải`" to="/dashboard/da-mua" />
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
      <div class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-[15px] font-bold text-mdk-text font-ui">Thống kê hoạt động 30 ngày</h2>
            <p class="mt-0.5 text-[12px] text-mdk-mute">Biến động doanh thu, chi tiêu và lượt tải theo thời gian</p>
          </div>
        </div>
        <div class="mt-4 h-[280px]"><canvas ref="canvas" /></div>
      </div>

      <div class="card p-5">
        <h2 class="text-[15px] font-bold text-mdk-text font-ui">Truy cập nhanh</h2>
        <div class="mt-4 grid grid-cols-4 gap-2.5">
          <DashboardQuickAction v-for="(q, i) in QUICK" :key="q.to + q.label" :label="q.label" :icon="q.icon" :to="q.to" :tone="q.tone as any" :index="i" />
        </div>
      </div>
    </div>

    <div v-if="data?.top_documents?.length" class="mt-5 card overflow-hidden">
      <div class="px-5 py-4 border-b border-mdk-line"><h2 class="text-[15px] font-bold text-mdk-text font-ui">Tài liệu bán chạy của bạn</h2></div>
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead><tr><th>Tài liệu</th><th>Giá</th><th>Đã bán</th><th>Lượt xem</th><th>Đánh giá</th></tr></thead>
          <tbody>
            <tr v-for="d in data.top_documents" :key="d.id">
              <td><NuxtLink :to="`/tai-lieu/${d.slug}`" class="text-[13px] font-medium text-mdk-text hover:text-primary-300 line-clamp-1">{{ d.title }}</NuxtLink></td>
              <td class="text-[13px] tabular-nums">{{ d.price ? money(d.price) : 'Miễn phí' }}</td>
              <td class="text-[13px] tabular-nums">{{ num(d.sold_count) }}</td>
              <td class="text-[13px] tabular-nums">{{ compact(d.view_count) }}</td>
              <td><UiRating :value="d.rating_avg" :size="12" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
