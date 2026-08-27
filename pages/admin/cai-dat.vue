<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data, refresh } = await useFetch<any>('/api/admin/settings')
const f = reactive({ ...(data.value?.settings || {}) })
const busy = ref(false)
async function save() {
  busy.value = true
  try { await $fetch('/api/admin/settings', { method: 'POST', body: f }); await refresh(); toast.success('Đã lưu cài đặt hệ thống') }
  catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false }
}
useHead({ title: 'Cài đặt - MapDocs Admin' })
</script>
<template>
  <div class="max-w-[760px]">
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Cài đặt</span></nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Cài đặt hệ thống</h1>

    <div class="mt-6 card p-5">
      <h2 class="text-[15px] font-bold text-mdk-text font-ui">Trạng thái lưu trữ</h2>
      <div class="mt-3.5 grid sm:grid-cols-2 gap-3">
        <div class="rounded-xl border border-mdk-line bg-mdk-soft p-4">
          <p class="text-[11px] font-bold text-mdk-mute uppercase tracking-wider">Cloudflare R2</p>
          <p class="mt-1.5 text-[14px] font-semibold" :class="data?.storage?.configured ? 'text-emerald-400' : 'text-amber-400'">
            {{ data?.storage?.configured ? `Đã kết nối (${data.storage.bucket})` : 'Chưa cấu hình — dùng in-memory' }}
          </p>
          <p class="mt-1 text-[11.5px] text-mdk-mute">Kind: {{ data?.storage?.kind }}</p>
        </div>
        <div class="rounded-xl border border-mdk-line bg-mdk-soft p-4">
          <p class="text-[11px] font-bold text-mdk-mute uppercase tracking-wider">Database driver</p>
          <p class="mt-1.5 text-[14px] font-semibold text-primary-400">{{ data?.database?.kind === 'r2' ? 'R2 JSON persist' : 'In-memory (mock)' }}</p>
          <p class="mt-1 text-[11.5px] text-mdk-mute">Thêm env R2_* vào .env để chuyển sang R2 thật</p>
        </div>
      </div>
    </div>

    <form class="mt-5 card p-5 space-y-4" @submit.prevent="save">
      <h2 class="text-[15px] font-bold text-mdk-text font-ui">Cấu hình kinh doanh</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Tỷ lệ hoa hồng (0 - 0.5)</label><input v-model.number="f.commission_rate" type="number" step="0.01" min="0" max="0.5" class="input" /></div>
        <div><label class="label">Rút tối thiểu (đ)</label><input v-model.number="f.min_withdraw" type="number" step="10000" class="input" /></div>
        <div><label class="label">Giá bán tối thiểu (đ)</label><input v-model.number="f.min_price" type="number" step="1000" class="input" /></div>
        <div><label class="label">Dung lượng file tối đa (MB)</label><input v-model.number="f.max_file_mb" type="number" min="1" max="500" class="input" /></div>
      </div>
      <h2 class="text-[15px] font-bold text-mdk-text font-ui pt-4 border-t border-mdk-line">Thông tin liên hệ</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Hotline</label><input v-model="f.hotline" class="input" /></div>
        <div><label class="label">Email hỗ trợ</label><input v-model="f.email" class="input" /></div>
        <div class="sm:col-span-2"><label class="label">Địa chỉ</label><input v-model="f.address" class="input" /></div>
        <div class="sm:col-span-2"><label class="label">Facebook</label><input v-model="f.facebook" class="input" /></div>
      </div>
      <button type="submit" class="btn-primary" :disabled="busy"><UiSpinner v-if="busy" :size="17" /> Lưu cài đặt</button>
    </form>
  </div>
</template>
