<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const token = computed(() => String(route.query.token || ''))
const form = reactive({ password: '', confirm: '' })
const busy = ref(false)

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
    <h1 class="text-2xl font-extrabold text-slate-800">Đặt lại mật khẩu</h1>
    <p class="text-slate-500 mt-1 mb-6">Nhập mật khẩu mới cho tài khoản của bạn.</p>

    <div v-if="!token" class="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
      <i class="fa-solid fa-triangle-exclamation mr-1" />Liên kết không hợp lệ. Vui lòng
      <NuxtLink to="/auth/quen-mat-khau" class="link">yêu cầu lại</NuxtLink>.
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="new-password">Mật khẩu mới</label>
        <input id="new-password" v-model="form.password" type="password" class="input" placeholder="Tối thiểu 6 ký tự" />
      </div>
      <div>
        <label class="label" for="new-confirm">Xác nhận mật khẩu</label>
        <input id="new-confirm" v-model="form.confirm" type="password" class="input" placeholder="Nhập lại mật khẩu mới" />
      </div>
      <button type="submit" class="btn btn-primary w-full h-11" :disabled="busy">
        <i v-if="busy" class="fa-solid fa-spinner fa-spin mr-2" /><i v-else class="fa-solid fa-key mr-2" />Đặt lại mật khẩu
      </button>
    </form>

    <p class="text-center text-sm text-slate-600 mt-6">
      <NuxtLink to="/auth/dang-nhap" class="link"><i class="fa-solid fa-arrow-left mr-1" />Quay lại đăng nhập</NuxtLink>
    </p>
  </div>
</template>
