<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth', middleware: 'auth' })
const route = useRoute(); const router = useRouter(); const auth = useAuthStore()
const busy = ref(false)
const code = computed(() => String(route.query.code || ''))
async function pay(success: boolean) {
  busy.value = true
  try {
    await $fetch('/api/orders/confirm', { method: 'POST', body: { code: code.value, success } })
    await auth.refresh()
    await router.push(`/thanh-toan/ket-qua?code=${code.value}&status=${success ? 'success' : 'failed'}`)
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false }
}
useHead({ title: 'Cổng thanh toán giả lập - MapDocs' })
</script>
<template>
  <div>
    <div class="w-12 h-12 rounded-xl grid place-items-center bg-primary-600/16 text-primary-400"><AppIcon name="solar:card-bold-duotone" size="26" /></div>
    <h1 class="mt-4 text-[24px] font-extrabold text-white font-ui tracking-tight">Cổng thanh toán giả lập</h1>
    <p class="mt-2 text-[13.5px] text-zinc-500 leading-relaxed">Đây là cổng mô phỏng dùng khi chưa cấu hình VNPay. Chọn kết quả bạn muốn thử.</p>
    <div class="mt-6 rounded-xl border border-mdk-line bg-mdk-soft p-4">
      <p class="text-[11px] font-bold text-mdk-mute uppercase tracking-wider">Mã đơn hàng</p>
      <p class="mt-1 text-[17px] font-bold text-white font-ui tabular-nums">{{ code || '—' }}</p>
    </div>
    <div class="mt-6 space-y-2.5">
      <button class="btn-primary w-full btn-lg" :disabled="busy || !code" @click="pay(true)"><AppIcon name="solar:check-circle-bold" size="18" /> Thanh toán thành công</button>
      <button class="btn-outline w-full" :disabled="busy || !code" @click="pay(false)">Mô phỏng thất bại</button>
    </div>
  </div>
</template>
