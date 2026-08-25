<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const form = reactive({ name: '', email: '', password: '', confirm: '', agree: false })
const busy = ref(false)
const showPw = ref(false)

function validate(): string | null {
  if (form.name.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không hợp lệ'
  if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
  if (form.password !== form.confirm) return 'Xác nhận mật khẩu không khớp'
  if (!form.agree) return 'Bạn cần đồng ý với điều khoản sử dụng'
  return null
}

/** Do manh mat khau: 0-3 */
const pwStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let sc = 0
  if (p.length >= 6) sc++
  if (p.length >= 10 || (/[A-Z]/.test(p) && /[a-z]/.test(p))) sc++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) sc++
  return sc
})
const strengthMeta = computed(() => (
  [
    { label: '', cls: '', w: '0%' },
    { label: 'Yếu', cls: 'bg-bad', w: '33%' },
    { label: 'Trung bình', cls: 'bg-warn', w: '66%' },
    { label: 'Mạnh', cls: 'bg-ok', w: '100%' }
  ][pwStrength.value]
))

const FIRST_KEY = 'mapdocs:isFirstRegister'

async function submit() {
  const err = validate()
  if (err) return ui.error(err)
  busy.value = true
  try {
    const res = await auth.register(form.name.trim(), form.email.trim(), form.password)
    ui.success(res?.message || 'Đăng ký thành công')
    const target = String(route.query.redirect || '/dashboard')

    // Lan dang ky dau tien tren thiet bi -> hien trang chuc mung "hello"
    let isFirst = false
    try { isFirst = !localStorage.getItem(FIRST_KEY) } catch { isFirst = false }
    if (isFirst) {
      try { localStorage.setItem(FIRST_KEY, new Date().toISOString()) } catch { /* ignore */ }
      return await navigateTo({
        path: '/auth/chuc-mung',
        query: { redirect: target, name: form.name.trim() }
      })
    }
    await navigateTo(target)
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Đăng ký thất bại')
  } finally { busy.value = false }
}
useSeoMeta({ title: 'Đăng ký - MapDocs' })
</script>

<template>
  <div id="register-page">
    <h1 class="auth-title">Tạo tài khoản</h1>
    <p class="auth-sub">Miễn phí, chỉ mất 30 giây!</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="reg-name">Họ và tên</label>
        <div class="auth-field">
          <AppIcon name="fa-user" class="auth-field__icon" />
          <input id="reg-name" v-model="form.name" type="text" autocomplete="name"
            class="input pl-11" placeholder="Nguyễn Văn A" />
        </div>
      </div>
      <div>
        <label class="label" for="reg-email">Email</label>
        <div class="auth-field">
          <AppIcon name="fa-envelope" class="auth-field__icon" />
          <input id="reg-email" v-model="form.email" type="email" autocomplete="email"
            class="input pl-11" placeholder="email@example.com" />
        </div>
      </div>
      <div>
        <label class="label" for="reg-password">Mật khẩu</label>
        <div class="auth-field">
          <AppIcon name="fa-lock" class="auth-field__icon" />
          <input id="reg-password" v-model="form.password" :type="showPw ? 'text' : 'password'"
            autocomplete="new-password" class="input pl-11 pr-11" placeholder="Tối thiểu 6 ký tự" />
          <button type="button" class="auth-field__toggle"
            :aria-label="showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPw = !showPw">
            <AppIcon :name="showPw ? 'fa-eye-slash' : 'fa-eye'" />
          </button>
        </div>
        <div v-if="form.password" class="mt-2 flex items-center gap-2">
          <span class="pw-track"><span class="pw-fill" :class="strengthMeta.cls" :style="{ width: strengthMeta.w }" /></span>
          <span class="text-xs font-medium text-ink-soft shrink-0">{{ strengthMeta.label }}</span>
        </div>
      </div>
      <div>
        <label class="label" for="reg-confirm">Xác nhận mật khẩu</label>
        <div class="auth-field">
          <AppIcon name="fa-lock" class="auth-field__icon" />
          <input id="reg-confirm" v-model="form.confirm" type="password" autocomplete="new-password"
            class="input pl-11" placeholder="Nhập lại mật khẩu" />
        </div>
        <p v-if="form.confirm && form.confirm !== form.password" class="mt-1 text-xs text-bad">
          <AppIcon name="fa-circle-xmark" class="mr-1" />Mật khẩu xác nhận không khớp
        </p>
        <p v-else-if="form.confirm && form.confirm === form.password" class="mt-1 text-xs text-ok">
          <AppIcon name="fa-circle-check" class="mr-1" />Mật khẩu khớp
        </p>
      </div>
      <label class="agree-box">
        <input v-model="form.agree" type="checkbox" class="agree-box__input" />
        <span>Tôi đồng ý với <a href="#" class="link">Điều khoản sử dụng</a> và
          <a href="#" class="link">Chính sách bảo mật</a> của MapDocs</span>
      </label>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <AppIcon v-if="busy" name="fa-spinner" class="mr-2 animate-spin" />
        <AppIcon v-else name="fa-user-plus" class="mr-2" />Đăng ký
      </button>
    </form>

    <div class="auth-divider"><span>HOẶC</span></div>

    <a href="/api/auth/google" class="btn btn-google w-full h-11">
      <AppIcon name="fa-google-brand" class="mr-2 text-base" />Đăng ký bằng Google
    </a>

    <p class="text-center text-sm text-ink-soft mt-6">
      Đã có tài khoản? <NuxtLink to="/auth/dang-nhap" class="link font-semibold">Đăng nhập</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.auth-title { @apply text-2xl font-extrabold text-ink; }
.auth-sub { @apply text-ink-soft mt-1 mb-6 text-sm; }

.auth-field { @apply relative; }
.auth-field__icon { @apply absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none; }
.auth-field__toggle {
  @apply absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-md
         text-slate-400 hover:text-primary-900 hover:bg-primary-50 transition-colors;
}

/* Thanh do manh mat khau */
.pw-track { @apply relative h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden; }
.pw-fill {
  @apply absolute inset-y-0 left-0 rounded-full;
  transition: width 300ms ease, background-color 300ms ease;
}

.agree-box { @apply flex items-start gap-2 text-sm text-ink-soft cursor-pointer; }
.agree-box__input { @apply mt-0.5 rounded border-line text-primary-900 focus:ring-primary-900; }

.auth-divider { @apply relative my-5 text-center; }
.auth-divider::before { content: ''; @apply absolute left-0 right-0 top-1/2 h-px bg-line; }
.auth-divider span { @apply relative bg-surface px-3 text-xs font-medium text-slate-400; }

.btn-google {
  @apply border border-line bg-white text-ink hover:border-slate-300 hover:bg-slate-50 hover:shadow-soft;
}

@media (prefers-reduced-motion: reduce) { .pw-fill { transition: none; } }
</style>
