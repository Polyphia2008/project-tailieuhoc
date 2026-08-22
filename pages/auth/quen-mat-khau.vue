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
    <NuxtLink to="/auth/dang-nhap" class="auth-back">
      <AppIcon name="fa-arrow-left" class="mr-1.5" />Quay lại
    </NuxtLink>
    <span class="auth-badge"><AppIcon name="fa-key" variant="bold" /></span>
    <h1 class="auth-title">Quên mật khẩu</h1>
    <p class="auth-sub">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="forgot-email">Email</label>
        <div class="auth-field">
          <AppIcon name="fa-envelope" class="auth-field__icon" />
          <input id="forgot-email" v-model="email" type="email" autocomplete="email"
            class="input pl-11" placeholder="email@example.com" />
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <AppIcon v-if="busy" name="fa-spinner" class="mr-2 animate-spin" />
        <AppIcon v-else name="fa-paper-plane" class="mr-2" />Gửi yêu cầu
      </button>
    </form>

    <div v-if="sent" class="sent-box">
      <p class="font-semibold text-green-800"><AppIcon name="fa-circle-check" variant="bold" class="mr-1.5" />Yêu cầu đã được gửi!</p>
      <div v-if="devLink" class="mt-3">
        <p class="text-ink-soft text-xs mb-2">Chế độ demo — dùng liên kết dưới đây để đặt lại mật khẩu:</p>
        <NuxtLink :to="devLink" class="btn btn-outline btn-sm w-full"><AppIcon name="fa-key" class="mr-2" />Đặt lại mật khẩu ngay</NuxtLink>
      </div>
    </div>

    <p class="text-center text-sm text-ink-soft mt-6">
      <NuxtLink to="/auth/dang-nhap" class="link"><AppIcon name="fa-arrow-left" class="mr-1" />Quay lại đăng nhập</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.auth-title { @apply text-2xl font-extrabold text-ink; }
.auth-sub { @apply text-ink-soft mt-1 mb-6 text-sm; }
.auth-back {
  @apply inline-flex items-center text-sm font-medium text-ink-soft mb-5
         hover:text-primary-900 transition-colors;
}
.auth-badge {
  @apply w-12 h-12 mb-4 grid place-items-center rounded-xl2 text-xl text-primary-900
         bg-primary-50 border border-primary-100;
}
.auth-field { @apply relative; }
.auth-field__icon { @apply absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none; }
.sent-box { @apply mt-5 rounded-xl2 border border-green-200 bg-green-50 p-4 text-sm; }
</style>
