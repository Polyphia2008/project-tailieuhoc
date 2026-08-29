<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const auth = useAuthStore()
const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const show = ref(false)
const busy = ref(false)
const agree = ref(true)

const strength = computed(() => {
  const p = password.value
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return Math.min(4, s)
})

const STRENGTH = [
  { label: 'Rất yếu', cls: 'bg-rose-500' },
  { label: 'Yếu', cls: 'bg-orange-500' },
  { label: 'Trung bình', cls: 'bg-amber-500' },
  { label: 'Mạnh', cls: 'bg-emerald-500' },
  { label: 'Rất mạnh', cls: 'bg-cmstdev' }
]

async function submit() {
  if (!agree.value) return toast.error('Bạn cần đồng ý với điều khoản sử dụng')
  busy.value = true
  try {
    const r = await auth.register(name.value, email.value, password.value)
    if (import.meta.client) localStorage.setItem('mapdocs:isFirstRegister', '1')
    await router.push(`/auth/chuc-mung?name=${encodeURIComponent(r.user.name)}`)
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Đăng ký thất bại')
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Đăng ký - MapDocs' })
</script>

<template>
  <AuthShell
    icon="solar:user-plus-bold"
    title="Tạo tài khoản mới"
    subtitle="Vui lòng nhập thông tin đăng ký."
  >
    <form class="space-y-4" @submit.prevent="submit">
      <AuthField label="Họ và tên" icon="solar:user-linear" required>
        <input v-model="name" required placeholder="Nguyễn Văn A..." class="input-dv" />
      </AuthField>

      <AuthField label="Email liên lạc" icon="solar:letter-linear" required>
        <input v-model="email" type="email" required placeholder="Địa chỉ hộp thư..." class="input-dv" />
      </AuthField>

      <AuthField label="Mật khẩu" icon="solar:lock-password-linear" required>
        <input v-model="password" :type="show ? 'text' : 'password'" required placeholder="Ít nhất 6 ký tự..." class="input-dv pr-9" />
        <button
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cmstdev transition-colors"
          @click="show = !show"
        >
          <AppIcon :name="show ? 'solar:eye-closed-linear' : 'solar:eye-linear'" size="16" />
        </button>
        <template #below>
          <div v-if="password" class="flex items-center gap-2 pt-0.5">
            <div class="flex flex-1 gap-1">
              <span
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="i <= strength ? STRENGTH[strength].cls : 'bg-border'"
              />
            </div>
            <span class="text-[11px] text-muted-foreground">{{ STRENGTH[strength].label }}</span>
          </div>
        </template>
      </AuthField>

      <label class="flex cursor-pointer items-start gap-2.5">
        <input
          v-model="agree"
          type="checkbox"
          class="mt-0.5 rounded border-input bg-transparent text-cmstdev focus:ring-cmstdev/40"
        />
        <span class="text-[12.5px] leading-relaxed text-muted-foreground">
          Tôi đồng ý với
          <span class="font-medium text-cmstdev">Điều khoản sử dụng</span>
          và
          <span class="font-medium text-cmstdev">Chính sách bảo mật</span>
          của MapDocs
        </span>
      </label>

      <button type="submit" class="btn-cmstdev w-full h-10 text-[13.5px] font-bold" :disabled="busy">
        <UiSpinner v-if="busy" :size="16" />
        Tạo tài khoản
      </button>

      <a href="/api/auth/google" class="btn-google h-10 text-[13.5px] font-semibold">
        <AppIcon name="simple-icons:google" size="15" />
        Đăng ký với Google
      </a>
    </form>

    <p class="mt-6 text-center text-[13px] text-muted-foreground">
      Đã có tài khoản?
      <NuxtLink to="/auth/dang-nhap" class="font-semibold text-cmstdev hover:underline">Đăng nhập ngay</NuxtLink>
    </p>
  </AuthShell>
</template>
