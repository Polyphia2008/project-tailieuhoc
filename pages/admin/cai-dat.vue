<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { money, percent } = useFormat()

const { data, refresh } = await useFetch<any>('/api/admin/settings')

const f = reactive({
  commission_rate: 0.15,
  min_withdraw: 200000,
  min_price: 10000,
  max_file_mb: 50,
  hotline: '',
  email: '',
  address: '',
  facebook: '',
  maintenance: false,
  maintenance_note: '',
  banner_enabled: false,
  banner_text: ''
})

function load() {
  const s = data.value?.settings || {}
  f.commission_rate = Number(s.commission_rate ?? 0.15)
  f.min_withdraw = Number(s.min_withdraw ?? 200000)
  f.min_price = Number(s.min_price ?? 10000)
  f.max_file_mb = Number(s.max_file_mb ?? 50)
  f.hotline = String(s.hotline ?? '')
  f.email = String(s.email ?? '')
  f.address = String(s.address ?? '')
  f.facebook = String(s.facebook ?? '')
  f.maintenance = Boolean(s.maintenance)
  f.maintenance_note = String(s.maintenance_note ?? '')
  f.banner_enabled = Boolean(s.banner_enabled)
  f.banner_text = String(s.banner_text ?? '')
}

load()

const busy = ref(false)

async function save() {
  busy.value = true
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...f } })
    await refresh()
    load()
    toast.success('Đã lưu cài đặt hệ thống')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không lưu được cài đặt')
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Cài đặt - MapDocs Admin' })
</script>

