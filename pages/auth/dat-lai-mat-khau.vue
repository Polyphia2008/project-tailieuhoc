<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth' })
const route = useRoute(); const router = useRouter(); const auth = useAuthStore()
const password = ref(''); const confirm = ref(''); const busy = ref(false); const show = ref(false)
async function submit() {
  if (password.value !== confirm.value) return toast.error('Mật khẩu nhập lại không khớp')
  busy.value = true
  try {
    await $fetch('/api/auth/reset', { method: 'POST', body: { token: String(route.query.token || ''), password: password.value } })
    await auth.refresh()
    toast.success('Đặt lại mật khẩu thành công!')
    await router.push('/dashboard')
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false }
}
useHead({ title: 'Đặt lại mật khẩu - MapDocs' })
</script>
<template>
  <div>
    <h1 class="text-[26px] font-extrabold text-white font-ui tracking-tight">Đặt lại mật khẩu</h1>
    <p class="mt-2 text-[13.5px] text-zinc-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
    <form class="mt-7 space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Mật khẩu mới</label>
        <div class="relative">
          <AppIcon name="solar:lock-password-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="password" :type="show ? 'text' : 'password'" required class="input pl-10 pr-10" placeholder="Ít nhất 6 ký tự" />
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-mdk-mute hover:text-mdk-text" @click="show = !show">
            <AppIcon :name="show ? 'solar:eye-closed-linear' : 'solar:eye-linear'" size="16" />
          </button>
        </div>
      </div>
      <div>
        <label class="label">Nhập lại mật khẩu</label>
        <div class="relative">
          <AppIcon name="solar:lock-keyhole-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="confirm" :type="show ? 'text' : 'password'" required class="input pl-10" placeholder="••••••••" />
        </div>
      </div>
      <button type="submit" class="btn-primary w-full btn-lg" :disabled="busy"><UiSpinner v-if="busy" :size="17" /> Cập nhật mật khẩu</button>
    </form>
  </div>
</template>
