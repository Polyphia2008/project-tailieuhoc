<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const token = computed(() => String(route.query.token || ''))
const form = reactive({ password: '', confirm: '' })
const busy = ref(false)
const showPw = ref(false)

async function submit() {
  if (!token.value) return ui.error('Liên kết không hợp lệ hoặc đã hết hạn')
  if (form.password.length < 6) return ui.error('Mật khẩu phải có ít nhất 6 ký tự')
  if (form.password !== form.confirm) return ui.error('Xác nhận mật khẩu không khớp')
  busy.value = true
  try {
    const res = await $fetch<any>('/api/auth/reset', { method: 'POST', body: { token: token.value, password: form.password } })
    auth.setUser(res.data)
    ui.success(res?.message || 'Đặt lại mật khẩu thành công')
    await navigateTo('/dashboard')
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể đặt lại mật khẩu')
  } finally { busy.value = false }
}
useSeoMeta({ title: 'Đặt lại mật khẩu - MapDocs' })
</script>

<template>
  <div id="reset-page">
    <span class="auth-badge"><AppIcon name="fa-lock" variant="bold" /></span>
    <h1 class="auth-title">Đặt lại mật khẩu</h1>
    <p class="auth-sub">Nhập mật khẩu mới cho tài khoản của bạn.</p>

    <div v-if="!token" class="warn-box">
      <AppIcon name="fa-triangle-exclamation" class="mr-1.5" />Liên kết không hợp lệ. Vui lòng
      <NuxtLink to="/auth/quen-mat-khau" class="link">yêu cầu lại</NuxtLink>.
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="new-password">Mật khẩu mới</label>
        <div class="auth-field">
          <AppIcon name="fa-lock" class="auth-field__icon" />
          <input id="new-password" v-model="form.password" :type="showPw ? 'text' : 'password'"
            autocomplete="new-password" class="input pl-11 pr-11" placeholder="Tối thiểu 6 ký tự" />
          <button type="button" class="auth-field__toggle"
            :aria-label="showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPw = !showPw">
            <AppIcon :name="showPw ? 'fa-eye-slash' : 'fa-eye'" />
          </button>
        </div>
      </div>
      <div>
        <label class="label" for="new-confirm">Xác nhận mật khẩu</label>
        <div class="auth-field">
          <AppIcon name="fa-lock" class="auth-field__icon" />
          <input id="new-confirm" v-model="form.confirm" type="password" autocomplete="new-password"
            class="input pl-11" placeholder="Nhập lại mật khẩu mới" />
        </div>
        <p v-if="form.confirm && form.confirm !== form.password" class="mt-1 text-xs text-bad">
          <AppIcon name="fa-circle-xmark" class="mr-1" />Mật khẩu xác nhận không khớp
        </p>
      </div>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <AppIcon v-if="busy" name="fa-spinner" class="mr-2 animate-spin" />
        <AppIcon v-else name="fa-key" class="mr-2" />Đặt lại mật khẩu
      </button>
    </form>

    <p class="text-center text-sm text-ink-soft mt-6">
      <NuxtLink to="/auth/dang-nhap" class="link"><AppIcon name="fa-arrow-left" class="mr-1" />Quay lại đăng nhập</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.auth-title { @apply text-2xl font-extrabold text-ink; }
.auth-sub { @apply text-ink-soft mt-1 mb-6 text-sm; }
.auth-badge {
  @apply w-12 h-12 mb-4 grid place-items-center rounded-xl2 text-xl text-primary-900
         bg-primary-50 border border-primary-100;
}
.auth-field { @apply relative; }
.auth-field__icon { @apply absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none; }
.auth-field__toggle {
  @apply absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-md
         text-slate-400 hover:text-primary-900 hover:bg-primary-50 transition-colors;
}
.warn-box { @apply rounded-xl2 border border-red-200 bg-red-50 p-4 text-sm text-red-700; }
</style>
