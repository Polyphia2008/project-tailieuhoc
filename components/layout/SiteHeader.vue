<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const q = ref('')
const menuOpen = ref(false)
const userOpen = ref(false)
const search = () => {
  menuOpen.value = false
  router.push({ path: '/tai-lieu', query: q.value.trim() ? { q: q.value.trim() } : {} })
}
watch(() => route.fullPath, () => { userOpen.value = false; menuOpen.value = false })
</script>
<template>
  <header class="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4">
      <div class="h-16 flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <span class="w-9 h-9 rounded-lg bg-primary-900 text-white grid place-items-center font-black">M</span>
          <span class="font-extrabold text-lg text-primary-900 hidden sm:block">Map<span class="text-accent-500">Docs</span></span>
        </NuxtLink>
        <nav class="hidden lg:flex items-center gap-1 ml-4">
          <NuxtLink to="/" class="nav-link">Trang chủ</NuxtLink>
          <NuxtLink to="/tai-lieu" class="nav-link">Thư viện</NuxtLink>
          <NuxtLink to="/blog" class="nav-link">Blog</NuxtLink>
        </nav>
        <form class="flex-1 max-w-md mx-auto hidden md:block" @submit.prevent="search">
          <div class="relative">
            <AppIcon name="fa-magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input v-model="q" type="text" placeholder="Tìm kiếm tài liệu..."
              class="w-full h-10 pl-10 pr-3 rounded-full bg-slate-100 border border-transparent focus:bg-white focus:border-primary-900 focus:ring-0 text-sm outline-none transition" />
          </div>
        </form>
        <div class="ml-auto flex items-center gap-2">
          <template v-if="!auth.isLoggedIn">
            <NuxtLink to="/auth/dang-nhap" class="btn btn-ghost btn-sm hidden sm:inline-flex">Đăng nhập</NuxtLink>
            <NuxtLink to="/auth/dang-ky" class="btn btn-primary btn-sm">Đăng ký</NuxtLink>
          </template>
          <div v-else class="relative">
            <button class="flex items-center gap-2 rounded-full hover:bg-slate-100 pl-1 pr-2 py-1 transition" @click="userOpen = !userOpen">
              <UiAvatar :name="auth.user?.name" :src="auth.user?.avatar" :size="32" />
              <span class="text-sm font-medium text-slate-700 hidden md:block max-w-[120px] truncate">{{ auth.user?.name }}</span>
              <AppIcon name="fa-chevron-down" class="text-xs text-slate-400" />
            </button>
            <div v-if="userOpen" class="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-hover border border-slate-100 py-2" @click="userOpen = false">
              <div class="px-4 pb-2 mb-1 border-b border-slate-100">
                <p class="font-semibold text-sm text-slate-800 truncate">{{ auth.user?.name }}</p>
                <p class="text-xs text-slate-500 truncate">{{ auth.user?.email }}</p>
              </div>
              <NuxtLink to="/dashboard" class="drop"><AppIcon name="fa-gauge" class="w-5" />Bảng điều khiển</NuxtLink>
              <NuxtLink to="/dashboard/da-mua" class="drop"><AppIcon name="fa-bag-shopping" class="w-5" />Tài liệu đã mua</NuxtLink>
              <NuxtLink to="/dashboard/dang-ban" class="drop"><AppIcon name="fa-cloud-arrow-up" class="w-5" />Đăng bán tài liệu</NuxtLink>
              <NuxtLink to="/dashboard/doanh-thu" class="drop"><AppIcon name="fa-wallet" class="w-5" />Ví của tôi</NuxtLink>
              <NuxtLink v-if="auth.isAdmin" to="/admin" class="drop text-accent-600"><AppIcon name="fa-shield-halved" class="w-5" />Quản trị</NuxtLink>
              <button class="drop w-full text-left text-red-600 border-t border-slate-100 mt-1 pt-2" @click="auth.logout()">
                <AppIcon name="fa-right-from-bracket" class="w-5" />Đăng xuất
              </button>
            </div>
          </div>
          <button class="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-700" @click="menuOpen = !menuOpen">
            <AppIcon :name="menuOpen ? 'fa-xmark' : 'fa-bars'" />
          </button>
        </div>
      </div>
    </div>
    <div v-if="menuOpen" class="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
      <form class="mb-3" @submit.prevent="search">
        <input v-model="q" type="text" placeholder="Tìm kiếm tài liệu..." class="input" />
      </form>
      <NuxtLink to="/" class="mnav">Trang chủ</NuxtLink>
      <NuxtLink to="/tai-lieu" class="mnav">Thư viện</NuxtLink>
      <NuxtLink to="/blog" class="mnav">Blog</NuxtLink>
      <NuxtLink v-if="!auth.isLoggedIn" to="/auth/dang-nhap" class="mnav">Đăng nhập</NuxtLink>
    </div>
  </header>
</template>
<style scoped>
.nav-link { @apply px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-primary-900 hover:bg-slate-50 transition; }
.router-link-active.nav-link { @apply text-primary-900 bg-primary-50; }
.drop { @apply flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition; }
.mnav { @apply block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50; }
</style>
