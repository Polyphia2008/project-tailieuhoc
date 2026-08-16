<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Bảng điều khiển - MapDocs' })

const auth = useAuthStore()
const { currency, number, timeAgo, date } = useFormat()
const { meta } = useSubjects()

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
    summary: tx.data.summary
  }
})

const statusMeta: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700' },
  pending: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700' },
  rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-700' }
}

async function readAll() {
  await $fetch('/api/user/notifications', { method: 'POST', body: { action: 'read_all' } })
  useUiStore().success('Đã đánh dấu tất cả là đã đọc')
  refresh()
}
</script>

<template>
  <section id="dashboard-overview">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800">Xin chào, {{ auth.user?.name }} 👋</h1>
      <p class="text-slate-500 text-sm mt-1">Đây là tổng quan hoạt động tài khoản của bạn trên MapDocs.</p>
    </header>

    <UiSpinner v-if="pending" :size="34" label="Đang tải dữ liệu..." />

    <template v-else-if="data">
      <div id="stat-cards" class="grid gap-4 sm:grid-cols-3 mb-6">
        <div class="card p-5 flex items-center gap-4">
          <span class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-800 to-primary-950 text-white grid place-items-center text-xl"><AppIcon name="fa-wallet" /></span>
          <div>
            <p class="text-xs text-slate-500 font-medium">Số dư ví</p>
            <p class="text-xl font-extrabold text-primary-900">{{ currency(data.summary.balance) }}</p>
          </div>
        </div>
        <div class="card p-5 flex items-center gap-4">
          <span class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white grid place-items-center text-xl"><AppIcon name="fa-bag-shopping" /></span>
          <div>
            <p class="text-xs text-slate-500 font-medium">Tài liệu đã mua</p>
            <p class="text-xl font-extrabold text-slate-800">{{ number(data.orderTotal) }}</p>
          </div>
        </div>
        <div class="card p-5 flex items-center gap-4">
          <span class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white grid place-items-center text-xl"><AppIcon name="fa-folder-open" /></span>
          <div>
            <p class="text-xs text-slate-500 font-medium">Tài liệu đăng bán</p>
            <p class="text-xl font-extrabold text-slate-800">{{ number(data.counts.all) }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="card p-5 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-slate-800"><AppIcon name="fa-clock-rotate-left" class="text-primary-900 mr-2" />Tài liệu gần đây của bạn</h2>
            <NuxtLink to="/dashboard/tai-lieu" class="link text-sm">Xem tất cả</NuxtLink>
          </div>
          <UiEmpty v-if="!data.docs.length" icon="fa-folder-open" title="Bạn chưa đăng tài liệu nào"
            desc="Chia sẻ tài liệu của bạn và nhận 85% doanh thu mỗi lượt bán.">
            <NuxtLink to="/dashboard/dang-ban" class="btn btn-accent"><AppIcon name="fa-cloud-arrow-up" class="mr-2" />Đăng bán ngay</NuxtLink>
          </UiEmpty>
          <div v-else class="overflow-x-auto -mx-5 px-5">
            <table class="w-full text-sm">
              <thead><tr class="text-left border-b border-slate-100">
                <th class="table-th">Tài liệu</th><th class="table-th">Giá</th>
                <th class="table-th">Lượt bán</th><th class="table-th">Trạng thái</th>
              </tr></thead>
              <tbody>
                <tr v-for="d in data.docs" :key="d.id" class="border-b border-slate-50 hover:bg-slate-50/60">
                  <td class="table-td">
                    <NuxtLink :to="`/tai-lieu/${d.slug}`" class="flex items-center gap-3 group">
                      <span class="w-9 h-9 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0" :class="meta(d.subject).gradient">
                        <AppIcon :name="meta(d.subject).icon" class="text-xs" />
                      </span>
                      <span class="min-w-0">
                        <span class="block font-medium text-slate-800 line-clamp-1 group-hover:text-primary-900">{{ d.title }}</span>
                        <span class="text-xs text-slate-400">{{ date(d.created_at) }}</span>
                      </span>
                    </NuxtLink>
                  </td>
                  <td class="table-td font-semibold" :class="d.is_free ? 'text-green-600' : 'text-accent-500'">{{ currency(d.price) }}</td>
                  <td class="table-td">{{ number(d.sold_count) }}</td>
                  <td class="table-td"><span class="badge" :class="statusMeta[d.status]?.cls">{{ statusMeta[d.status]?.label }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-slate-800">
              <AppIcon name="fa-bell" class="text-accent-500 mr-2" />Thông báo
              <span v-if="data.unread" class="badge bg-red-50 text-red-600 ml-1">{{ data.unread }}</span>
            </h2>
            <button v-if="data.unread" class="text-xs link" @click="readAll">Đọc tất cả</button>
          </div>
          <UiEmpty v-if="!data.notis.length" icon="fa-bell-slash" title="Chưa có thông báo" />
          <ul v-else class="space-y-3">
            <li v-for="n in data.notis" :key="n.id" class="flex gap-3 p-3 rounded-xl" :class="n.read ? 'bg-slate-50' : 'bg-primary-50/70'">
              <span class="w-8 h-8 rounded-lg bg-white shadow-sm grid place-items-center text-primary-900 shrink-0"><AppIcon name="fa-circle-info" class="text-xs" /></span>
              <div class="min-w-0">
                <NuxtLink :to="n.link || '/dashboard'" class="block text-sm font-semibold text-slate-800 line-clamp-1 hover:text-primary-900">{{ n.title }}</NuxtLink>
                <p class="text-xs text-slate-500 line-clamp-2 mt-0.5">{{ n.body }}</p>
                <p class="text-[11px] text-slate-400 mt-1">{{ timeAgo(n.created_at) }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="card p-5 mt-6">
        <h2 class="font-bold text-slate-800 mb-4"><AppIcon name="fa-bolt" variant="bold" class="text-accent-500 mr-2" />Thao tác nhanh</h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink to="/dashboard/dang-ban" class="quick"><AppIcon name="fa-cloud-arrow-up" />Đăng bán tài liệu</NuxtLink>
          <NuxtLink to="/tai-lieu" class="quick"><AppIcon name="fa-magnifying-glass" />Tìm tài liệu</NuxtLink>
          <NuxtLink to="/dashboard/doanh-thu" class="quick"><AppIcon name="fa-money-bill-transfer" />Nạp / rút tiền</NuxtLink>
          <NuxtLink to="/dashboard/ho-so" class="quick"><AppIcon name="fa-user-gear" />Cập nhật hồ sơ</NuxtLink>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.quick { @apply flex items-center gap-3 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-primary-900 hover:text-primary-900 hover:bg-primary-50/50 transition; }
</style>
