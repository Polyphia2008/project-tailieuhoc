<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const links = [
  { to: '/admin', icon: 'fa-chart-line', label: 'Tổng quan' },
  { to: '/admin/tai-lieu', icon: 'fa-file-lines', label: 'Quản lý tài liệu' },
  { to: '/admin/nguoi-dung', icon: 'fa-users', label: 'Người dùng' },
  { to: '/admin/danh-muc', icon: 'fa-tags', label: 'Danh mục' },
  { to: '/admin/giao-dich', icon: 'fa-receipt', label: 'Giao dịch' },
  { to: '/admin/khieu-nai', icon: 'fa-flag', label: 'Khiếu nại' },
  { to: '/admin/bai-viet', icon: 'fa-newspaper', label: 'Bài viết' },
  { to: '/admin/cai-dat', icon: 'fa-gear', label: 'Cài đặt' }
]
</script>
<template>
  <div class="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[248px_1fr]">
    <aside class="bg-primary-950 text-slate-300 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto"
      :class="ui.sidebarOpen ? 'block' : 'hidden lg:block'">
      <NuxtLink to="/" class="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <span class="w-9 h-9 rounded-lg bg-white text-primary-900 grid place-items-center font-black">M</span>
        <span class="font-extrabold text-white">Map<span class="text-accent-500">Docs</span></span>
        <span class="text-[10px] bg-accent-500 text-white px-1.5 py-0.5 rounded font-bold ml-1">ADMIN</span>
      </NuxtLink>
      <nav class="p-3 space-y-1" @click="ui.sidebarOpen = false">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="anav">
          <AppIcon :name="l.icon" class="w-5 text-center" />{{ l.label }}
        </NuxtLink>
      </nav>
      <div class="p-3 mt-4 border-t border-white/10">
        <NuxtLink to="/dashboard" class="anav"><AppIcon name="fa-user" class="w-5 text-center" />Về trang cá nhân</NuxtLink>
        <button class="anav w-full text-left text-red-400" @click="auth.logout()">
          <AppIcon name="fa-right-from-bracket" class="w-5 text-center" />Đăng xuất
        </button>
      </div>
    </aside>
    <div class="min-w-0 flex flex-col">
      <header class="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sticky top-0 z-40">
        <button class="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100" @click="ui.sidebarOpen = !ui.sidebarOpen">
          <AppIcon name="fa-bars" />
        </button>
        <h1 class="font-bold text-slate-800">Bảng quản trị</h1>
        <div class="ml-auto flex items-center gap-2">
          <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="32" />
          <span class="text-sm font-medium text-slate-700 hidden sm:block">{{ auth.user?.name }}</span>
        </div>
      </header>
      <main class="flex-1 p-4 lg:p-6"><slot /></main>
    </div>
  </div>
</template>
<style scoped>
.anav {
  @apply relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300
         hover:bg-white/10 hover:text-white transition-colors;
}
.router-link-exact-active.anav {
  @apply bg-white/[0.14] text-white font-semibold hover:bg-white/[0.14];
}
.router-link-exact-active.anav::before {
  content: '';
  @apply absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent-500;
}
</style>
