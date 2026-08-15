<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const form = reactive({ name: '', email: '', password: '', confirm: '', agree: false })
const busy = ref(false)

function validate(): string | null {
  if (form.name.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không hợp lệ'
  if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
  if (form.password !== form.confirm) return 'Xác nhận mật khẩu không khớp'
  if (!form.agree) return 'Bạn cần đồng ý với điều khoản sử dụng'
  return null
}

async function submit() {
  const err = validate()
  if (err) return ui.error(err)
  busy.value = true
  try {
    const res = await auth.register(form.name.trim(), form.email.trim(), form.password)
    ui.success(res?.message || 'Đăng ký thành công')
    await navigateTo(String(route.query.redirect || '/dashboard'))
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Đăng ký thất bại')
  } finally { busy.value = false }
}
useSeoMeta({ title: 'Đăng ký - MapDocs' })
</script>

<template>
  <div id="register-page">
    <h1 class="text-2xl font-extrabold text-slate-800">Tạo tài khoản</h1>
    <p class="text-slate-500 mt-1 mb-6">Miễn phí, chỉ mất 30 giây!</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="reg-name">Họ và tên</label>
        <input id="reg-name" v-model="form.name" type="text" class="input" placeholder="Nguyễn Văn A" />
      </div>
      <div>
        <label class="label" for="reg-email">Email</label>
        <input id="reg-email" v-model="form.email" type="email" class="input" placeholder="email@example.com" />
      </div>
      <div>
        <label class="label" for="reg-password">Mật khẩu</label>
        <input id="reg-password" v-model="form.password" type="password" class="input" placeholder="Tối thiểu 6 ký tự" />
      </div>
      <div>
        <label class="label" for="reg-confirm">Xác nhận mật khẩu</label>
        <input id="reg-confirm" v-model="form.confirm" type="password" class="input" placeholder="Nhập lại mật khẩu" />
        <p v-if="form.confirm && form.confirm !== form.password" class="text-xs text-red-600 mt-1">Mật khẩu xác nhận không khớp</p>
      </div>
      <label class="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
        <input v-model="form.agree" type="checkbox" class="mt-0.5 rounded text-primary-900 focus:ring-primary-900" />
        <span>Tôi đồng ý với <a href="#" class="link">Điều khoản sử dụng</a> và <a href="#" class="link">Chính sách bảo mật</a> của MapDocs</span>
      </label>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <i v-if="busy" class="fa-solid fa-spinner fa-spin mr-2" /><i v-else class="fa-solid fa-user-plus mr-2" />Đăng ký
      </button>
    </form>

    <div class="flex items-center gap-3 my-5">
      <span class="h-px bg-slate-200 flex-1" /><span class="text-xs text-slate-400">HOẶC</span><span class="h-px bg-slate-200 flex-1" />
    </div>
    <a href="/api/auth/google" class="btn w-full h-11 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
      <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 mr-2" />Đăng ký bằng Google
    </a>

    <p class="text-center text-sm text-slate-600 mt-6">
      Đã có tài khoản? <NuxtLink to="/auth/dang-nhap" class="link font-semibold">Đăng nhập</NuxtLink>
    </p>
  </div>
</template>