<template>
  <div class="max-w-[840px] pb-24">
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Cài đặt</span>
    </nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Cài đặt hệ thống</h1>
    <p class="mt-1 text-[13px] text-mdk-mute">Cấu hình phí, liên hệ, bảo trì và thông báo toàn hệ thống.</p>

    <section class="mt-6 card p-5">
      <div class="flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-lg grid place-items-center bg-primary-500/15 text-primary-400">
          <AppIcon name="solar:server-square-bold-duotone" size="19" />
        </span>
        <div>
          <h2 class="text-[15px] font-bold text-mdk-text font-ui">Trạng thái lưu trữ</h2>
          <p class="text-[12px] text-mdk-mute">Thông tin chỉ đọc về hạ tầng đang dùng</p>
        </div>
      </div>
      <div class="mt-4 grid sm:grid-cols-2 gap-3">
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
    </section>

    <section class="mt-5 card p-5">
      <div class="flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-lg grid place-items-center bg-accent-500/15 text-accent-400">
          <AppIcon name="solar:percent-square-bold-duotone" size="19" />
        </span>
        <div>
          <h2 class="text-[15px] font-bold text-mdk-text font-ui">Phí & giới hạn</h2>
          <p class="text-[12px] text-mdk-mute">Hoa hồng hiện tại {{ percent(f.commission_rate) }} · rút tối thiểu {{ money(f.min_withdraw) }}</p>
        </div>
      </div>
      <div class="mt-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label class="label">Tỷ lệ hoa hồng (0 - 0.5)</label>
          <input v-model.number="f.commission_rate" type="number" step="0.01" min="0" max="0.5" class="input" />
        </div>
        <div>
          <label class="label">Rút tối thiểu (đ)</label>
          <input v-model.number="f.min_withdraw" type="number" step="10000" min="0" class="input" />
        </div>
        <div>
          <label class="label">Giá bán tối thiểu (đ)</label>
          <input v-model.number="f.min_price" type="number" step="1000" min="0" class="input" />
        </div>
        <div>
          <label class="label">Dung lượng file tối đa (MB)</label>
          <input v-model.number="f.max_file_mb" type="number" min="1" max="500" class="input" />
        </div>
      </div>
    </section>

    <section class="mt-5 card p-5">
      <div class="flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-lg grid place-items-center bg-emerald-500/15 text-emerald-400">
          <AppIcon name="solar:phone-calling-bold-duotone" size="19" />
        </span>
        <div>
          <h2 class="text-[15px] font-bold text-mdk-text font-ui">Thông tin liên hệ</h2>
          <p class="text-[12px] text-mdk-mute">Hiển thị ở footer và trang liên hệ</p>
        </div>
      </div>
      <div class="mt-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label class="label">Hotline</label>
          <input v-model="f.hotline" class="input" placeholder="1900 6868" />
        </div>
        <div>
          <label class="label">Email hỗ trợ</label>
          <input v-model="f.email" type="email" class="input" placeholder="hotro@mapdocs.vn" />
        </div>
        <div class="sm:col-span-2">
          <label class="label">Địa chỉ</label>
          <input v-model="f.address" class="input" />
        </div>
        <div class="sm:col-span-2">
          <label class="label">Facebook</label>
          <input v-model="f.facebook" class="input" placeholder="https://facebook.com/..." />
        </div>
      </div>
    </section>

    <section class="mt-5 card p-5">
      <div class="flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-lg grid place-items-center bg-amber-500/15 text-amber-400">
          <AppIcon name="solar:settings-minimalistic-bold-duotone" size="19" />
        </span>
        <div>
          <h2 class="text-[15px] font-bold text-mdk-text font-ui">Chế độ bảo trì</h2>
          <p class="text-[12px] text-mdk-mute">Tạm dừng truy cập để nâng cấp hệ thống</p>
        </div>
      </div>
      <label class="mt-4 flex items-center gap-3 cursor-pointer rounded-xl border border-mdk-line bg-mdk-soft p-3.5">
        <span class="switch" :class="f.maintenance ? 'switch-on' : ''" @click.prevent="f.maintenance = !f.maintenance">
          <span class="switch-dot" :class="f.maintenance ? 'translate-x-5' : 'translate-x-0'" />
        </span>
        <span>
          <span class="block text-[13.5px] font-medium text-mdk-text">Bật chế độ bảo trì</span>
          <span class="block text-[12px] text-mdk-mute mt-0.5">Người dùng thường sẽ thấy trang thông báo bảo trì</span>
        </span>
        <span class="ml-auto" :class="f.maintenance ? 'pill-red' : 'pill-green'">{{ f.maintenance ? 'Đang bảo trì' : 'Hoạt động' }}</span>
      </label>
      <div class="mt-3">
        <label class="label">Lý do bảo trì</label>
        <textarea v-model="f.maintenance_note" rows="2" class="textarea" placeholder="Hệ thống đang được nâng cấp..." />
      </div>
    </section>

    <section class="mt-5 card p-5">
      <div class="flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-lg grid place-items-center bg-purple-500/15 text-purple-400">
          <AppIcon name="solar:bell-bing-bold-duotone" size="19" />
        </span>
        <div>
          <h2 class="text-[15px] font-bold text-mdk-text font-ui">Thông báo banner</h2>
          <p class="text-[12px] text-mdk-mute">Dải thông báo hiển thị trên đầu trang công khai</p>
        </div>
      </div>
      <label class="mt-4 flex items-center gap-3 cursor-pointer rounded-xl border border-mdk-line bg-mdk-soft p-3.5">
        <span class="switch" :class="f.banner_enabled ? 'switch-on' : ''" @click.prevent="f.banner_enabled = !f.banner_enabled">
          <span class="switch-dot" :class="f.banner_enabled ? 'translate-x-5' : 'translate-x-0'" />
        </span>
        <span>
          <span class="block text-[13.5px] font-medium text-mdk-text">Hiển thị banner</span>
          <span class="block text-[12px] text-mdk-mute mt-0.5">Dùng cho khuyến mãi hoặc thông báo quan trọng</span>
        </span>
      </label>
      <div class="mt-3">
        <label class="label">Nội dung banner</label>
        <textarea v-model="f.banner_text" rows="2" class="textarea" placeholder="Giảm 20% cho đơn đầu tiên..." />
      </div>
      <div v-if="f.banner_enabled && f.banner_text" class="mt-3 rounded-xl px-4 py-3 text-[13px] font-medium text-white" style="background: linear-gradient(120deg,#0369a1,#0ea5e9 60%,#38bdf8)">
        {{ f.banner_text }}
      </div>
    </section>

    <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-mdk-line bg-mdk-panel/95 backdrop-blur px-4 py-3">
      <div class="mx-auto max-w-[840px] flex items-center justify-between gap-3 lg:pl-[248px]">
        <p class="text-[12.5px] text-mdk-mute">Thay đổi áp dụng ngay sau khi lưu</p>
        <div class="flex items-center gap-2">
          <button class="btn-outline btn-sm" :disabled="busy" @click="load()">Hoàn tác</button>
          <button class="btn-primary" :disabled="busy" @click="save">
            <UiSpinner v-if="busy" :size="17" />
            <AppIcon v-else name="solar:diskette-bold" size="17" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
