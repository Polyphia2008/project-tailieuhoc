<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const router = useRouter()
const name = ref(''); const email = ref(''); const password = ref('')
const show = ref(false); const busy = ref(false); const agree = ref(true)

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
  { label: 'Rất mạnh', cls: 'bg-emerald-400' }
]

async function submit() {
  if (!agree.value) return toast.error('Bạn cần đồng ý với điều khoản sử dụng')
  busy.value = true
  try {
    const r = await auth.register(name.value, email.value, password.value)
    if (import.meta.client) localStorage.setItem('mapdocs:isFirstRegister', '1')
    await router.push(`/auth/chuc-mung?name=${encodeURIComponent(r.user.name)}`)
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Đăng ký thất bại') } finally { busy.value = false }
}
useHead({ title: 'Đăng ký - MapDocs' })
</script>
<template>
  <div>
    <h1 class="text-[26px] font-extrabold text-white font-ui tracking-tight">Tạo tài khoản</h1>
    <p class="mt-2 text-[13.5px] text-zinc-500">Đã có tài khoản? <NuxtLink to="/auth/dang-nhap" class="text-primary-400 hover:text-primary-300 font-medium">Đăng nhập</NuxtLink></p>
    <form class="mt-7 space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Họ và tên</label>
        <div class="relative">
          <AppIcon name="solar:user-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="name" required placeholder="Nguyễn Văn A" class="input pl-10" />
        </div>
      </div>
      <div>
        <label class="label">Email</label>
        <div class="relative">
          <AppIcon name="solar:letter-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="email" type="email" required placeholder="ban@email.com" class="input pl-10" />
        </div>
      </div>
      <div>
        <label class="label">Mật khẩu</label>
        <div class="relative">
          <AppIcon name="solar:lock-password-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="password" :type="show ? 'text' : 'password'" required placeholder="Ít nhất 6 ký tự" class="input pl-10 pr-10" />
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-mdk-mute hover:text-mdk-text" @click="show = !show">
            <AppIcon :name="show ? 'solar:eye-closed-linear' : 'solar:eye-linear'" size="16" />
          </button>
        </div>
        <div v-if="password" class="mt-2 flex items-center gap-2">
          <div class="flex-1 flex gap-1">
            <span v-for="i in 4" :key="i" class="flex-1 h-1 rounded-full transition-colors" :class="i <= strength ? STRENGTH[strength].cls : 'bg-mdk-line'" />
          </div>
          <span class="text-[11px] text-mdk-mute">{{ STRENGTH[strength].label }}</span>
        </div>
      </div>
      <label class="flex items-start gap-2.5 cursor-pointer">
        <input v-model="agree" type="checkbox" class="mt-0.5 rounded border-mdk-line2 bg-mdk-soft text-primary-600 focus:ring-primary-500/30" />
        <span class="text-[12.5px] text-mdk-sub leading-relaxed">Tôi đồng ý với <span class="text-primary-400">Điều khoản sử dụng</span> và <span class="text-primary-400">Chính sách bảo mật</span> của MapDocs</span>
      </label>
      <button type="submit" class="btn-primary w-full btn-lg" :disabled="busy">
        <UiSpinner v-if="busy" :size="17" /> Tạo tài khoản
      </button>
    </form>
    <div class="my-6 flex items-center gap-3">
      <span class="flex-1 h-px bg-mdk-line" /><span class="text-[11.5px] text-mdk-mute font-medium">HOẶC</span><span class="flex-1 h-px bg-mdk-line" />
    </div>
    <a href="/api/auth/google" class="btn-outline w-full btn-lg"><AppIcon name="simple-icons:google" size="16" /> Đăng ký với Google</a>
  </div>
</template>
