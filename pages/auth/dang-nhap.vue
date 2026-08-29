<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

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
    toast.success(`Chào mừng trở lại, ${u.name}!`, { description: 'Đăng nhập thành công vào hệ thống MapDocs.', duration: 4000 })
    await router.push(String(route.query.next || (u.role === 'admin' ? '/admin' : '/dashboard')))
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Đăng nhập thất bại')
  } finally {
    busy.value = false
  }
}

function demo(e: string) {
  email.value = e
  password.value = '123456'
}

useHead({ title: 'Đăng nhập - MapDocs' })
</script>

<template>
  <AuthShell
    icon="solar:login-3-bold"
    title="Đăng nhập hệ thống"
    subtitle="Vui lòng nhập thông tin tài khoản của bạn."
  >
    <form class="space-y-4" @submit.prevent="submit">
      <AuthField label="Email đăng nhập" icon="solar:letter-linear" required>
        <input v-model="email" type="email" required placeholder="Địa chỉ hộp thư..." class="input-dv" />
      </AuthField>

      <AuthField label="Mật khẩu" icon="solar:lock-password-linear" required>
        <template #aside>
          <NuxtLink to="/auth/quen-mat-khau" class="text-[12px] font-medium text-cmstdev hover:underline">Quên mật khẩu?</NuxtLink>
        </template>
        <input v-model="password" :type="show ? 'text' : 'password'" required placeholder="Nhập mật khẩu..." class="input-dv pr-9" />
        <button
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cmstdev transition-colors"
          @click="show = !show"
        >
          <AppIcon :name="show ? 'solar:eye-closed-linear' : 'solar:eye-linear'" size="16" />
        </button>
      </AuthField>

      <button type="submit" class="btn-cmstdev w-full h-10 text-[13.5px] font-bold" :disabled="busy">
        <UiSpinner v-if="busy" :size="16" />
        Đăng nhập ngay
      </button>

      <a href="/api/auth/google" class="btn-google h-10 text-[13.5px] font-semibold">
        <AppIcon name="simple-icons:google" size="15" />
        Tiếp tục với Google
      </a>
    </form>

    <div class="mt-6 rounded-xl border border-cmstdev/15 bg-cmstdev/[.04] p-3.5">
      <p class="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Tài khoản demo (mật khẩu 123456)</p>
      <div class="mt-2.5 flex flex-wrap gap-2">
        <button
          v-for="d in [['admin@mapdocs.vn', 'Admin'], ['seller@mapdocs.vn', 'Người bán'], ['user@mapdocs.vn', 'Học sinh']]"
          :key="d[0]"
          type="button"
          class="rounded-lg border border-cmstdev/20 bg-cmstdev/10 px-2.5 py-1 text-[11.5px] font-medium text-cmstdev transition-colors hover:bg-cmstdev/20"
          @click="demo(d[0])"
        >
          {{ d[1] }}
        </button>
      </div>
    </div>

    <p class="mt-6 text-center text-[13px] text-muted-foreground">
      Chưa có tài khoản?
      <NuxtLink to="/auth/dang-ky" class="font-semibold text-cmstdev hover:underline">Đăng ký ngay</NuxtLink>
    </p>
  </AuthShell>
</template>
