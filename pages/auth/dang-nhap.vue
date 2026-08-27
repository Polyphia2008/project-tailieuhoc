<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const show = ref(false)
const busy = ref(false)

async function submit() {
  busy.value = true
  try {
    const u = await auth.login(email.value, password.value)
    toast.success(`Chào mừng trở lại, ${u.name}!`)
    await router.push(String(route.query.next || (u.role === 'admin' ? '/admin' : '/dashboard')))
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Đăng nhập thất bại') } finally { busy.value = false }
}
function demo(e: string) { email.value = e; password.value = '123456' }
useHead({ title: 'Đăng nhập - MapDocs' })
</script>
<template>
  <div>
    <h1 class="text-[26px] font-extrabold text-white font-ui tracking-tight">Đăng nhập</h1>
    <p class="mt-2 text-[13.5px] text-zinc-500">Chưa có tài khoản? <NuxtLink to="/auth/dang-ky" class="text-primary-400 hover:text-primary-300 font-medium">Đăng ký miễn phí</NuxtLink></p>
    <form class="mt-7 space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Email</label>
        <div class="relative">
          <AppIcon name="solar:letter-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="email" type="email" required placeholder="ban@email.com" class="input pl-10" />
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="label mb-0">Mật khẩu</label>
          <NuxtLink to="/auth/quen-mat-khau" class="text-[12px] text-primary-400 hover:text-primary-300">Quên mật khẩu?</NuxtLink>
        </div>
        <div class="relative">
          <AppIcon name="solar:lock-password-linear" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="password" :type="show ? 'text' : 'password'" required placeholder="••••••••" class="input pl-10 pr-10" />
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-mdk-mute hover:text-mdk-text" @click="show = !show">
            <AppIcon :name="show ? 'solar:eye-closed-linear' : 'solar:eye-linear'" size="16" />
          </button>
        </div>
      </div>
      <button type="submit" class="btn-primary w-full btn-lg" :disabled="busy">
        <UiSpinner v-if="busy" :size="17" /> Đăng nhập
      </button>
    </form>
    <div class="my-6 flex items-center gap-3">
      <span class="flex-1 h-px bg-mdk-line" /><span class="text-[11.5px] text-mdk-mute font-medium">HOẶC</span><span class="flex-1 h-px bg-mdk-line" />
    </div>
    <a href="/api/auth/google" class="btn-outline w-full btn-lg"><AppIcon name="simple-icons:google" size="16" /> Tiếp tục với Google</a>
    <div class="mt-7 rounded-xl border border-mdk-line bg-mdk-soft p-3.5">
      <p class="text-[11px] font-bold text-mdk-mute uppercase tracking-wider">Tài khoản demo (mật khẩu 123456)</p>
      <div class="mt-2.5 flex flex-wrap gap-2">
        <button v-for="d in [['admin@mapdocs.vn','Admin'],['seller@mapdocs.vn','Người bán'],['user@mapdocs.vn','Học sinh']]" :key="d[0]" class="pill bg-mdk-line text-mdk-sub hover:text-mdk-text text-[11.5px]" @click="demo(d[0])">{{ d[1] }}</button>
      </div>
    </div>
  </div>
</template>
