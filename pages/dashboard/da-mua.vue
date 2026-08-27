<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { money, num, dateTime, ago } = useFormat()
const { statusPill, orderPill, txLabel } = useSubjects()
const page = ref(1)
const { data, pending } = await useFetch<any>('/api/orders', { query: computed(() => ({ page: page.value, limit: 12, role: 'buyer', status: 'paid' })) })
useHead({ title: 'Kho của tôi - MapDocs' })
</script>
<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/dashboard" class="hover:text-mdk-sub">Dashboard</NuxtLink> / <span class="text-mdk-sub">Kho của tôi</span></nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Kho của tôi</h1>
    <p class="mt-1 text-[13px] text-mdk-mute">Tổng {{ data?.total || 0 }} bản ghi</p>
    <div class="mt-6 card overflow-hidden">
      <slot />
      <div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Nội dung</th><th>Thông tin</th><th>Thời gian</th></tr></thead>
      <tbody>
        <tr v-for="it in data?.items || []" :key="it.id">
          <td class="text-[13px] text-mdk-text max-w-[380px]"><span class="line-clamp-1">{{ it.title || it.document?.title || it.note || it.code || it.id }}</span></td>
          <td class="text-[13px] tabular-nums">{{ it.amount !== undefined ? money(it.amount) : it.price !== undefined ? (it.price ? money(it.price) : 'Miễn phí') : '—' }}</td>
          <td class="text-[12.5px] text-mdk-mute whitespace-nowrap">{{ ago(it.created_at) }}</td>
        </tr>
      </tbody></table></div>
      <UiEmpty v-if="!pending && !data?.items?.length" compact title="Chưa có dữ liệu" description="Dữ liệu sẽ xuất hiện khi bạn bắt đầu sử dụng." />
    </div>
    <div v-if="(data?.pages || 1) > 1" class="mt-6 flex items-center justify-center gap-2">
      <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
      <span class="text-[13px] text-mdk-sub px-2">{{ page }} / {{ data?.pages }}</span>
      <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
    </div>
  </div>
</template>
