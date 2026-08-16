<script setup lang="ts">
useSeoMeta({
  title: 'Blog học tập — Kinh nghiệm ôn thi & phương pháp học | MapDocs',
  description: 'Chia sẻ lộ trình ôn thi THPT Quốc gia, phương pháp học hiệu quả, cấu trúc đề thi mới nhất và kinh nghiệm từ giáo viên, học sinh giỏi.',
  ogTitle: 'Blog học tập — MapDocs',
  ogDescription: 'Kinh nghiệm ôn thi, phương pháp học và cập nhật cấu trúc đề thi mới nhất.'
})

const { number, date, timeAgo } = useFormat()
const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const q = ref(String(route.query.q || ''))
const search = ref(q.value)

const { data, pending } = await useAsyncData(
  'blog-list',
  () => $fetch<any>('/api/blogs', { query: { page: page.value, limit: 9, q: search.value } }),
  { watch: [page, search] }
)

const items = computed<any[]>(() => data.value?.data?.items || [])
const total = computed(() => data.value?.data?.total || 0)
const totalPages = computed(() => data.value?.data?.totalPages || 1)

const featured = computed(() => (page.value === 1 && !search.value ? items.value[0] : null))
const rest = computed(() => (featured.value ? items.value.slice(1) : items.value))

let timer: any = null
watch(q, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { search.value = v.trim(); page.value = 1 }, 400)
})

watch([page, search], () => {
  router.replace({ query: { ...(search.value ? { q: search.value } : {}), ...(page.value > 1 ? { page: page.value } : {}) } })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})

const clearSearch = () => { q.value = ''; search.value = ''; page.value = 1 }
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-900 to-primary-950 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12 md:py-16 text-center">
        <span class="badge bg-accent-500 text-white mb-3"><AppIcon name="fa-newspaper" class="mr-1" /> Blog MapDocs</span>
        <h1 class="text-3xl md:text-4xl font-extrabold">Kinh nghiệm học tập & ôn thi</h1>
        <p class="text-white/80 mt-3 max-w-2xl mx-auto">
          Lộ trình ôn thi, phương pháp học hiệu quả và cập nhật cấu trúc đề thi mới nhất —
          chia sẻ bởi giáo viên và học sinh giỏi trên MapDocs.
        </p>

        <div class="max-w-xl mx-auto mt-6 relative">
          <AppIcon name="fa-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="q" type="text"
            class="w-full h-12 pl-11 pr-11 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="Tìm bài viết theo từ khoá…" >
          <button v-if="q" class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100"
            @click="clearSearch"><AppIcon name="fa-xmark" /></button>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <p v-if="search" class="text-sm text-slate-600 mb-5">
        Tìm thấy <strong class="text-primary-900">{{ number(total) }}</strong> bài viết cho
        “<strong>{{ search }}</strong>”
        <button class="link ml-2" @click="clearSearch">Xoá bộ lọc</button>
      </p>

      <!-- Loading skeleton -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card overflow-hidden animate-pulse">
          <div class="h-44 bg-slate-200" />
          <div class="p-5 space-y-3">
            <div class="h-4 bg-slate-200 rounded w-3/4" />
            <div class="h-4 bg-slate-200 rounded w-1/2" />
            <div class="h-3 bg-slate-100 rounded" />
            <div class="h-3 bg-slate-100 rounded w-5/6" />
          </div>
        </div>
      </div>

      <UiEmpty v-else-if="!items.length" icon="fa-newspaper" title="Không tìm thấy bài viết"
        :desc="search ? 'Thử từ khoá khác hoặc xoá bộ lọc tìm kiếm.' : 'Blog sẽ sớm có những bài viết đầu tiên.'">
        <button v-if="search" class="btn btn-outline btn-sm" @click="clearSearch">Xoá bộ lọc</button>
        <NuxtLink v-else to="/tai-lieu" class="btn btn-primary btn-sm">Khám phá tài liệu</NuxtLink>
      </UiEmpty>

      <template v-else>
        <!-- Featured -->
        <NuxtLink v-if="featured" :to="`/blog/${featured.slug}`"
          class="card overflow-hidden grid grid-cols-1 lg:grid-cols-2 mb-8 group hover:shadow-hover transition">
          <div class="h-56 lg:h-full min-h-[220px] bg-gradient-to-br from-primary-900 to-primary-950 relative overflow-hidden">
            <img v-if="featured.thumbnail || featured.cover" :src="featured.thumbnail || featured.cover" :alt="featured.title"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500" >
            <div v-else class="w-full h-full grid place-items-center text-white/25 text-6xl"><AppIcon name="fa-newspaper" /></div>
            <span class="absolute top-3 left-3 badge bg-accent-500 text-white"><AppIcon name="fa-star" variant="bold" class="mr-1" /> Nổi bật</span>
          </div>
          <div class="p-6 lg:p-8 flex flex-col justify-center">
            <div v-if="featured.tags?.length" class="flex flex-wrap gap-1.5 mb-3">
              <span v-for="t in featured.tags.slice(0, 3)" :key="t" class="badge bg-primary-50 text-primary-900">#{{ t }}</span>
            </div>
            <h2 class="text-xl lg:text-2xl font-extrabold text-slate-800 leading-snug group-hover:text-primary-900 transition">
              {{ featured.title }}
            </h2>
            <p class="text-slate-600 mt-3 line-clamp-3">{{ featured.excerpt }}</p>
            <div class="flex items-center gap-4 text-xs text-slate-500 mt-4">
              <span class="flex items-center gap-1.5">
                <UiAvatar :name="featured.author_name || 'MapDocs'" :size="24" />
                {{ featured.author_name || 'MapDocs' }}
              </span>
              <span><AppIcon name="fa-calendar" class="mr-1" />{{ date(featured.created_at) }}</span>
              <span><AppIcon name="fa-eye" class="mr-1" />{{ number(featured.view_count || 0) }}</span>
            </div>
            <span class="link mt-4 font-semibold">Đọc bài viết <AppIcon name="fa-arrow-right" class="ml-1" /></span>
          </div>
        </NuxtLink>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink v-for="b in rest" :key="b.id" :to="`/blog/${b.slug}`"
            class="card overflow-hidden flex flex-col group hover:shadow-hover transition">
            <div class="h-44 bg-gradient-to-br from-primary-900 to-primary-950 relative overflow-hidden shrink-0">
              <img v-if="b.thumbnail || b.cover" :src="b.thumbnail || b.cover" :alt="b.title"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500" >
              <div v-else class="w-full h-full grid place-items-center text-white/25 text-5xl"><AppIcon name="fa-newspaper" /></div>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <div v-if="b.tags?.length" class="flex flex-wrap gap-1.5 mb-2">
                <span v-for="t in b.tags.slice(0, 2)" :key="t" class="badge bg-slate-100 text-slate-600 text-[11px]">#{{ t }}</span>
              </div>
              <h3 class="font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-primary-900 transition">
                {{ b.title }}
              </h3>
              <p class="text-sm text-slate-500 mt-2 line-clamp-3 flex-1">{{ b.excerpt }}</p>
              <div class="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
                <span><AppIcon name="fa-clock" class="mr-1" />{{ timeAgo(b.created_at) }}</span>
                <span><AppIcon name="fa-eye" class="mr-1" />{{ number(b.view_count || 0) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <UiPagination :page="page" :total-pages="totalPages" @change="(p:number) => (page = p)" />
      </template>
    </div>
  </div>
</template>
