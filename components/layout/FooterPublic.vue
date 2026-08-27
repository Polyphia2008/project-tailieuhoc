<script setup lang="ts">
const { subjects } = useSubjects()
const year = new Date().getFullYear()

const LINKS = [
  { label: 'Thư viện tài liệu', to: '/tai-lieu' },
  { label: 'Tài liệu miễn phí', to: '/tai-lieu?free=true' },
  { label: 'Đăng bán tài liệu', to: '/dashboard/tai-lieu' },
  { label: 'Blog kiến thức', to: '/blog' },
  { label: 'Hướng dẫn sử dụng', to: '/blog/huong-dan-dang-ban-tai-lieu-tren-mapdocs' }
]

const SOCIAL = [
  { icon: 'simple-icons:facebook', href: 'https://facebook.com/mapdocs.vn', label: 'Facebook' },
  { icon: 'simple-icons:youtube', href: 'https://youtube.com', label: 'YouTube' },
  { icon: 'simple-icons:tiktok', href: 'https://tiktok.com', label: 'TikTok' }
]
</script>

<template>
  <footer class="bg-[#09090b] border-t border-mdk-line">
    <div class="container-x py-12">
      <div class="grid gap-9 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-[10px] grid place-items-center text-white" style="background: linear-gradient(135deg, #3b82f6, #f97316)">
              <AppIcon name="solar:book-bookmark-bold" size="19" />
            </span>
            <span class="text-[17px] font-extrabold text-white font-ui tracking-tight">MapDocs</span>
          </div>
          <p class="mt-3.5 text-[13px] text-zinc-500 leading-relaxed max-w-[280px]">
            Kho tài liệu học tập chất lượng cao. Nền tảng chia sẻ và mua bán tài liệu dành cho học sinh, sinh viên và giáo viên Việt Nam.
          </p>
          <div class="mt-4 flex items-center gap-2">
            <a
              v-for="s in SOCIAL"
              :key="s.label"
              :href="s.href"
              target="_blank"
              rel="noopener"
              :aria-label="s.label"
              class="w-8 h-8 grid place-items-center rounded-lg bg-white/[.06] border border-white/[.08] text-zinc-400 hover:text-white hover:bg-white/[.12] transition"
            >
              <AppIcon :name="s.icon" size="14" />
            </a>
          </div>
        </div>

        <div>
          <p class="text-[12px] font-bold text-white uppercase tracking-wider font-ui">Môn học</p>
          <ul class="mt-4 grid grid-cols-2 gap-y-2 gap-x-3">
            <li v-for="s in subjects" :key="s.key">
              <NuxtLink :to="`/tai-lieu?subject=${s.key}`" class="text-[13px] text-zinc-500 hover:text-white transition-colors">
                {{ s.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="text-[12px] font-bold text-white uppercase tracking-wider font-ui">Liên kết</p>
          <ul class="mt-4 space-y-2">
            <li v-for="l in LINKS" :key="l.to">
              <NuxtLink :to="l.to" class="text-[13px] text-zinc-500 hover:text-white transition-colors">
                {{ l.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="text-[12px] font-bold text-white uppercase tracking-wider font-ui">Liên hệ</p>
          <ul class="mt-4 space-y-3 text-[13px] text-zinc-500">
            <li class="flex items-start gap-2.5">
              <AppIcon name="solar:phone-bold-duotone" size="16" class="mt-0.5 text-primary-400 shrink-0" />
              <span>Hotline: <b class="text-zinc-300 font-semibold">1900 6868</b></span>
            </li>
            <li class="flex items-start gap-2.5">
              <AppIcon name="solar:letter-bold-duotone" size="16" class="mt-0.5 text-primary-400 shrink-0" />
              <span>hotro@mapdocs.vn</span>
            </li>
            <li class="flex items-start gap-2.5">
              <AppIcon name="solar:map-point-bold-duotone" size="16" class="mt-0.5 text-primary-400 shrink-0" />
              <span class="leading-relaxed">Tầng 12, Toà nhà Sunrise, 90 Nguyễn Chí Thanh, Đống Đa, Hà Nội</span>
            </li>
          </ul>
          <div class="mt-4 flex items-center gap-2">
            <span class="pill bg-white/[.06] text-zinc-400 text-[10.5px] border border-white/[.08]">
              <AppIcon name="solar:shield-check-bold" size="12" class="text-emerald-400" /> Bảo mật SSL
            </span>
            <span class="pill bg-white/[.06] text-zinc-400 text-[10.5px] border border-white/[.08]">VNPay</span>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-mdk-line">
      <div class="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-[12.5px] text-zinc-600">© {{ year }} MapDocs. Tất cả quyền được bảo lưu.</p>
        <div class="flex items-center gap-5 text-[12.5px] text-zinc-600">
          <span class="hover:text-zinc-400 transition-colors cursor-default">Điều khoản</span>
          <span class="hover:text-zinc-400 transition-colors cursor-default">Bảo mật</span>
          <span class="hover:text-zinc-400 transition-colors cursor-default">Bản quyền</span>
        </div>
      </div>
    </div>
  </footer>
</template>
