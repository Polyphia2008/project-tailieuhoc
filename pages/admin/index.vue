<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { money, moneyShort, num, compact } = useFormat()
const { get } = useSubjects()
const { data } = await useFetch<any>('/api/admin/stats', { query: { days: 30 } })
const c = computed(() => data.value?.cards || {})
const ch = computed(() => data.value?.chart || { labels: [], gmv: [], commission: [], orders: [], users: [], documents: [] })
const c1 = ref<HTMLCanvasElement | null>(null); const c2 = ref<HTMLCanvasElement | null>(null)
let k1: any = null; let k2: any = null

onMounted(async () => {
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  const { baseOptions, lineDataset, barDataset, palette } = useChartTheme()
  const lb = ch.value.labels.map((d: string) => d.slice(8) + '/' + d.slice(5, 7))
  if (c1.value) k1 = new Chart(c1.value, { type: 'line', data: { labels: lb, datasets: [lineDataset('GMV', ch.value.gmv, palette.blue), lineDataset('Hoa hồng', ch.value.commission, palette.orange)] }, options: baseOptions() })
  if (c2.value) k2 = new Chart(c2.value, { type: 'bar', data: { labels: lb, datasets: [barDataset('Đơn hàng', ch.value.orders, palette.green), barDataset('Người dùng mới', ch.value.users, palette.purple), barDataset('Tài liệu mới', ch.value.documents, palette.cyan)] }, options: baseOptions() })
})
onUnmounted(() => { k1?.destroy(); k2?.destroy() })
useHead({ title: 'Bảng điều khiển - MapDocs Admin' })
</script>
<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><span>Admin</span> / <span class="text-mdk-sub">Bảng điều khiển</span></nav>
    <h1 class="mt-3 text-[22px] sm:text-[26px] font-bold text-mdk-text font-ui tracking-tight">Bảng điều khiển</h1>
    <p class="mt-1 text-[13px] text-mdk-mute">Toàn cảnh hoạt động hệ thống MapDocs trong 30 ngày qua.</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard label="Tổng GMV" :value="money(c.gmv)" icon="solar:dollar-minimalistic-bold-duotone" tone="blue" :spark="ch.gmv" :index="0" />
      <DashboardStatCard label="Hoa hồng thu được" :value="money(c.commission)" icon="solar:percent-square-bold-duotone" tone="orange" :spark="ch.commission" :index="1" hint="15% mỗi giao dịch" />
      <DashboardStatCard label="Người dùng" :value="num(c.users)" icon="solar:users-group-rounded-bold-duotone" tone="purple" :spark="ch.users" :index="2" :hint="`${c.sellers || 0} người bán`" to="/admin/nguoi-dung" />
      <DashboardStatCard label="Tài liệu" :value="num(c.documents_approved)" icon="solar:documents-bold-duotone" tone="green" :spark="ch.documents" :index="3" :hint="`${c.documents_pending || 0} chờ duyệt`" to="/admin/tai-lieu" />
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard label="Đơn hàng thành công" :value="num(c.orders)" icon="solar:cart-check-bold-duotone" tone="cyan" :spark="ch.orders" :index="4" to="/admin/giao-dich" />
      <DashboardStatCard label="Khiếu nại đang mở" :value="num(c.reports_open)" icon="solar:flag-bold-duotone" tone="rose" :index="5" to="/admin/khieu-nai" />
      <DashboardStatCard label="Yêu cầu rút tiền" :value="num(c.withdraw_pending)" icon="solar:card-send-bold-duotone" tone="amber" :index="6" to="/admin/giao-dich" />
      <DashboardStatCard label="Tổng lượt xem" :value="compact(c.views)" icon="solar:eye-bold-duotone" tone="blue" :index="7" :hint="`${compact(c.downloads)} lượt tải`" />
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-2">
      <div class="card p-5"><h2 class="text-[15px] font-bold text-mdk-text font-ui">Doanh thu & hoa hồng</h2><p class="mt-0.5 text-[12px] text-mdk-mute">Biến động theo ngày</p><div class="mt-4 h-[260px]"><canvas ref="c1" /></div></div>
      <div class="card p-5"><h2 class="text-[15px] font-bold text-mdk-text font-ui">Tăng trưởng hệ thống</h2><p class="mt-0.5 text-[12px] text-mdk-mute">Đơn hàng, người dùng và tài liệu mới</p><div class="mt-4 h-[260px]"><canvas ref="c2" /></div></div>
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-mdk-line"><h2 class="text-[15px] font-bold text-mdk-text font-ui">Tài liệu bán chạy</h2></div>
        <div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Tài liệu</th><th>Môn</th><th>Giá</th><th>Đã bán</th><th>Đánh giá</th></tr></thead>
        <tbody><tr v-for="d in data?.top_documents || []" :key="d.id">
          <td class="max-w-[300px]"><NuxtLink :to="`/tai-lieu/${d.slug}`" class="text-[13px] font-medium text-mdk-text hover:text-primary-300 line-clamp-1">{{ d.title }}</NuxtLink></td>
          <td><span class="pill-slate text-[11px]">{{ get(d.subject).name }}</span></td>
          <td class="text-[13px] tabular-nums">{{ d.price ? money(d.price) : 'Miễn phí' }}</td>
          <td class="text-[13px] tabular-nums">{{ num(d.sold_count) }}</td>
          <td><UiRating :value="d.rating_avg" :size="12" /></td>
        </tr></tbody></table></div>
      </div>
      <div class="card p-5">
        <h2 class="text-[15px] font-bold text-mdk-text font-ui">Top người bán</h2>
        <div class="mt-4 space-y-3.5">
          <div v-for="(s, i) in data?.top_sellers || []" :key="s.id" class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-md grid place-items-center text-[11px] font-bold" :class="i === 0 ? 'bg-amber-400 text-amber-950' : 'bg-mdk-line text-mdk-sub'">{{ i + 1 }}</span>
            <UiAvatar :name="s.name" :size="32" />
            <div class="min-w-0 flex-1"><p class="text-[13px] font-medium text-mdk-text truncate">{{ s.name }}</p><p class="text-[11.5px] text-mdk-mute tabular-nums">{{ money(s.revenue) }}</p></div>
          </div>
        </div>
        <div class="mt-5 pt-4 border-t border-mdk-line">
          <p class="text-[12px] font-bold text-mdk-mute uppercase tracking-wider">Tài liệu theo môn</p>
          <div class="mt-3 space-y-2">
            <div v-for="b in data?.by_subject || []" :key="b.subject" class="flex items-center gap-2.5 text-[12px]">
              <span class="w-16 text-mdk-sub truncate">{{ get(b.subject).name }}</span>
              <div class="flex-1 h-1.5 rounded-full bg-mdk-line overflow-hidden"><div class="h-full rounded-full" :style="{ width: `${(b.count / Math.max(1, data.by_subject[0].count)) * 100}%`, background: get(b.subject).from }" /></div>
              <span class="w-6 text-right text-mdk-mute tabular-nums">{{ b.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
