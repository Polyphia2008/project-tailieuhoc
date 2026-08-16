<script setup lang="ts">
const { data: homeData } = await useAsyncData('home', async () => {
  const [feat, free, cats, stats, blogs] = await Promise.all([
    $fetch<any>('/api/documents', { query: { limit: 8, featured: 'true', sort: 'bestseller' } }),
    $fetch<any>('/api/documents', { query: { limit: 4, type: 'free', sort: 'downloads' } }),
    $fetch<any>('/api/categories'),
    $fetch<any>('/api/stats'),
    $fetch<any>('/api/blogs', { query: { limit: 4 } })
  ])
  return { featured: feat.data.items, free: free.data.items, categories: cats.data, stats: stats.data, blogs: blogs.data.items }
})
const { meta } = useSubjects()
const { compact, number, date } = useFormat()
const router = useRouter()
const q = ref('')
const search = () => router.push({ path: '/tai-lieu', query: q.value.trim() ? { q: q.value.trim() } : {} })

/** Ba the thong ke duoi thanh tim kiem */
const statCards = computed(() => [
  { icon: 'fa-file-lines', label: 'Tài liệu đang bán', value: number(homeData.value?.stats?.documents), tone: 'tone-primary' },
  { icon: 'fa-users', label: 'Người dùng tin dùng', value: number(homeData.value?.stats?.users), tone: 'tone-accent' },
  { icon: 'fa-download', label: 'Lượt tải thành công', value: compact(homeData.value?.stats?.downloads), tone: 'tone-ok' }
])

useSeoMeta({ title: 'MapDocs - Kho tài liệu học tập chất lượng cao' })
</script>

