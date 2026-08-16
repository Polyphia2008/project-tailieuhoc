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
useSeoMeta({ title: 'MapDocs - Kho tài liệu học tập chất lượng cao' })
</script>

<template>
  <div>
    <!-- HERO -->
    <section id="hero-section" class="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white overflow-hidden">
      <div class="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-accent-500/20 blur-3xl" />
      <div class="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div class="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 text-center">
        <span class="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
          <AppIcon name="fa-graduation-cap" class="mr-2 text-accent-500" />Nền tảng tài liệu học tập số 1 Việt Nam
        </span>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-3xl mx-auto">
          Kho tài liệu học tập chất lượng cao
        </h1>
        <p class="mt-4 text-white/80 max-w-2xl mx-auto leading-relaxed">
          Hàng nghìn đề thi, chuyên đề, bài giảng từ giáo viên giỏi trên cả nước. Tải về ngay, học tốt hơn mỗi ngày.
        </p>
        <form class="mt-8 max-w-2xl mx-auto" @submit.prevent="search">
          <div class="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl sm:rounded-full p-2 shadow-hover">
            <div class="relative flex-1">
              <AppIcon name="fa-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="hero-search" v-model="q" type="text" placeholder="Tìm đề thi, chuyên đề, bài giảng..."
                class="w-full h-12 pl-11 pr-4 rounded-full border-0 focus:ring-0 text-slate-800 outline-none" />
            </div>
            <button type="submit" class="btn btn-accent h-12 px-8 rounded-full">
              <AppIcon name="fa-magnifying-glass" class="mr-2" />Tìm kiếm
            </button>
          </div>
        </form>
        <div class="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div>
            <p class="text-2xl sm:text-3xl font-extrabold text-accent-500">{{ number(homeData?.stats?.documents) }}+</p>
            <p class="text-sm text-white/70 mt-1">Tài liệu</p>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-extrabold text-accent-500">{{ number(homeData?.stats?.users) }}+</p>
            <p class="text-sm text-white/70 mt-1">Người dùng</p>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-extrabold text-accent-500">{{ compact(homeData?.stats?.downloads) }}+</p>
            <p class="text-sm text-white/70 mt-1">Lượt tải</p>
          </div>
        </div>
      </div>
    </section>

    <!-- DANH MỤC -->
    <section id="categories-section" class="max-w-7xl mx-auto px-4 py-14">
      <h2 class="section-title text-center">Khám phá theo môn học</h2>
      <p class="text-center text-slate-500 mb-8">Chọn môn học bạn quan tâm để xem tài liệu phù hợp</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <NuxtLink v-for="c in homeData?.categories" :key="c.id" :to="`/tai-lieu?subject=${c.slug}`"
          class="group bg-white rounded-xl p-5 text-center shadow-card hover:shadow-hover hover:-translate-y-1 transition-all border border-slate-100">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br grid place-items-center mb-3 group-hover:scale-110 transition-transform"
            :class="meta(c.slug).gradient">
            <AppIcon :name="meta(c.slug).icon" class="text-white text-xl" />
          </div>
          <h3 class="font-semibold text-slate-800 text-sm">{{ c.name }}</h3>
          <p class="text-xs text-slate-400 mt-1">{{ c.doc_count }} tài liệu</p>
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
        <NuxtLink v-for="b in homeData?.blogs" :key="b.id" :to="`/blog/${b.slug}`"
          class="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-hover hover:-translate-y-1 transition-all border border-slate-100">
          <div class="h-32 bg-gradient-to-br from-primary-800 to-primary-950 grid place-items-center">
            <img v-if="b.thumbnail" :src="b.thumbnail" :alt="b.title" class="w-full h-full object-cover" />
            <AppIcon name="fa-newspaper" class="text-white/80 text-3xl" v-else />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-primary-900">{{ b.title }}</h3>
            <p class="text-xs text-slate-500 mt-2 line-clamp-2">{{ b.excerpt }}</p>
            <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
              <span><AppIcon name="fa-calendar" class="mr-1" />{{ date(b.created_at) }}</span>
              <span><AppIcon name="fa-eye" class="mr-1" />{{ compact(b.view_count) }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- CTA -->
    <section id="cta-section" class="max-w-7xl mx-auto px-4 pb-16">
      <div class="relative rounded-3xl bg-gradient-to-r from-accent-500 to-orange-600 text-white p-8 sm:p-12 overflow-hidden">
        <div class="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div class="relative flex flex-col lg:flex-row items-center gap-6 justify-between">
          <div class="text-center lg:text-left">
            <h2 class="text-2xl sm:text-3xl font-extrabold">Bạn có tài liệu hay? Hãy chia sẻ và kiếm tiền!</h2>
            <p class="mt-3 text-white/90 max-w-2xl">
              Đăng bán tài liệu của bạn trên MapDocs và nhận tới <strong>85% doanh thu</strong> mỗi lượt bán. Rút tiền nhanh chóng về tài khoản ngân hàng.
            </p>
          </div>
          <NuxtLink to="/dashboard/dang-ban" class="btn bg-white text-accent-600 hover:bg-slate-100 px-8 h-12 shrink-0">
            <AppIcon name="fa-cloud-arrow-up" class="mr-2" />Đăng bán ngay
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
