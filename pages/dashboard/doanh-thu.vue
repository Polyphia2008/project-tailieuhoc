<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const auth = useAuthStore()
const { money, ago } = useFormat()
const { txLabel } = useSubjects()
const { data, refresh } = await useFetch<any>('/api/user/transactions', { query: { limit: 20, days: 30 } })
const s = computed(() => data.value?.summary || {})
const topup = ref(200000); const withdraw = ref(200000); const busy = ref(false)
const canvas = ref<HTMLCanvasElement | null>(null); let chart: any = null

onMounted(async () => {
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  const { baseOptions, lineDataset, palette } = useChartTheme()
  const ch = data.value?.chart
  if (!canvas.value || !ch) return
  chart = new Chart(canvas.value, {
    type: 'line',
    data: { labels: ch.labels.map((d: string) => d.slice(8) + '/' + d.slice(5, 7)), datasets: [lineDataset('Thu', ch.income, palette.green), lineDataset('Chi', ch.outcome, palette.rose)] },
    options: baseOptions()
  })
})
onUnmounted(() => chart?.destroy())

async function doTopup() { busy.value = true; try { await $fetch('/api/user/topup', { method: 'POST', body: { amount: topup.value } }); await auth.refresh(); await refresh(); toast.success('Nạp tiền thành công!') } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false } }
async function doWithdraw() { busy.value = true; try { await $fetch('/api/user/withdraw', { method: 'POST', body: { amount: withdraw.value, bank: 'Vietcombank', account: '0123456789' } }); await auth.refresh(); await refresh(); toast.success('Đã gửi yêu cầu rút tiền') } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false } }
useHead({ title: 'Ví của tôi - MapDocs' })
</script>
<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/dashboard" class="hover:text-mdk-sub">Dashboard</NuxtLink> / <span class="text-mdk-sub">Ví của tôi</span></nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Ví của tôi</h1>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard label="Số dư khả dụng" :value="money(s.balance)" icon="solar:wallet-money-bold-duotone" tone="cyan" :spark="data?.chart?.income" :index="0" />
      <DashboardStatCard label="Tổng thu" :value="money(s.income)" icon="solar:card-recive-bold-duotone" tone="green" :spark="data?.chart?.income" :index="1" />
      <DashboardStatCard label="Tổng chi" :value="money(s.outcome)" icon="solar:card-send-bold-duotone" tone="rose" :spark="data?.chart?.outcome" :index="2" />
      <DashboardStatCard label="Đang chờ rút" :value="money(s.pending_withdraw)" icon="solar:clock-circle-bold-duotone" tone="amber" :index="3" />
    </div>
    <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
      <div class="card p-5"><h2 class="text-[15px] font-bold text-mdk-text font-ui">Biến động 30 ngày</h2><div class="mt-4 h-[260px]"><canvas ref="canvas" /></div></div>
      <div class="space-y-4">
        <div class="card p-5"><h3 class="text-[14px] font-bold text-mdk-text font-ui">Nạp tiền</h3>
          <input v-model.number="topup" type="number" min="10000" step="10000" class="input mt-3" />
          <div class="mt-2 flex flex-wrap gap-1.5"><button v-for="a in [100000,200000,500000,1000000]" :key="a" class="pill bg-mdk-line text-mdk-sub hover:text-mdk-text text-[11px]" @click="topup = a">{{ money(a) }}</button></div>
          <button class="btn-primary w-full mt-3" :disabled="busy" @click="doTopup()">Nạp qua cổng giả lập</button>
        </div>
        <div class="card p-5"><h3 class="text-[14px] font-bold text-mdk-text font-ui">Rút tiền</h3>
          <input v-model.number="withdraw" type="number" min="200000" step="50000" class="input mt-3" />
          <p class="mt-2 text-[11.5px] text-mdk-mute">Tối thiểu 200.000đ, xử lý trong 1-2 ngày</p>
          <button class="btn-outline w-full mt-3" :disabled="busy" @click="doWithdraw()">Gửi yêu cầu rút</button>
        </div>
      </div>
    </div>
    <div class="mt-5 card overflow-hidden">
      <div class="px-5 py-4 border-b border-mdk-line"><h2 class="text-[15px] font-bold text-mdk-text font-ui">Lịch sử giao dịch</h2></div>
      <div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Loại</th><th>Nội dung</th><th>Số tiền</th><th>Số dư sau</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
      <tbody><tr v-for="t in data?.items || []" :key="t.id">
        <td><span class="inline-flex items-center gap-1.5 text-[13px]"><AppIcon :name="txLabel(t.type).icon" size="16" :class="txLabel(t.type).positive ? 'text-emerald-400' : 'text-rose-400'" />{{ txLabel(t.type).label }}</span></td>
        <td class="text-[12.5px] text-mdk-sub max-w-[280px]"><span class="line-clamp-1">{{ t.note }}</span></td>
        <td class="text-[13px] font-semibold tabular-nums" :class="t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'">{{ t.amount >= 0 ? '+' : '' }}{{ money(t.amount) }}</td>
        <td class="text-[13px] tabular-nums">{{ money(t.balance_after) }}</td>
        <td><span :class="t.status === 'success' ? 'pill-green' : t.status === 'pending' ? 'pill-amber' : 'pill-red'">{{ t.status === 'success' ? 'Thành công' : t.status === 'pending' ? 'Đang xử lý' : 'Thất bại' }}</span></td>
        <td class="text-[12.5px] text-mdk-mute whitespace-nowrap">{{ ago(t.created_at) }}</td>
      </tr></tbody></table></div>
    </div>
  </div>
</template>
