<script setup lang="ts">
definePageMeta({ layout: 'auth', authTitle: 'Kết quả thanh toán', authSubtitle: 'Thông tin giao dịch vừa thực hiện.', authIcon: 'solar:bill-check-bold' })
const route = useRoute()
const ok = computed(() => String(route.query.status || 'success') === 'success')
useHead({ title: 'Kết quả thanh toán - MapDocs' })
</script>
<template>
  <div class="text-center">
    <div class="w-16 h-16 mx-auto rounded-2xl grid place-items-center success-check" :class="ok ? 'bg-emerald-500/16 text-emerald-400' : 'bg-rose-500/16 text-rose-400'">
      <AppIcon :name="ok ? 'solar:check-circle-bold' : 'solar:close-circle-bold'" size="36" />
    </div>
    <h1 class="mt-5 text-[24px] font-extrabold text-white font-ui tracking-tight">{{ ok ? 'Thanh toán thành công' : 'Thanh toán thất bại' }}</h1>
    <p class="mt-2.5 text-[13.5px] text-zinc-500 leading-relaxed">
      {{ ok ? 'Tài liệu đã được thêm vào kho của bạn. Bạn có thể tải về ngay bây giờ.' : 'Giao dịch không hoàn tất. Vui lòng thử lại hoặc chọn phương thức khác.' }}
    </p>
    <div class="mt-4 rounded-xl border border-mdk-line bg-mdk-soft p-3.5">
      <p class="text-[11px] font-bold text-mdk-mute uppercase tracking-wider">Mã đơn hàng</p>
      <p class="mt-1 text-[15px] font-bold text-white font-ui tabular-nums">{{ route.query.code || '—' }}</p>
    </div>
    <div class="mt-6 space-y-2.5">
      <NuxtLink to="/dashboard/da-mua" class="btn-primary w-full btn-lg">Xem kho của tôi</NuxtLink>
      <NuxtLink to="/tai-lieu" class="btn-outline w-full">Tiếp tục khám phá</NuxtLink>
    </div>
  </div>
</template>
