<script setup lang="ts">
const { list } = useSubjects()
const year = new Date().getFullYear()
</script>
<template>
  <footer class="bg-primary-950 text-slate-300 mt-16">
    <div class="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      <div>
        <NuxtLink to="/" class="flex items-center gap-2 mb-4">
          <span class="w-9 h-9 rounded-lg bg-white text-primary-900 grid place-items-center font-black">M</span>
          <span class="font-extrabold text-lg text-white">Map<span class="text-accent-500">Docs</span></span>
        </NuxtLink>
        <p class="text-sm leading-relaxed text-slate-400">
          Nền tảng chia sẻ &amp; mua bán tài liệu học tập hàng đầu Việt Nam. Kho tài liệu chất lượng từ giáo viên và học sinh giỏi trên cả nước.
        </p>
        <div class="flex gap-2 mt-4">
          <a href="https://facebook.com" target="_blank" rel="noopener" class="soc" aria-label="Facebook"><AppIcon name="fa-facebook-f" /></a>
          <a href="https://youtube.com" target="_blank" rel="noopener" class="soc" aria-label="YouTube"><AppIcon name="fa-youtube" /></a>
          <a href="https://tiktok.com" target="_blank" rel="noopener" class="soc" aria-label="TikTok"><AppIcon name="fa-tiktok" /></a>
          <a href="mailto:hotro@mapdocs.vn" class="soc" aria-label="Email"><AppIcon name="fa-envelope" /></a>
        </div>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4">Môn học</h4>
        <ul class="space-y-2 text-sm grid grid-cols-2 gap-x-2">
          <li v-for="s in list" :key="s.key"><NuxtLink :to="`/tai-lieu?subject=${s.key}`" class="hover:text-accent-500 transition">{{ s.label }}</NuxtLink></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4">Liên kết</h4>
        <ul class="space-y-2 text-sm">
          <li><NuxtLink to="/tai-lieu" class="hover:text-accent-500 transition">Thư viện tài liệu</NuxtLink></li>
          <li><NuxtLink to="/tai-lieu?type=free" class="hover:text-accent-500 transition">Tài liệu miễn phí</NuxtLink></li>
          <li><NuxtLink to="/dashboard/dang-ban" class="hover:text-accent-500 transition">Đăng bán tài liệu</NuxtLink></li>
          <li><NuxtLink to="/blog" class="hover:text-accent-500 transition">Blog kinh nghiệm</NuxtLink></li>
          <li><NuxtLink to="/auth/dang-ky" class="hover:text-accent-500 transition">Đăng ký tài khoản</NuxtLink></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4">Liên hệ</h4>
        <ul class="space-y-3 text-sm">
          <li class="flex gap-3"><AppIcon name="fa-phone" class="mt-1 text-accent-500" /><span>Hotline: 1900 6789</span></li>
          <li class="flex gap-3"><AppIcon name="fa-envelope" class="mt-1 text-accent-500" /><span>hotro@mapdocs.vn</span></li>
          <li class="flex gap-3"><AppIcon name="fa-location-dot" class="mt-1 text-accent-500" /><span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span></li>
          <li class="flex gap-3"><AppIcon name="fa-clock" class="mt-1 text-accent-500" /><span>8:00 - 22:00 hằng ngày</span></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-5 text-center text-sm text-slate-400">
        © {{ year }} MapDocs. Bản quyền thuộc về MapDocs. Dự án demo phi thương mại.
      </div>
    </div>
  </footer>
</template>
<style scoped>
.soc { @apply w-9 h-9 rounded-lg bg-white/10 grid place-items-center text-white hover:bg-accent-500 transition; }
</style>