<template>
  <div>
    <!-- HERO SLIDER -->
    <HomeHeroSlider />

    <!-- THANH TÌM KIẾM + THỐNG KÊ -->
    <section id="hero-search-section" class="bg-white border-b border-line">
      <div class="max-w-7xl mx-auto px-4 py-6 lg:py-7">
        <form class="max-w-3xl mx-auto" @submit.prevent="search">
          <div class="flex flex-col sm:flex-row gap-2 rounded-2xl sm:rounded-full bg-surface border border-line p-2 focus-within:shadow-hover focus-within:border-primary-900/25 transition-all">
            <div class="relative flex-1">
              <AppIcon name="fa-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="hero-search" v-model="q" type="text" placeholder="Tìm đề thi, chuyên đề, bài giảng..."
                class="w-full h-11 pl-11 pr-4 rounded-full bg-transparent border-0 focus:ring-0 text-ink outline-none" />
            </div>
            <button type="submit" class="btn btn-accent h-11 px-7 rounded-full">
              <AppIcon name="fa-magnifying-glass" />Tìm kiếm
            </button>
          </div>
        </form>

        <div class="mt-6 grid grid-cols-3 gap-3 max-w-3xl mx-auto">
          <div v-for="st in statCards" :key="st.label" class="stat-chip">
            <span class="stat-chip__icon" :class="st.tone">
              <AppIcon :name="st.icon" />
            </span>
            <div class="min-w-0">
              <p class="text-lg sm:text-2xl font-extrabold text-primary-900 leading-none">{{ st.value }}+</p>
              <p class="text-[11px] sm:text-xs text-ink-soft mt-1 truncate">{{ st.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DANH MỤC (lưới 5 cột × 2 hàng trên desktop) -->
    <section id="categories-section" class="max-w-7xl mx-auto px-4 py-14">
      <h2 class="section-title justify-center">Khám phá theo môn học</h2>
      <p class="text-center text-ink-soft mb-8 mt-1">Chọn môn học bạn quan tâm để xem tài liệu phù hợp</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <NuxtLink
          v-for="(c, i) in homeData?.categories"
          :key="c.id"
          :to="`/tai-lieu?subject=${c.slug}`"
          class="cat-card group"
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 400, delay: Math.min(i * 45, 320) } }"
        >
          <span class="cat-card__icon bg-gradient-to-br" :class="meta(c.slug).gradient">
            <AppIcon :name="meta(c.slug).icon" class="text-white text-xl" />
          </span>
          <h3 class="font-semibold text-ink text-sm group-hover:text-primary-900 transition-colors">{{ c.name }}</h3>
          <p class="text-xs text-ink-soft mt-1">{{ c.doc_count }} tài liệu</p>
        </NuxtLink>
      </div>
    </section>

    <!-- NỔI BẬT -->
    <section id="featured-section" class="max-w-7xl mx-auto px-4 pb-14">
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="section-title mb-1">🔥 Tài liệu nổi bật</h2>
          <p class="text-slate-500 text-sm">Được mua nhiều nhất trong tháng</p>
        </div>
        <NuxtLink to="/tai-lieu?sort=bestseller" class="link text-sm shrink-0">Xem tất cả <AppIcon name="fa-arrow-right" class="ml-1" /></NuxtLink>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DocumentDocCard v-for="(d, i) in homeData?.featured" :key="d.id" :doc="d" :index="i" />
      </div>
    </section>

    <!-- MIỄN PHÍ -->
    <section id="free-section" class="bg-white py-14 border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-end justify-between mb-6">
          <div>
            <h2 class="section-title mb-1">🎁 Tài liệu miễn phí</h2>
            <p class="text-slate-500 text-sm">Tải về hoàn toàn miễn phí, không cần thanh toán</p>
          </div>
          <NuxtLink to="/tai-lieu?type=free" class="link text-sm shrink-0">Xem tất cả <AppIcon name="fa-arrow-right" class="ml-1" /></NuxtLink>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DocumentDocCard v-for="(d, i) in homeData?.free" :key="d.id" :doc="d" :index="i" />
        </div>
      </div>
    </section>

    <!-- BLOG -->
    <section id="blog-section" class="max-w-7xl mx-auto px-4 py-14">
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="section-title mb-1">📰 Tin tức &amp; mẹo học</h2>
          <p class="text-slate-500 text-sm">Kinh nghiệm ôn thi từ giáo viên và thủ khoa</p>
        </div>
        <NuxtLink to="/blog" class="link text-sm shrink-0">Xem tất cả <AppIcon name="fa-arrow-right" class="ml-1" /></NuxtLink>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="(b, i) in homeData?.blogs"
          :key="b.id"
          :to="`/blog/${b.slug}`"
          class="blog-card group"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 420, delay: Math.min(i * 55, 260) } }"
        >
          <div class="blog-card__thumb bg-gradient-to-br from-primary-800 to-primary-950">
            <img v-if="b.thumbnail" :src="b.thumbnail" :alt="b.title" loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <AppIcon v-else name="fa-newspaper" class="text-white/80 text-3xl" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-primary-900 transition-colors">{{ b.title }}</h3>
            <p class="text-xs text-ink-soft mt-2 line-clamp-2 leading-relaxed">{{ b.excerpt }}</p>
            <div class="flex items-center gap-3 mt-3 pt-3 border-t border-line text-xs text-slate-400">
              <span class="inline-flex items-center gap-1"><AppIcon name="fa-calendar" />{{ date(b.created_at) }}</span>
              <span class="inline-flex items-center gap-1"><AppIcon name="fa-eye" />{{ compact(b.view_count) }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- CTA -->
    <section id="cta-section" class="max-w-7xl mx-auto px-4 pb-16">
      <div
        class="cta-banner"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      >
        <span class="cta-banner__glow" aria-hidden="true" />
        <span class="cta-banner__grid" aria-hidden="true" />
        <div class="relative flex flex-col lg:flex-row items-center gap-6 justify-between">
          <div class="text-center lg:text-left">
            <h2 class="text-2xl sm:text-3xl font-extrabold leading-tight">Bạn có tài liệu hay? Hãy chia sẻ và kiếm tiền!</h2>
            <p class="mt-3 text-white/90 max-w-2xl leading-relaxed">
              Đăng bán tài liệu của bạn trên MapDocs và nhận tới <strong>85% doanh thu</strong> mỗi lượt bán. Rút tiền nhanh chóng về tài khoản ngân hàng.
            </p>
          </div>
          <NuxtLink to="/dashboard/dang-ban"
            class="btn bg-white text-accent-600 hover:bg-slate-50 hover:scale-[1.03] px-8 h-12 shrink-0 shadow-lg">
            <AppIcon name="fa-cloud-arrow-up" />Đăng bán ngay
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ===== The thong ke duoi thanh tim kiem ===== */
.stat-chip {
  @apply flex items-center gap-2.5 sm:gap-3 rounded-xl2 border border-line bg-surface px-3 py-2.5 sm:px-4 sm:py-3
         transition-all duration-200 hover:shadow-soft hover:border-primary-900/15;
}
.stat-chip__icon {
  @apply w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl grid place-items-center text-base;
}
.tone-primary { @apply bg-primary-50 text-primary-900; }
.tone-accent { @apply bg-accent-100 text-accent-600; }
.tone-ok { @apply bg-green-50 text-ok; }

/* ===== The mon hoc ===== */
.cat-card {
  @apply block rounded-xl2 border border-line bg-white p-4 sm:p-5 text-center shadow-card
         transition-all duration-200;
}
.cat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(11, 74, 143, 0.12);
  border-color: rgba(11, 74, 143, 0.18);
}
.cat-card__icon {
  @apply w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-3 shadow-soft
         transition-transform duration-300;
}
.cat-card:hover .cat-card__icon { transform: scale(1.08) rotate(-4deg); }

/* ===== The blog ===== */
.blog-card {
  @apply block overflow-hidden rounded-xl2 border border-line bg-white shadow-card transition-all duration-200;
}
.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(11, 74, 143, 0.12);
  border-color: rgba(11, 74, 143, 0.18);
}
.blog-card__thumb {
  @apply h-32 grid place-items-center overflow-hidden;
}

/* ===== Banner CTA ===== */
.cta-banner {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  border-radius: 1.5rem;
  color: #fff;
  background: linear-gradient(120deg, #ff8412 0%, #f06806 55%, #c74e07 100%);
  box-shadow: 0 20px 45px rgba(240, 104, 6, 0.24);
}
@media (min-width: 640px) {
  .cta-banner { padding: 3rem; }
}
.cta-banner__glow {
  position: absolute;
  top: -5rem; right: -4rem;
  width: 18rem; height: 18rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 66%);
  pointer-events: none;
}
.cta-banner__grid {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0 1px, transparent 1px 13px);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .cat-card, .blog-card, .cat-card__icon { transition: none; }
  .cat-card:hover, .blog-card:hover { transform: none; }
  .cat-card:hover .cat-card__icon { transform: none; }
}
</style>
