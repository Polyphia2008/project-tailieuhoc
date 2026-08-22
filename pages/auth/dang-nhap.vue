<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const form = reactive({ email: '', password: '' })
const showPw = ref(false)
const busy = ref(false)

onMounted(() => { if (route.query.error) ui.error(String(route.query.error)) })

async function submit() {
  if (!form.email || !form.password) return ui.error('Vui lòng nhập đầy đủ email và mật khẩu')
  busy.value = true
  try {
    const res = await auth.login(form.email, form.password)
    ui.success(res?.message || 'Đăng nhập thành công')
    await navigateTo(String(route.query.redirect || '/'))
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Đăng nhập thất bại')
  } finally { busy.value = false }
}
const fill = (email: string) => { form.email = email; form.password = '123456' }
const demoAccounts = ['admin@mapdocs.vn', 'seller@mapdocs.vn', 'user@mapdocs.vn']
useSeoMeta({ title: 'Đăng nhập - MapDocs' })
</script>

<template>
  <div id="login-page">
    <h1 class="auth-title">Đăng nhập</h1>
    <p class="auth-sub">Chào mừng bạn quay lại MapDocs!</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="login-email">Email</label>
        <div class="auth-field">
          <AppIcon name="fa-envelope" class="auth-field__icon" />
          <input id="login-email" v-model="form.email" type="email" autocomplete="email"
            class="input pl-11" placeholder="email@example.com" />
        </div>
      </div>
      <div>
        <label class="label" for="login-password">Mật khẩu</label>
        <div class="auth-field">
          <AppIcon name="fa-lock" class="auth-field__icon" />
          <input id="login-password" v-model="form.password" :type="showPw ? 'text' : 'password'"
            autocomplete="current-password" class="input pl-11 pr-11" placeholder="••••••••" />
          <button type="button" class="auth-field__toggle"
            :aria-label="showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPw = !showPw">
            <AppIcon :name="showPw ? 'fa-eye-slash' : 'fa-eye'" />
          </button>
        </div>
      </div>
      <div class="flex justify-end">
        <NuxtLink to="/auth/quen-mat-khau" class="link text-sm">Quên mật khẩu?</NuxtLink>
      </div>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <AppIcon v-if="busy" name="fa-spinner" class="mr-2 animate-spin" />
        <AppIcon v-else name="fa-right-to-bracket" class="mr-2" />Đăng nhập
      </button>
    </form>

    <div class="auth-divider"><span>HOẶC</span></div>

    <a href="/api/auth/google" class="btn btn-google w-full h-11">
      <AppIcon name="fa-google-brand" class="mr-2 text-base" />Đăng nhập bằng Google
    </a>

    <p class="text-center text-sm text-ink-soft mt-6">
      Chưa có tài khoản? <NuxtLink to="/auth/dang-ky" class="link font-semibold">Đăng ký ngay</NuxtLink>
    </p>

    <div class="demo-box">
      <p class="font-semibold mb-2 text-primary-900">
        <AppIcon name="fa-circle-info" class="mr-1" />Tài khoản demo (mật khẩu: 123456)
      </p>
      <div class="flex flex-wrap gap-2">
        <button v-for="e in demoAccounts" :key="e" type="button" class="demo-chip" @click="fill(e)">{{ e }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-title { @apply text-2xl font-extrabold text-ink; }
.auth-sub { @apply text-ink-soft mt-1 mb-6 text-sm; }

/* Input co icon ben trai */
.auth-field { @apply relative; }
.auth-field__icon { @apply absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none; }
.auth-field__toggle {
  @apply absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-md
         text-slate-400 hover:text-primary-900 hover:bg-primary-50 transition-colors;
}

/* Duong ke "HOAC" */
.auth-divider { @apply relative my-5 text-center; }
.auth-divider::before { content: ''; @apply absolute left-0 right-0 top-1/2 h-px bg-line; }
.auth-divider span { @apply relative bg-surface px-3 text-xs font-medium text-slate-400; }

.btn-google {
  @apply border border-line bg-white text-ink hover:border-slate-300 hover:bg-slate-50 hover:shadow-soft;
}

.demo-box { @apply mt-6 rounded-xl2 border border-primary-100 bg-primary-50 p-4 text-xs text-ink-soft; }
.demo-chip {
  @apply rounded-full border border-primary-200 bg-white px-2.5 py-1 text-xs font-medium text-primary-900
         hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-colors;
}
</style>
