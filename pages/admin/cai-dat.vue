<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Cài đặt hệ thống — MapDocs Admin' })

const ui = useUiStore()
const { currency } = useFormat()

const { data, pending, refresh } = await useAsyncData('admin-settings', () => $fetch<any>('/api/admin/settings'))

const form = reactive({
  commission_pct: 15,
  min_withdraw: 200000,
  min_price: 10000,
  max_file_mb: 50,
  hotline: '',
  email: '',
  address: '',
  facebook: ''
})

const hydrate = () => {
  const s = data.value?.data
  if (!s) return
  form.commission_pct = Math.round((Number(s.commission_rate) || 0) * 1000) / 10
  form.min_withdraw = Number(s.min_withdraw) || 0
  form.min_price = Number(s.min_price) || 0
  form.max_file_mb = Number(s.max_file_mb) || 50
  form.hotline = s.hotline || ''
  form.email = s.email || ''
  form.address = s.address || ''
  form.facebook = s.facebook || ''
}
watchEffect(hydrate)

const busy = ref(false)

const sellerPct = computed(() => Math.max(0, 100 - (Number(form.commission_pct) || 0)))
const demoPrice = 100000
const demoCommission = computed(() => Math.round(demoPrice * (Number(form.commission_pct) || 0) / 100))
const demoSeller = computed(() => demoPrice - demoCommission.value)

const save = async () => {
  const pct = Number(form.commission_pct)
  if (isNaN(pct) || pct < 0 || pct > 50) return ui.error('Hoa hồng phải trong khoảng 0% – 50%')
  if (Number(form.min_withdraw) < 0) return ui.error('Số tiền rút tối thiểu không hợp lệ')
  if (Number(form.min_price) < 0) return ui.error('Giá bán tối thiểu không hợp lệ')
  if (Number(form.max_file_mb) < 1) return ui.error('Dung lượng file tối đa phải ≥ 1MB')

  busy.value = true
  try {
    const res = await $fetch<any>('/api/admin/settings', {
      method: 'POST',
      body: {
        commission_rate: pct / 100,
        min_withdraw: Number(form.min_withdraw),
        min_price: Number(form.min_price),
        max_file_mb: Number(form.max_file_mb),
        hotline: form.hotline.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        facebook: form.facebook.trim()
      }
    })
    ui.success(res.message || 'Đã lưu cài đặt')
    await refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể lưu cài đặt')
  } finally {
    busy.value = false
  }
}

const reset = () => { hydrate(); ui.toast('Đã khôi phục giá trị đang lưu', 'info') }
</script>

