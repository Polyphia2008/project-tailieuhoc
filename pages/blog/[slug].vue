<script setup lang="ts">
const route = useRoute()
const ui = useUiStore()
const { number, date, timeAgo } = useFormat()

const slug = computed(() => String(route.params.slug))

const { data, pending, error } = await useAsyncData(
  () => `blog-${slug.value}`,
  () => $fetch<any>(`/api/blogs/${slug.value}`),
  { watch: [slug] }
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy bài viết', fatal: true })
}

const blog = computed<any>(() => data.value?.data?.blog || null)
const related = computed<any[]>(() => data.value?.data?.related || [])

const readMinutes = computed(() => {
  const text = String(blog.value?.content || '').replace(/<[^>]+>/g, ' ')
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200))
})

useSeoMeta({
  title: () => (blog.value ? `${blog.value.title} | Blog MapDocs` : 'Bài viết | MapDocs'),
  description: () => blog.value?.excerpt || '',
  ogTitle: () => blog.value?.title || '',
  ogDescription: () => blog.value?.excerpt || '',
  ogImage: () => blog.value?.thumbnail || blog.value?.cover || '',
  ogType: 'article'
})

const shareUrl = computed(() => (import.meta.client ? window.location.href : `https://mapdocs.vn/blog/${slug.value}`))

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ui.success('Đã sao chép liên kết bài viết')
  } catch {
    ui.error('Không thể sao chép liên kết')
  }
}

