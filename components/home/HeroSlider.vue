<script setup lang="ts">
interface Slide {
  id: string
  eyebrow: string
  title: string
  desc: string
  cta: { label: string; to: string }
  icon: string
  /** Lop gradient Tailwind cho nen slide */
  bg: string
}

const slides: Slide[] = [
  {
    id: 'kho-tai-lieu',
    eyebrow: 'Nền tảng tài liệu học tập',
    title: 'Kho tài liệu học tập chất lượng cao',
    desc: 'Hàng nghìn đề thi, chuyên đề, bài giảng biên soạn bởi giáo viên giỏi trên cả nước.',
    cta: { label: 'Khám phá thư viện', to: '/tai-lieu' },
    icon: 'fa-book-open',
    bg: 'from-primary-900 via-primary-800 to-primary-950'
  },
  {
    id: 'de-thi-thu',
    eyebrow: 'Ôn thi THPT Quốc gia',
    title: 'Đề thi thử có giải chi tiết từng câu',
    desc: 'Bộ đề bám sát cấu trúc mới nhất, kèm lời giải và phân tích lỗi thường gặp.',
    cta: { label: 'Xem bộ đề thi', to: '/tai-lieu?q=đề thi' },
    icon: 'fa-file-lines',
    bg: 'from-primary-950 via-primary-900 to-blue-900'
  },
  {
    id: 'mien-phi',
    eyebrow: 'Tải về không mất phí',
    title: 'Hàng trăm tài liệu miễn phí mỗi tuần',
    desc: 'Chuyên đề, công thức, sơ đồ tư duy 10 môn học — tải ngay, không cần thanh toán.',
    cta: { label: 'Lấy tài liệu miễn phí', to: '/tai-lieu?type=free' },
    icon: 'fa-gift',
    bg: 'from-emerald-800 via-emerald-900 to-primary-950'
  },
  {
    id: 'ban-tai-lieu',
    eyebrow: 'Dành cho giáo viên & học sinh giỏi',
    title: 'Chia sẻ tài liệu, nhận 85% doanh thu',
    desc: 'Đăng bán tài liệu của bạn trên MapDocs, rút tiền nhanh về tài khoản ngân hàng.',
    cta: { label: 'Đăng bán ngay', to: '/dashboard/dang-ban' },
    icon: 'fa-cloud-arrow-up',
    bg: 'from-accent-700 via-accent-600 to-amber-700'
  },
  {
    id: 'theo-mon',
    eyebrow: '10 môn học · Lớp 10 · 11 · 12',
    title: 'Tìm đúng tài liệu bạn cần trong 10 giây',
    desc: 'Lọc theo môn, khối lớp, mức giá và đánh giá của người học trước.',
    cta: { label: 'Bắt đầu tìm kiếm', to: '/tai-lieu' },
    icon: 'fa-magnifying-glass',
    bg: 'from-indigo-900 via-primary-900 to-primary-950'
  }
]

const current = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const goTo = (i: number) => { current.value = (i + slides.length) % slides.length }
const next = () => goTo(current.value + 1)
const prev = () => goTo(current.value - 1)

const stop = () => { if (timer) { clearInterval(timer); timer = null } }
const start = () => {
  stop()
  timer = setInterval(() => { if (!paused.value) next() }, 5500)
}

onMounted(start)
onBeforeUnmount(stop)

/* Swipe tren mobile */
const touchX = ref(0)
const onTouchStart = (e: TouchEvent) => { touchX.value = e.touches[0].clientX }
const onTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - touchX.value
  if (Math.abs(dx) > 45) dx < 0 ? next() : prev()
}
</script>

<template>
  <section
    id="hero-slider"
    class="relative overflow-hidden bg-primary-950"
    aria-roledescription="carousel"
    aria-label="Giới thiệu MapDocs"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="relative h-[380px] sm:h-[420px] lg:h-[460px]">
      <Transition
        v-for="(s, i) in slides"
        :key="s.id"
        enter-active-class="transition-opacity duration-700 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-500 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-show="current === i"
          class="absolute inset-0 bg-gradient-to-br"
          :class="s.bg"
          role="group"
          :aria-label="`Slide ${i + 1} / ${slides.length}`"
        >
          <!-- Trang tri -->
          <span class="hero-glow hero-glow--a" aria-hidden="true" />
          <span class="hero-glow hero-glow--b" aria-hidden="true" />
          <span class="hero-grid" aria-hidden="true" />

          <div class="relative h-full max-w-7xl mx-auto px-4 flex items-center">
            <div class="max-w-2xl text-white">
              <span class="hero-eyebrow">
                <AppIcon name="fa-graduation-cap" class="text-accent-400" />{{ s.eyebrow }}
              </span>
              <h2 class="mt-4 text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight">
                {{ s.title }}
              </h2>
              <p class="mt-3 sm:mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
                {{ s.desc }}
              </p>
              <NuxtLink :to="s.cta.to" class="btn btn-accent mt-6 h-11 px-6 rounded-full group/cta">
                {{ s.cta.label }}
                <AppIcon name="fa-arrow-right" class="transition-transform group-hover/cta:translate-x-0.5" />
              </NuxtLink>
            </div>

            <!-- Icon lon ben phai (desktop) -->
            <AppIcon :name="s.icon" class="hero-figure hidden lg:block" aria-hidden="true" />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Nut dieu huong -->
    <button class="hero-arrow left-3" aria-label="Slide trước" @click="prev">
      <AppIcon name="fa-chevron-left" />
    </button>
    <button class="hero-arrow right-3" aria-label="Slide sau" @click="next">
      <AppIcon name="fa-chevron-right" />
    </button>

    <!-- Dots -->
    <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
      <button
        v-for="(s, i) in slides"
        :key="s.id"
        class="hero-dot"
        :class="{ 'hero-dot--on': current === i }"
        :aria-label="`Chuyển tới slide ${i + 1}`"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>

<style scoped>
.hero-eyebrow {
  @apply inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10
         px-3.5 py-1.5 text-xs sm:text-sm font-medium backdrop-blur-sm;
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(64px);
  pointer-events: none;
}
.hero-glow--a {
  top: -7rem; right: -5rem;
  width: 22rem; height: 22rem;
  background: rgba(255, 132, 18, 0.22);
}
.hero-glow--b {
  bottom: -8rem; left: -6rem;
  width: 22rem; height: 22rem;
  background: rgba(255, 255, 255, 0.1);
}
.hero-grid {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 14px);
  pointer-events: none;
}

.hero-figure {
  position: absolute;
  right: 2rem;
  bottom: -1.5rem;
  font-size: 17rem;
  color: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.hero-arrow {
  @apply absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full grid place-items-center
         bg-white/10 text-white border border-white/20 backdrop-blur-sm
         hover:bg-white/25 transition-colors;
}

.hero-dot {
  @apply h-2 rounded-full bg-white/40 transition-all duration-300 hover:bg-white/70;
  width: 0.5rem;
}
.hero-dot--on { @apply bg-accent-500; width: 1.5rem; }

@media (prefers-reduced-motion: reduce) {
  .hero-arrow, .hero-dot { transition: none; }
}
</style>