<template>
  <div class="space-y-5 max-w-5xl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Cài đặt hệ thống</h2>
        <p class="text-sm text-slate-500 mt-0.5">Thiết lập chính sách vận hành và thông tin liên hệ của MapDocs</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" :disabled="busy || pending" @click="reset">
          <i class="fa-solid fa-rotate-left" /> Khôi phục
        </button>
        <button class="btn btn-primary btn-sm" :disabled="busy || pending" @click="save">
          <i v-if="busy" class="fa-solid fa-spinner fa-spin" /><i v-else class="fa-solid fa-floppy-disk" /> Lưu cài đặt
        </button>
      </div>
    </div>

    <div v-if="pending" class="card p-10 text-center text-slate-400">
      <UiSpinner /> <span class="ml-2 text-sm">Đang tải cài đặt…</span>
    </div>

    <template v-else>
      <!-- Business rules -->
      <section class="card p-5">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-primary-50 text-primary-900 grid place-items-center"><i class="fa-solid fa-percent" /></span>
          Chính sách kinh doanh
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          <div class="space-y-4">
            <div>
              <label class="label">Tỷ lệ hoa hồng nền tảng (%)</label>
              <div class="flex items-center gap-3">
                <input v-model.number="form.commission_pct" type="range" min="0" max="50" step="0.5"
                  class="flex-1 accent-[#ff8412]" >
                <div class="relative w-24 shrink-0">
                  <input v-model.number="form.commission_pct" type="number" min="0" max="50" step="0.5" class="input pr-7 text-center font-bold" >
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-1.5">
                Nền tảng giữ <strong class="text-accent-500">{{ form.commission_pct }}%</strong>,
                người bán nhận <strong class="text-emerald-600">{{ sellerPct }}%</strong> mỗi giao dịch. Tối đa 50%.
              </p>
            </div>

            <div>
              <label class="label">Số tiền rút tối thiểu (đ)</label>
              <input v-model.number="form.min_withdraw" type="number" min="0" step="10000" class="input" >
              <p class="text-xs text-slate-500 mt-1">Hiện tại: {{ currency(form.min_withdraw) }}</p>
            </div>

            <div>
              <label class="label">Giá bán tối thiểu (đ)</label>
              <input v-model.number="form.min_price" type="number" min="0" step="1000" class="input" >
              <p class="text-xs text-slate-500 mt-1">Hiện tại: {{ currency(form.min_price) }} — không áp dụng cho tài liệu miễn phí.</p>
            </div>

            <div>
              <label class="label">Dung lượng file tối đa (MB)</label>
              <input v-model.number="form.max_file_mb" type="number" min="1" max="500" class="input" >
              <p class="text-xs text-slate-500 mt-1">Giới hạn cho mỗi tài liệu người bán tải lên.</p>
            </div>
          </div>

          <!-- Preview -->
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="text-sm font-semibold text-slate-700">Mô phỏng phân chia doanh thu</div>
            <p class="text-xs text-slate-500 mt-0.5">Với một tài liệu giá {{ currency(demoPrice) }}</p>

            <div class="mt-4 h-3 rounded-full overflow-hidden flex bg-slate-200">
              <div class="bg-accent-500 transition-all" :style="{ width: form.commission_pct + '%' }" />
              <div class="bg-emerald-500 transition-all" :style="{ width: sellerPct + '%' }" />
            </div>

            <div class="space-y-2.5 mt-4">
              <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                <span class="text-sm text-slate-600 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-accent-500" /> Nền tảng ({{ form.commission_pct }}%)
                </span>
                <strong class="text-accent-500">{{ currency(demoCommission) }}</strong>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                <span class="text-sm text-slate-600 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Người bán ({{ sellerPct }}%)
                </span>
                <strong class="text-emerald-600">{{ currency(demoSeller) }}</strong>
              </div>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <i class="fa-solid fa-triangle-exclamation mr-1" />
              Thay đổi hoa hồng chỉ áp dụng cho các giao dịch phát sinh sau khi lưu.
            </div>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section class="card p-5">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-accent-50 text-accent-500 grid place-items-center"><i class="fa-solid fa-address-book" /></span>
          Thông tin liên hệ
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="label"><i class="fa-solid fa-phone mr-1.5 text-slate-400" />Hotline</label>
            <input v-model="form.hotline" type="text" class="input" maxlength="200" placeholder="1900 6789" >
          </div>
          <div>
            <label class="label"><i class="fa-solid fa-envelope mr-1.5 text-slate-400" />Email hỗ trợ</label>
            <input v-model="form.email" type="email" class="input" maxlength="200" placeholder="hotro@mapdocs.vn" >
          </div>
          <div class="md:col-span-2">
            <label class="label"><i class="fa-solid fa-location-dot mr-1.5 text-slate-400" />Địa chỉ</label>
            <input v-model="form.address" type="text" class="input" maxlength="200" placeholder="Số nhà, đường, quận, thành phố" >
          </div>
          <div class="md:col-span-2">
            <label class="label"><i class="fa-brands fa-facebook mr-1.5 text-slate-400" />Fanpage Facebook</label>
            <input v-model="form.facebook" type="url" class="input" maxlength="200" placeholder="https://facebook.com/mapdocs" >
          </div>
        </div>
      </section>

      <div class="flex justify-end gap-2 pb-2">
        <button class="btn btn-outline btn-sm" :disabled="busy" @click="reset">Khôi phục</button>
        <button class="btn btn-primary" :disabled="busy" @click="save">
          <i v-if="busy" class="fa-solid fa-spinner fa-spin" /><i v-else class="fa-solid fa-floppy-disk" /> Lưu cài đặt
        </button>
      </div>
    </template>
  </div>
</template>
