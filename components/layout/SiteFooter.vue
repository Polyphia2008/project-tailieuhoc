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
        <div class="mt-5 flex flex-wrap gap-2">
          <span class="trust"><AppIcon name="fa-shield-halved" class="text-accent-500" />Thanh toán an toàn</span>
          <span class="trust"><AppIcon name="fa-bolt" class="text-accent-500" />Tải về tức thì</span>
        </div>
      </div>
      <div>
        <h4 class="foot-title">Môn học</h4>
        <ul class="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
          <li v-for="s in list" :key="s.key">
            <NuxtLink :to="`/tai-lieu?subject=${s.key}`" class="foot-link">{{ s.label }}</NuxtLink>
          </li>
        </ul>
      </div>
      <div>
        <h4 class="foot-title">Liên kết</h4>
        <ul class="space-y-2 text-sm">
          <li><NuxtLink to="/tai-lieu" class="foot-link">Thư viện tài liệu</NuxtLink></li>
          <li><NuxtLink to="/tai-lieu?type=free" class="foot-link">Tài liệu miễn phí</NuxtLink></li>
          <li><NuxtLink to="/dashboard/dang-ban" class="foot-link">Đăng bán tài liệu</NuxtLink></li>
          <li><NuxtLink to="/blog" class="foot-link">Blog kinh nghiệm</NuxtLink></li>
          <li><NuxtLink to="/auth/dang-ky" class="foot-link">Đăng ký tài khoản</NuxtLink></li>
        </ul>
      </div>
      <div>
        <h4 class="foot-title">Liên hệ</h4>
        <ul class="space-y-3 text-sm">
          <li class="flex gap-3"><AppIcon name="fa-phone" class="mt-1 shrink-0 text-accent-500" /><a href="tel:19006789" class="foot-link">Hotline: 1900 6789</a></li>
          <li class="flex gap-3"><AppIcon name="fa-envelope" class="mt-1 shrink-0 text-accent-500" /><a href="mailto:hotro@mapdocs.vn" class="foot-link">hotro@mapdocs.vn</a></li>
          <li class="flex gap-3"><AppIcon name="fa-location-dot" class="mt-1 shrink-0 text-accent-500" /><span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span></li>
          <li class="flex gap-3"><AppIcon name="fa-clock" class="mt-1 shrink-0 text-accent-500" /><span>8:00 - 22:00 hằng ngày</span></li>
        </ul>
        <div class="mt-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Phương thức thanh toán</p>
          <div class="flex flex-wrap gap-1.5">
            <span class="pay">Ví MapDocs</span>
            <span class="pay">VNPay</span>
            <span class="pay">Momo</span>
            <span class="pay"><AppIcon name="fa-stripe" class="text-[13px]" /></span>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
        <p class="text-center sm:text-left">© {{ year }} MapDocs. Bản quyền thuộc về MapDocs. Dự án demo phi thương mại.</p>
        <nav class="flex items-center gap-4 text-xs">
          <NuxtLink to="/tai-lieu" class="foot-link">Điều khoản</NuxtLink>
          <NuxtLink to="/tai-lieu" class="foot-link">Bảo mật</NuxtLink>
          <NuxtLink to="/blog" class="foot-link">Trợ giúp</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
<style scoped>
.soc {
  @apply w-9 h-9 rounded-lg bg-white/10 grid place-items-center text-white transition-all duration-200
         hover:bg-accent-500 hover:-translate-y-0.5;
}
.foot-title { @apply text-white font-bold mb-4 text-sm uppercase tracking-wide; }

/* Link co gach chan truot khi hover */
.foot-link { @apply relative inline-block transition-colors hover:text-accent-500; }
.foot-link::after {
  content: '';
  @apply absolute left-0 -bottom-0.5 h-px w-full bg-accent-500 origin-left;
  transform: scaleX(0);
  transition: transform 200ms ease;
}
.foot-link:hover::after { transform: scaleX(1); }

.trust {
  @apply inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06]
         px-2.5 py-1 text-xs font-medium text-slate-300;
}
.pay {
  @apply inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.06]
         px-2 py-1 text-[11px] font-semibold text-slate-300;
}

@media (prefers-reduced-motion: reduce) {
  .foot-link::after { transition: none; }
  .soc { @apply hover:translate-y-0; }
}
</style>
