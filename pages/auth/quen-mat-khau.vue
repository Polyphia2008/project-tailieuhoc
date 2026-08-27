<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth' })
const email = ref(''); const busy = ref(false); const sent = ref(false); const link = ref('')
async function submit() {
  busy.value = true
  try {
    const r = await $fetch<any>('/api/auth/forgot', { method: 'POST', body: { email: email.value } })
    sent.value = true; link.value = r.dev_link || ''
    toast.success('Đã gửi hướng dẫn đặt lại mật khẩu')
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false }
}
useHead({ title: 'Quên mật khẩu - MapDocs' })
</script>
<template>
  <div>
    <h1 class="text-[26px] font-extrabold text-white font-ui tracking-tight">Quên mật khẩu</h1>
    <p class="mt-2 text-[13.5px] text-zinc-500">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
    <form v-if="!sent" class="mt-7 space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Email</label>
        <div class="relative">
          <AppIcon name="solar:letter-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="email" type="email" required placeholder="ban@email.com" class="input pl-10" />
        </div>
      </div>
      <button type="submit" class="btn-primary w-full btn-lg" :disabled="busy"><UiSpinner v-if="busy" :size="17" /> Gửi liên kết</button>
    </form>
    <div v-else class="mt-7 rounded-xl border border-emerald-500/25 bg-emerald-500/[.07] p-5">
      <AppIcon name="solar:check-circle-bold" size="30" class="text-emerald-400" />
      <p class="mt-3 text-[14.5px] font-semibold text-white font-ui">Đã gửi thành công</p>
      <p class="mt-1.5 text-[13px] text-zinc-400 leading-relaxed">Vui lòng kiểm tra hộp thư của bạn. Ở chế độ demo, bạn có thể dùng liên kết bên dưới.</p>
      <NuxtLink v-if="link" :to="link" class="btn-primary btn-sm mt-3.5">Đặt lại mật khẩu ngay</NuxtLink>
    </div>
    <NuxtLink to="/auth/dang-nhap" class="mt-6 inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-white transition">
      <AppIcon name="solar:arrow-left-linear" size="15" /> Về trang đăng nhập
    </NuxtLink>
  </div>
</template>