const shareFb = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`, '_blank', 'width=600,height=500')
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <!-- Loading -->
    <div v-if="pending" class="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div class="h-4 bg-slate-200 rounded w-40" />
      <div class="h-8 bg-slate-200 rounded w-5/6" />
      <div class="h-8 bg-slate-200 rounded w-2/3" />
      <div class="h-56 bg-slate-200 rounded-2xl" />
      <div class="h-3 bg-slate-100 rounded" />
      <div class="h-3 bg-slate-100 rounded w-11/12" />
      <div class="h-3 bg-slate-100 rounded w-4/5" />
    </div>

    <template v-else-if="blog">
      <!-- Header -->
      <header class="bg-gradient-to-br from-primary-900 to-primary-950 text-white">
        <div class="max-w-3xl mx-auto px-4 py-10 md:py-14">
          <nav class="text-sm text-white/70 flex items-center gap-2 flex-wrap mb-4">
            <NuxtLink to="/" class="hover:text-white">Trang chủ</NuxtLink>
            <i class="fa-solid fa-chevron-right text-[10px]" />
            <NuxtLink to="/blog" class="hover:text-white">Blog</NuxtLink>
            <i class="fa-solid fa-chevron-right text-[10px]" />
            <span class="text-white/50 line-clamp-1">{{ blog.title }}</span>
          </nav>

          <div v-if="blog.tags?.length" class="flex flex-wrap gap-1.5 mb-3">
            <span v-for="t in blog.tags" :key="t" class="badge bg-white/15 text-white">#{{ t }}</span>
          </div>

          <h1 class="text-2xl md:text-4xl font-extrabold leading-tight">{{ blog.title }}</h1>
          <p v-if="blog.excerpt" class="text-white/80 mt-3 leading-relaxed">{{ blog.excerpt }}</p>

          <div class="flex flex-wrap items-center gap-4 text-sm text-white/70 mt-5">
            <span class="flex items-center gap-2">
              <UiAvatar :name="blog.author_name || 'MapDocs'" :src="blog.author?.avatar" :size="32" />
              <span class="text-white font-medium">{{ blog.author_name || blog.author?.name || 'MapDocs' }}</span>
            </span>
            <span><i class="fa-regular fa-calendar mr-1.5" />{{ date(blog.created_at) }}</span>
            <span><i class="fa-regular fa-clock mr-1.5" />{{ readMinutes }} phút đọc</span>
            <span><i class="fa-regular fa-eye mr-1.5" />{{ number(blog.view_count || 0) }} lượt xem</span>
          </div>
        </div>
      </header>

      <div class="max-w-3xl mx-auto px-4 py-8">
        <!-- Cover -->
        <img v-if="blog.thumbnail || blog.cover" :src="blog.thumbnail || blog.cover" :alt="blog.title"
          class="w-full rounded-2xl shadow-card mb-8 object-cover max-h-[420px]" >

        <!-- Content -->
        <article class="card p-6 md:p-8">
          <div class="prose-mapdocs" v-html="blog.content" />

          <!-- Share -->
          <div class="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <span class="text-sm font-semibold text-slate-700">Chia sẻ bài viết:</span>
            <button class="sbtn" title="Chia sẻ Facebook" @click="shareFb">
              <i class="fa-brands fa-facebook-f" /> Facebook
            </button>
            <button class="sbtn" title="Sao chép liên kết" @click="copyLink">
              <i class="fa-solid fa-link" /> Sao chép liên kết
            </button>
          </div>
        </article>

        <!-- CTA -->
        <section class="mt-8 rounded-2xl bg-gradient-to-br from-accent-500 to-orange-600 text-white p-6 md:p-8 text-center shadow-card">
          <h3 class="text-xl font-extrabold">Sẵn sàng ôn tập cùng tài liệu chất lượng?</h3>
          <p class="text-white/85 mt-2 text-sm">Hơn 30 tài liệu được biên soạn bởi giáo viên giàu kinh nghiệm, có cả tài liệu miễn phí.</p>
          <div class="flex flex-wrap justify-center gap-2 mt-5">
            <NuxtLink to="/tai-lieu" class="btn bg-white text-accent-500 hover:bg-slate-100">
              <i class="fa-solid fa-book-open" /> Khám phá tài liệu
            </NuxtLink>
            <NuxtLink to="/auth/dang-ky" class="btn border border-white/60 text-white hover:bg-white/10">
              <i class="fa-solid fa-user-plus" /> Đăng ký miễn phí
            </NuxtLink>
          </div>
        </section>

        <!-- Related -->
        <section v-if="related.length" class="mt-10">
          <h2 class="section-title mb-4">Bài viết liên quan</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <NuxtLink v-for="r in related" :key="r.id" :to="`/blog/${r.slug}`"
              class="card overflow-hidden flex flex-col group hover:shadow-hover transition">
              <div class="h-32 bg-gradient-to-br from-primary-900 to-primary-950 overflow-hidden shrink-0">
                <img v-if="r.thumbnail || r.cover" :src="r.thumbnail || r.cover" :alt="r.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-500" >
                <div v-else class="w-full h-full grid place-items-center text-white/25 text-4xl"><i class="fa-solid fa-newspaper" /></div>
              </div>
              <div class="p-4 flex-1 flex flex-col">
                <h3 class="font-bold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-primary-900 transition">
                  {{ r.title }}
                </h3>
                <div class="text-xs text-slate-400 mt-auto pt-3">
                  <i class="fa-regular fa-clock mr-1" />{{ timeAgo(r.created_at) }}
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>

        <div class="mt-8 text-center">
          <NuxtLink to="/blog" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-arrow-left" /> Quay lại danh sách bài viết
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sbtn { @apply inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary-900 hover:text-primary-900 transition; }

.prose-mapdocs { @apply text-slate-700 leading-relaxed; }
.prose-mapdocs :deep(h2) { @apply text-xl font-extrabold text-slate-800 mt-7 mb-3; }
.prose-mapdocs :deep(h3) { @apply text-lg font-bold text-slate-800 mt-5 mb-2; }
.prose-mapdocs :deep(p) { @apply my-3.5; }
.prose-mapdocs :deep(ul) { @apply list-disc pl-6 my-3.5 space-y-1.5; }
.prose-mapdocs :deep(ol) { @apply list-decimal pl-6 my-3.5 space-y-1.5; }
.prose-mapdocs :deep(li) { @apply leading-relaxed; }
.prose-mapdocs :deep(strong) { @apply font-semibold text-slate-900; }
.prose-mapdocs :deep(a) { @apply text-primary-900 underline hover:text-accent-500; }
.prose-mapdocs :deep(blockquote) { @apply border-l-4 border-accent-500 bg-amber-50 px-4 py-3 my-4 rounded-r-lg italic text-slate-700; }
.prose-mapdocs :deep(img) { @apply rounded-xl my-5 w-full; }
.prose-mapdocs :deep(table) { @apply w-full text-sm my-5 border border-slate-200 rounded-lg overflow-hidden; }
.prose-mapdocs :deep(th) { @apply bg-slate-50 text-left px-3 py-2 font-semibold text-slate-700 border-b border-slate-200; }
.prose-mapdocs :deep(td) { @apply px-3 py-2 border-b border-slate-100; }
.prose-mapdocs :deep(code) { @apply bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-primary-900; }
.prose-mapdocs :deep(hr) { @apply my-6 border-slate-200; }
</style>
