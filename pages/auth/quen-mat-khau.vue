<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const ui = useUiStore()
const email = ref('')
const busy = ref(false)
const sent = ref(false)
const devLink = ref('')

async function submit() {
  if (!email.value.trim()) return ui.error('Vui lòng nhập email')
  busy.value = true
  try {
    const res = await $fetch<any>('/api/auth/forgot', { method: 'POST', body: { email: email.value.trim() } })
    sent.value = true
    devLink.value = res?.devResetLink || ''
    ui.success(res?.message || 'Đã gửi yêu cầu')
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể gửi yêu cầu')
  } finally { busy.value = false }
}
useSeoMeta({ title: 'Quên mật khẩu - MapDocs' })
</script>

<template>
  <div id="forgot-page">
    <h1 class="text-2xl font-extrabold text-slate-800">Quên mật khẩu</h1>
    <p class="text-slate-500 mt-1 mb-6">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="forgot-email">Email</label>
        <input id="forgot-email" v-model="email" type="email" class="input" placeholder="email@example.com" />
      </div>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <AppIcon name="fa-spinner" class="mr-2" v-if="busy" /><AppIcon name="fa-paper-plane" class="mr-2" v-else />Gửi yêu cầu
      </button>
    </form>

    <div v-if="sent" class="mt-5 p-4 rounded-xl bg-green-50 border border-green-200 text-sm">
      <p class="text-green-800 font-medium"><AppIcon name="fa-circle-check" variant="bold" class="mr-1" />Yêu cầu đã được gửi!</p>
      <div v-if="devLink" class="mt-2">
        <p class="text-slate-600 text-xs mb-2">Chế độ demo — dùng liên kết dưới đây để đặt lại mật khẩu:</p>
        <NuxtLink :to="devLink" class="btn btn-outline btn-sm w-full break-all"><AppIcon name="fa-key" class="mr-2" />Đặt lại mật khẩu ngay</NuxtLink>
      </div>
    </div>

    <p class="text-center text-sm text-slate-600 mt-6">
      <NuxtLink to="/auth/dang-nhap" class="link"><AppIcon name="fa-arrow-left" class="mr-1" />Quay lại đăng nhập</NuxtLink>
    </p>
  </div>
</template>
