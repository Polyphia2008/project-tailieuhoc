<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const email = ref('')
const busy = ref(false)
const sent = ref(false)
const link = ref('')

async function submit() {
  busy.value = true
  try {
    const r = await $fetch<any>('/api/auth/forgot', { method: 'POST', body: { email: email.value } })
    sent.value = true
    link.value = r.dev_link || ''
    toast.success('Đã gửi hướng dẫn đặt lại mật khẩu', { description: 'Vui lòng kiểm tra hộp thư của bạn.', duration: 4000 })
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Lỗi')
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Quên mật khẩu - MapDocs' })
</script>

<template>
  <AuthShell
    icon="solar:key-minimalistic-square-bold"
    title="Quên mật khẩu"
    subtitle="Nhập email đã đăng ký để nhận liên kết đặt lại."
  >
    <form v-if="!sent" class="space-y-4" @submit.prevent="submit">
      <AuthField label="Email đã đăng ký" icon="solar:letter-linear" required>
        <input v-model="email" type="email" required placeholder="Địa chỉ hộp thư..." class="input-dv" />
      </AuthField>

      <button type="submit" class="btn-cmstdev w-full h-10 text-[13.5px] font-bold" :disabled="busy">
        <UiSpinner v-if="busy" :size="16" />
        Gửi liên kết đặt lại
      </button>
    </form>

    <div v-else class="rounded-xl border border-cmstdev/25 bg-cmstdev/[.07] p-5 text-center">
      <span class="mx-auto grid size-11 place-items-center rounded-xl bg-cmstdev/15 text-cmstdev">
        <AppIcon name="solar:check-circle-bold" size="24" />
      </span>
      <p class="mt-3 text-[14.5px] font-bold text-foreground">Đã gửi thành công</p>
      <p class="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
        Vui lòng kiểm tra hộp thư của bạn. Ở chế độ demo, bạn có thể dùng liên kết bên dưới.
      </p>
      <NuxtLink v-if="link" :to="link" class="btn-cmstdev-solid mt-4 h-9 px-4 text-[13px] font-bold">
        Đặt lại mật khẩu ngay
      </NuxtLink>
    </div>

    <NuxtLink
      to="/auth/dang-nhap"
      class="mt-6 inline-flex w-full items-center justify-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-cmstdev"
    >
      <AppIcon name="solar:arrow-left-linear" size="15" />
      Về trang đăng nhập
    </NuxtLink>
  </AuthShell>
</template>
