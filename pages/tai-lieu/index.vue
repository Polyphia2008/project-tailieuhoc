<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { list } = useSubjects()

const page = ref(Number(route.query.page) || 1)
const filters = reactive({
  q: String(route.query.q || ''),
  subject: String(route.query.subject || ''),
  grade: String(route.query.grade || ''),
  type: String(route.query.type || ''),
  sort: String(route.query.sort || 'newest')
})
const searchInput = ref(filters.q)

const { data, pending, refresh } = await useAsyncData('library',
  () => $fetch<any>('/api/documents', { query: { ...filters, page: page.value, limit: 12 } }),
  { watch: [page, filters] }
)

function syncUrl() {
  const query: any = {}
  Object.entries(filters).forEach(([k, v]) => { if (v && !(k === 'sort' && v === 'newest')) query[k] = v })
  if (page.value > 1) query.page = page.value
  router.replace({ path: '/tai-lieu', query })
}
watch([filters, page], syncUrl, { deep: true })

const doSearch = () => { filters.q = searchInput.value.trim(); page.value = 1 }
const setFilter = (k: 'grade' | 'type' | 'subject', v: string) => { (filters as any)[k] = v; page.value = 1 }
const reset = () => { filters.q = ''; searchInput.value = ''; filters.subject = ''; filters.grade = ''; filters.type = ''; filters.sort = 'newest'; page.value = 1 }

const items = computed(() => data.value?.data?.items || [])
const total = computed(() => data.value?.data?.total || 0)
const totalPages = computed(() => data.value?.data?.totalPages || 1)

const goPage = (p: number) => {
  page.value = p
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

useSeoMeta({ title: 'Thư viện tài liệu - MapDocs' })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <nav class="text-sm text-slate-500 mb-3">
      <NuxtLink to="/" class="hover:text-primary-900">Trang chủ</NuxtLink>
      <i class="fa-solid fa-chevron-right text-[10px] mx-2" />
      <span class="text-slate-700 font-medium">Thư viện tài liệu</span>
    </nav>
    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800">📚 Thư viện tài liệu</h1>
    <p class="text-slate-500 mt-1">Tìm thấy <strong class="text-primary-900">{{ total }}</strong> tài liệu phù hợp</p>

    <!-- SEARCH -->
    <form id="library-search" class="mt-5 flex gap-2" @submit.prevent="doSearch">
      <div class="relative flex-1">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="searchInput" type="text" placeholder="Nhập tên tài liệu, chuyên đề, đề thi..."
          class="input h-12 pl-11" />
      </div>
      <button type="submit" class="btn btn-primary h-12 px-6 shrink-0"><i class="fa-solid fa-magnifying-glass sm:mr-2" /><span class="hidden sm:inline">Tìm kiếm</span></button>
    </form>

    <!-- FILTERS -->
    <div class="card p-4 mt-4 flex flex-col lg:flex-row lg:items-center gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-slate-600 shrink-0">Môn học</label>
        <select v-model="filters.subject" class="input h-9 py-0 w-40" @change="page = 1">
          <option value="">Tất cả môn</option>
          <option v-for="s in list" :key="s.key" :value="s.key">{{ s.label }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <label class="text-sm font-medium text-slate-600 shrink-0">Lớp</label>
        <button class="chip" :class="!filters.grade && 'chip-on'" @click="setFilter('grade', '')">Tất cả</button>
        <button v-for="g in [10, 11, 12]" :key="g" class="chip" :class="filters.grade === String(g) && 'chip-on'" @click="setFilter('grade', String(g))">{{ g }}</button>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <label class="text-sm font-medium text-slate-600 shrink-0">Loại</label>
        <button class="chip" :class="!filters.type && 'chip-on'" @click="setFilter('type', '')">Tất cả</button>
        <button class="chip" :class="filters.type === 'free' && 'chip-on'" @click="setFilter('type', 'free')">Miễn phí</button>
        <button class="chip" :class="filters.type === 'paid' && 'chip-on'" @click="setFilter('type', 'paid')">Trả phí</button>
      </div>
      <div class="flex items-center gap-2 lg:ml-auto">
        <label class="text-sm font-medium text-slate-600 shrink-0">Sắp xếp</label>
        <select v-model="filters.sort" class="input h-9 py-0 w-44" @change="page = 1">
          <option value="newest">Mới nhất</option>
          <option value="popular">Xem nhiều nhất</option>
          <option value="bestseller">Bán chạy nhất</option>
          <option value="rating">Đánh giá cao</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
        </select>
      </div>
    </div>

    <!-- RESULTS -->
    <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <DocumentDocSkeleton :count="8" />
    </div>
    <div v-else-if="items.length" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <DocumentDocCard v-for="d in items" :key="d.id" :doc="d" />
    </div>
    <UiEmpty v-else icon="fa-magnifying-glass" title="Không tìm thấy tài liệu"
      desc="Thử thay đổi từ khoá hoặc bỏ bớt bộ lọc để xem thêm kết quả phù hợp.">
      <button class="btn btn-primary" @click="reset"><i class="fa-solid fa-rotate-left mr-2" />Xoá bộ lọc</button>
    </UiEmpty>

    <UiPagination :page="page" :total-pages="totalPages" @change="goPage" />
  </div>
</template>

<style scoped>
.chip { @apply px-3 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-primary-900 hover:text-primary-900 transition; }
.chip-on { @apply bg-primary-900 border-primary-900 text-white hover:text-white; }
</style>
