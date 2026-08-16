<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Cổng thanh toán — MapDocs', robots: 'noindex' })

const route = useRoute()
const ui = useUiStore()
const auth = useAuthStore()
const { currency } = useFormat()

const code = computed(() => String(route.query.code || ''))
const amount = computed(() => Number(route.query.amount) || 0)
const method = computed(() => String(route.query.method || 'vnpay'))

const METHODS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  vnpay: { label: 'VNPay', icon: 'fa-credit-card', color: 'from-blue-600 to-blue-800', desc: 'Thẻ ATM nội địa / Internet Banking' },
  momo: { label: 'Ví MoMo', icon: 'fa-mobile-screen-button', color: 'from-pink-600 to-pink-800', desc: 'Thanh toán qua ứng dụng MoMo' },
  stripe: { label: 'Stripe', icon: 'fa-credit-card', color: 'from-indigo-600 to-violet-800', desc: 'Thẻ quốc tế Visa / Mastercard' }
}
const gateway = computed(() => METHODS[method.value] || METHODS.vnpay)

// Lấy thông tin đơn hàng để hiển thị tên tài liệu
const { data: orderData } = await useAsyncData('sim-order', async () => {
  if (!code.value) return null
  try {
    const res = await $fetch<any>('/api/orders', { query: { limit: 50 } })
    return (res?.data?.items || []).find((o: any) => o.code === code.value) || null
  } catch {
    return null
  }
})

const docTitle = computed(() => orderData.value?.document_title || orderData.value?.document?.title || 'Tài liệu học tập')

const busy = ref(false)
const countdown = ref(600) // 10 phút
let timer: any = null

onMounted(() => {
  if (!code.value) {
    ui.error('Thiếu mã đơn hàng')
    return navigateTo('/dashboard/da-mua')
  }
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    else clearInterval(timer)
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const mmss = computed(() => {
  const m = Math.floor(countdown.value / 60).toString().padStart(2, '0')
  const s = (countdown.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const finish = async (result: 'success' | 'cancel') => {
  if (busy.value) return
  busy.value = true
  try {
    const res = await $fetch<any>('/api/orders/confirm', { method: 'POST', body: { code: code.value, result } })
    if (res.success) {
      ui.success(res.message || 'Thanh toán thành công!')
      await auth.fetchMe().catch(() => {})
      await navigateTo(`/thanh-toan/ket-qua?vnp_ResponseCode=00&vnp_TxnRef=${code.value}&vnp_Amount=${amount.value}`)
    } else {
      ui.error(res.message || 'Thanh toán bị huỷ')
      await navigateTo(`/thanh-toan/ket-qua?vnp_ResponseCode=24&vnp_TxnRef=${code.value}&vnp_Amount=${amount.value}`)
    }
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể xử lý thanh toán')
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-lg">
      <!-- Sandbox notice -->
      <div class="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
        <AppIcon name="fa-flask" class="mt-0.5" />
        <span>
          <strong>Chế độ giả lập (Sandbox)</strong> — đây là cổng thanh toán mô phỏng dùng cho môi trường thử nghiệm.
          Không có giao dịch tiền thật nào được thực hiện.
        </span>
      </div>

      <div class="bg-white rounded-2xl shadow-card overflow-hidden">
        <!-- Gateway header -->
        <div class="bg-gradient-to-br text-white p-6" :class="gateway.color">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-12 h-12 rounded-xl bg-white/20 grid place-items-center text-2xl">
                <AppIcon :name="gateway.icon" />
              </span>
              <div>
                <div class="font-extrabold text-lg">{{ gateway.label }}</div>
                <div class="text-white/75 text-xs">{{ gateway.desc }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-white/70 text-xs">Hết hạn sau</div>
              <div class="font-mono font-bold text-lg">{{ mmss }}</div>
            </div>
          </div>
        </div>

        <!-- Order info -->
        <div class="p-6 space-y-3">
          <div class="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span class="text-sm text-slate-500">Mã đơn hàng</span>
            <span class="font-mono font-bold text-primary-900">{{ code }}</span>
          </div>
          <div class="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100">
            <span class="text-sm text-slate-500 shrink-0">Tài liệu</span>
            <span class="font-semibold text-slate-800 text-right line-clamp-2">{{ docTitle }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span class="text-sm text-slate-500">Người thanh toán</span>
            <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span class="text-sm text-slate-500">Phương thức</span>
            <span class="font-medium text-slate-700">{{ gateway.label }}</span>
          </div>

          <div class="flex items-center justify-between pt-3">
            <span class="font-semibold text-slate-700">Tổng thanh toán</span>
            <span class="text-2xl font-extrabold text-accent-500">{{ currency(amount) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 pb-6 space-y-2.5">
          <button class="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-60 flex items-center justify-center gap-2"
            :disabled="busy || countdown === 0" @click="finish('success')">
            <AppIcon name="fa-spinner" v-if="busy" /><AppIcon name="fa-circle-check" variant="bold" v-else />
            Xác nhận thanh toán
          </button>
          <button class="w-full h-12 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition disabled:opacity-60 flex items-center justify-center gap-2"
            :disabled="busy" @click="finish('cancel')">
            <AppIcon name="fa-circle-xmark" /> Huỷ giao dịch
          </button>
          <p v-if="countdown === 0" class="text-center text-sm text-red-600 pt-1">
            <AppIcon name="fa-triangle-exclamation" class="mr-1" />Phiên thanh toán đã hết hạn. Vui lòng tạo đơn mới.
          </p>
        </div>

        <div class="bg-slate-50 px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
          <AppIcon name="fa-lock" class="mr-1" /> Giao dịch được bảo mật bởi MapDocs · Hotline 1900 6789
        </div>
      </div>

      <div class="text-center mt-4">
        <NuxtLink to="/dashboard" class="text-sm text-slate-500 hover:text-primary-900">
          <AppIcon name="fa-arrow-left" class="mr-1" /> Quay lại trang cá nhân
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
