<script setup lang="ts">
useSeoMeta({ title: 'Kết quả thanh toán — MapDocs', robots: 'noindex' })

const route = useRoute()
const { currency, dateTime } = useFormat()

const respCode = computed(() => String(route.query.vnp_ResponseCode ?? route.query.code ?? '00'))
const txnRef = computed(() => String(route.query.vnp_TxnRef ?? route.query.order ?? ''))
const amount = computed(() => Number(route.query.vnp_Amount) || 0)

const ok = computed(() => respCode.value === '00')

const REASONS: Record<string, string> = {
  '00': 'Giao dịch thành công',
  '07': 'Giao dịch bị nghi ngờ gian lận',
  '09': 'Thẻ/Tài khoản chưa đăng ký Internet Banking',
  '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
  '11': 'Đã hết hạn chờ thanh toán',
  '12': 'Thẻ/Tài khoản bị khoá',
  '24': 'Khách hàng huỷ giao dịch',
  '51': 'Tài khoản không đủ số dư',
  '65': 'Tài khoản vượt hạn mức giao dịch trong ngày',
  '75': 'Ngân hàng thanh toán đang bảo trì',
  '99': 'Lỗi không xác định'
}
const reason = computed(() => REASONS[respCode.value] || 'Giao dịch không thành công')

const now = new Date().toISOString()
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-card overflow-hidden text-center">
        <!-- Banner -->
        <div class="p-8 bg-gradient-to-br" :class="ok ? 'from-emerald-500 to-emerald-700' : 'from-red-500 to-red-700'">
          <div class="w-20 h-20 rounded-full bg-white/20 grid place-items-center mx-auto text-white text-4xl">
            <AppIcon :name="ok ? 'fa-circle-check' : 'fa-circle-xmark'" />
          </div>
          <h1 class="text-2xl font-extrabold text-white mt-4">
            {{ ok ? 'Thanh toán thành công!' : 'Thanh toán thất bại' }}
          </h1>
          <p class="text-white/85 text-sm mt-2">
            {{ ok ? 'Tài liệu đã được thêm vào thư viện của bạn.' : reason }}
          </p>
        </div>

        <!-- Details -->
        <div class="p-6 space-y-3 text-left">
          <div v-if="txnRef" class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-sm text-slate-500">Mã đơn hàng</span>
            <span class="font-mono font-bold text-primary-900">{{ txnRef }}</span>
          </div>
          <div v-if="amount" class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-sm text-slate-500">Số tiền</span>
            <span class="font-bold text-slate-800">{{ currency(amount) }}</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-sm text-slate-500">Mã phản hồi</span>
            <span class="font-mono text-sm" :class="ok ? 'text-emerald-600' : 'text-red-600'">{{ respCode }}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-slate-500">Thời gian</span>
            <span class="text-sm font-medium text-slate-700">{{ dateTime(now) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 pb-6 space-y-2.5">
          <template v-if="ok">
            <NuxtLink to="/dashboard/da-mua" class="btn btn-primary w-full justify-center">
              <AppIcon name="fa-download" /> Xem tài liệu đã mua
            </NuxtLink>
            <NuxtLink to="/tai-lieu" class="btn btn-outline w-full justify-center">
              <AppIcon name="fa-book-open" /> Tiếp tục khám phá
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/tai-lieu" class="btn btn-primary w-full justify-center">
              <AppIcon name="fa-rotate-right" /> Thử mua lại
            </NuxtLink>
            <NuxtLink to="/dashboard" class="btn btn-outline w-full justify-center">
              <AppIcon name="fa-gauge" /> Về trang cá nhân
            </NuxtLink>
          </template>
        </div>

        <div class="bg-slate-50 px-6 py-4 text-xs text-slate-500 border-t border-slate-100">
          Cần hỗ trợ? Liên hệ <a href="tel:19006789" class="link">1900 6789</a> hoặc
          <a href="mailto:hotro@mapdocs.vn" class="link">hotro@mapdocs.vn</a>
        </div>
      </div>
    </div>
  </div>
</template>
