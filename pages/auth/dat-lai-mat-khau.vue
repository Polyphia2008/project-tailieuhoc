<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const password = ref('')
const confirm = ref('')
const busy = ref(false)
const show = ref(false)

const mismatch = computed(() => confirm.value.length > 0 && password.value !== confirm.value)

async function submit() {
  if (password.value !== confirm.value) return toast.error('Mật khẩu nhập lại không khớp')
  busy.value = true
  try {
    await $fetch('/api/auth/reset', { method: 'POST', body: { token: String(route.query.token || ''), password: password.value } })
    await auth.refresh()
    toast.success('Đặt lại mật khẩu thành công!', { description: 'Bạn đã có thể sử dụng mật khẩu mới.', duration: 4000 })
    await router.push('/dashboard')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Lỗi')
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Đặt lại mật khẩu - MapDocs' })
</script>

<template>
  <AuthShell
    icon="solar:lock-keyhole-unlocked-bold"
    title="Đặt lại mật khẩu"
    subtitle="Nhập mật khẩu mới cho tài khoản của bạn."
  >
    <form class="space-y-4" @submit.prevent="submit">
      <AuthField label="Mật khẩu mới" icon="solar:lock-password-linear" required>
        <input v-model="password" :type="show ? 'text' : 'password'" required placeholder="Ít nhất 6 ký tự..." class="input-dv pr-9" />
        <button
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cmstdev transition-colors"
          @click="show = !show"
        >
          <AppIcon :name="show ? 'solar:eye-closed-linear' : 'solar:eye-linear'" size="16" />
        </button>
      </AuthField>

      <AuthField label="Nhập lại mật khẩu" icon="solar:lock-keyhole-linear" required>
        <input v-model="confirm" :type="show ? 'text' : 'password'" required placeholder="Xác nhận mật khẩu..." class="input-dv" />
        <template #below>
          <p v-if="mismatch" class="text-[11.5px] font-medium text-destructive">Mật khẩu nhập lại không khớp</p>
        </template>
      </AuthField>

      <button type="submit" class="btn-cmstdev w-full h-10 text-[13.5px] font-bold" :disabled="busy || mismatch">
        <UiSpinner v-if="busy" :size="16" />
        Cập nhật mật khẩu
      </button>
    </form>

    <NuxtLink
      to="/auth/dang-nhap"
      class="mt-6 inline-flex w-full items-center justify-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-cmstdev"
    >
      <AppIcon name="solar:arrow-left-linear" size="15" />
      Về trang đăng nhập
    </NuxtLink>
  </AuthShell>
</template>
