<script setup lang="ts">
const { subjects } = useSubjects()
const year = new Date().getFullYear()

const LINKS = [
  { label: 'Thư viện tài liệu', to: '/tai-lieu' },
  { label: 'Tài liệu miễn phí', to: '/tai-lieu?free=true' },
  { label: 'Đăng bán tài liệu', to: '/dashboard/tai-lieu' },
  { label: 'Blog kiến thức', to: '/blog' },
  { label: 'Trung tâm hỗ trợ', to: '/ho-tro' },
  { label: 'Liên hệ', to: '/lien-he' }
]

const SOCIAL = [
  { icon: 'simple-icons:facebook', href: 'https://facebook.com', label: 'Facebook' },
  { icon: 'simple-icons:youtube', href: 'https://youtube.com', label: 'YouTube' },
  { icon: 'simple-icons:tiktok', href: 'https://tiktok.com', label: 'TikTok' }
]

const CONTACT = [
  { icon: 'solar:phone-bold-duotone', text: 'Hotline: 1900 6868' },
  { icon: 'solar:letter-bold-duotone', text: 'hotro@mapdocs.vn' },
  { icon: 'solar:map-point-bold-duotone', text: 'Đống Đa, Hà Nội, Việt Nam' },
  { icon: 'solar:clock-circle-bold-duotone', text: '8:00 - 22:00 mỗi ngày' }
]

const PAYMENTS = [
  { icon: 'solar:banknote-2-bold-duotone', label: 'Chuyển khoản' },
  { icon: 'solar:card-bold-duotone', label: 'Thẻ ATM' },
  { icon: 'solar:wallet-money-bold-duotone', label: 'Ví điện tử' },
  { icon: 'solar:shield-check-bold-duotone', label: 'Bảo mật SSL' }
]
</script>

<template>
  <footer class="footer-v3">
    <div class="container-x py-12">
      <div class="grid gap-9 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <SvgLogo variant="full" :size="38" />
          <p class="mt-4 max-w-[290px] text-[13px] leading-relaxed text-foreground/55">
            Nền tảng chia sẻ và mua bán tài liệu học tập dành cho học sinh, sinh viên và giáo viên Việt Nam.
          </p>
          <div class="mt-5 flex items-center gap-2">
            <a
              v-for="s in SOCIAL"
              :key="s.label"
              :href="s.href"
              target="_blank"
              rel="noopener"
              :aria-label="s.label"
              class="social-chip"
            >
              <AppIcon :name="s.icon" size="15" />
            </a>
          </div>
        </div>

        <nav aria-label="Môn học">
          <p class="foot-title font-ui">Môn học</p>
          <ul class="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
            <li v-for="s in subjects" :key="s.key">
              <NuxtLink :to="`/tai-lieu?subject=${s.key}`" class="foot-link">{{ s.name }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <nav aria-label="Liên kết nhanh">
          <p class="foot-title font-ui">Liên kết</p>
          <ul class="mt-4 space-y-2">
            <li v-for="l in LINKS" :key="l.to">
              <NuxtLink :to="l.to" class="foot-link">{{ l.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <p class="foot-title font-ui">Liên hệ</p>
          <ul class="mt-4 space-y-2.5">
            <li v-for="c in CONTACT" :key="c.text" class="flex items-start gap-2.5 text-[13px] text-foreground/58">
              <AppIcon :name="c.icon" size="17" class="mt-0.5 shrink-0 text-cmstdev-500" />
              <span class="leading-relaxed">{{ c.text }}</span>
            </li>
          </ul>
          <div class="mt-5 flex flex-wrap gap-2">
            <span v-for="p in PAYMENTS" :key="p.label" class="pay-chip">
              <AppIcon :name="p.icon" size="14" class="text-cmstdev-500" />
              {{ p.label }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p class="text-[12.5px] text-foreground/45">© {{ year }} MapDocs. Tất cả quyền được bảo lưu.</p>
        <div class="flex items-center gap-5">
          <NuxtLink to="/ho-tro" class="text-[12.5px] text-foreground/45 transition-colors hover:text-cmstdev-500">
            Điều khoản
          </NuxtLink>
          <NuxtLink to="/ho-tro" class="text-[12.5px] text-foreground/45 transition-colors hover:text-cmstdev-500">
            Bảo mật
          </NuxtLink>
          <NuxtLink to="/lien-he" class="text-[12.5px] text-foreground/45 transition-colors hover:text-cmstdev-500">
            Bản quyền
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
