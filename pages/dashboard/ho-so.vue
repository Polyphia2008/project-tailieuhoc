<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const auth = useAuthStore()
const { date } = useFormat()
const f = reactive({ name: auth.user?.name || '', bio: auth.user?.bio || '', phone: auth.user?.phone || '', current_password: '', new_password: '' })
const busy = ref(false)
async function save() {
  busy.value = true
  try { await $fetch('/api/user/profile', { method: 'PUT', body: f }); await auth.refresh(); f.current_password = ''; f.new_password = ''; toast.success('Đã cập nhật hồ sơ') }
  catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false }
}
useHead({ title: 'Hồ sơ cá nhân - MapDocs' })
</script>
<template>
  <div class="max-w-[720px]">
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/dashboard" class="hover:text-mdk-sub">Dashboard</NuxtLink> / <span class="text-mdk-sub">Hồ sơ cá nhân</span></nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Hồ sơ cá nhân</h1>
    <div class="mt-6 card p-5 flex items-center gap-4">
      <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="64" online />
      <div class="min-w-0">
        <p class="text-[16px] font-bold text-mdk-text font-ui">{{ auth.user?.name }}</p>
        <p class="text-[13px] text-mdk-mute">{{ auth.user?.email }}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="pill-blue text-[11px]">{{ auth.user?.role === 'admin' ? 'Quản trị viên' : auth.user?.role === 'seller' ? 'Người bán' : 'Thành viên' }}</span>
          <span class="pill-slate text-[11px]">Tham gia {{ date(auth.user?.created_at) }}</span>
        </div>
      </div>
    </div>
    <form class="mt-5 card p-5 space-y-4" @submit.prevent="save">
      <h2 class="text-[15px] font-bold text-mdk-text font-ui">Thông tin cơ bản</h2>
      <div><label class="label">Họ và tên</label><input v-model="f.name" class="input" /></div>
      <div><label class="label">Số điện thoại</label><input v-model="f.phone" class="input" placeholder="09xxxxxxxx" /></div>
      <div><label class="label">Giới thiệu</label><textarea v-model="f.bio" rows="3" class="textarea" placeholder="Giới thiệu ngắn về bạn..." /></div>
      <div class="pt-4 border-t border-mdk-line"><h2 class="text-[15px] font-bold text-mdk-text font-ui">Đổi mật khẩu</h2></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Mật khẩu hiện tại</label><input v-model="f.current_password" type="password" class="input" /></div>
        <div><label class="label">Mật khẩu mới</label><input v-model="f.new_password" type="password" class="input" /></div>
      </div>
      <button type="submit" class="btn-primary" :disabled="busy"><UiSpinner v-if="busy" :size="17" /> Lưu thay đổi</button>
    </form>
  </div>
</template>
