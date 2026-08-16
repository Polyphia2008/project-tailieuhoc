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
useSeoMeta({ title: 'Đăng nhập - MapDocs' })
</script>

<template>
  <div id="login-page">
    <h1 class="text-2xl font-extrabold text-slate-800">Đăng nhập</h1>
    <p class="text-slate-500 mt-1 mb-6">Chào mừng bạn quay lại MapDocs!</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="login-email">Email</label>
        <input id="login-email" v-model="form.email" type="email" autocomplete="email" class="input" placeholder="email@example.com" />
      </div>
      <div>
        <label class="label" for="login-password">Mật khẩu</label>
        <div class="relative">
          <input id="login-password" v-model="form.password" :type="showPw ? 'text' : 'password'" autocomplete="current-password" class="input pr-11" placeholder="••••••••" />
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" @click="showPw = !showPw">
            <AppIcon :name="showPw ? 'fa-eye-slash' : 'fa-eye'" />
          </button>
        </div>
      </div>
      <div class="flex justify-end">
        <NuxtLink to="/auth/quen-mat-khau" class="link text-sm">Quên mật khẩu?</NuxtLink>
      </div>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <AppIcon name="fa-spinner" class="mr-2" v-if="busy" /><AppIcon name="fa-right-to-bracket" class="mr-2" v-else />Đăng nhập
      </button>
    </form>

    <div class="flex items-center gap-3 my-5">
      <span class="h-px bg-slate-200 flex-1" /><span class="text-xs text-slate-400">HOẶC</span><span class="h-px bg-slate-200 flex-1" />
    </div>

    <a href="/api/auth/google" class="btn w-full h-11 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
      <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 mr-2" />Đăng nhập bằng Google
    </a>

    <p class="text-center text-sm text-slate-600 mt-6">
      Chưa có tài khoản? <NuxtLink to="/auth/dang-ky" class="link font-semibold">Đăng ký ngay</NuxtLink>
    </p>

    <div class="mt-6 p-4 rounded-xl bg-slate-100 text-xs text-slate-600">
      <p class="font-semibold mb-2"><AppIcon name="fa-circle-info" class="mr-1" />Tài khoản demo (mật khẩu: 123456)</p>
      <div class="flex flex-wrap gap-2">
        <button class="badge bg-white hover:bg-primary-50 transition" @click="fill('admin@mapdocs.vn')">admin@mapdocs.vn</button>
        <button class="badge bg-white hover:bg-primary-50 transition" @click="fill('seller@mapdocs.vn')">seller@mapdocs.vn</button>
        <button class="badge bg-white hover:bg-primary-50 transition" @click="fill('user@mapdocs.vn')">user@mapdocs.vn</button>
      </div>
    </div>
  </div>
</template>
