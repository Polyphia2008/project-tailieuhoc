<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { subjects, grades } = useSubjects()

const q = ref(String(route.query.q || ''))
const subject = ref(String(route.query.subject || ''))
const grade = ref(String(route.query.grade || ''))
const free = ref(String(route.query.free || ''))
const sort = ref(String(route.query.sort || 'new'))
const page = ref(Number(route.query.page) || 1)

const query = computed(() => ({
  q: q.value || undefined,
  subject: subject.value || undefined,
  grade: grade.value || undefined,
  free: free.value || undefined,
  sort: sort.value,
  page: page.value,
  limit: 12
}))

const { data, pending, refresh } = await useFetch<any>('/api/documents', { query })

watch([subject, grade, free, sort], () => { page.value = 1 })
watch(query, () => {
  router.replace({ query: { ...query.value, limit: undefined } as any })
})

function submitSearch() {
  page.value = 1
  refresh()
}

useHead({ title: 'Thư viện tài liệu - MapDocs' })
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="bg-[#09090b] py-10">
      <div class="container-x">
        <h1 class="text-[28px] sm:text-[34px] font-extrabold text-white font-ui tracking-tight">Thư viện tài liệu</h1>
        <p class="mt-2 text-[14.5px] text-zinc-400">Tìm kiếm trong {{ data?.total || 0 }} tài liệu đã kiểm duyệt</p>
        <form class="mt-6 relative max-w-[560px]" @submit.prevent="submitSearch">
          <AppIcon name="solar:magnifer-line-duotone" size="17" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input v-model="q" type="search" placeholder="Tìm đề thi, chuyên đề, bài giảng..."
            class="w-full h-12 pl-11 pr-28 rounded-xl bg-white/[.07] border border-white/[.1] text-[14px] text-white placeholder:text-zinc-500 focus:border-white/25 focus:outline-none focus:ring-0" />
          <button type="submit" class="absolute right-1.5 top-1.5 h-9 px-4 rounded-lg bg-primary-600 text-white text-[13px] font-semibold hover:bg-primary-500 transition">Tìm</button>
        </form>
      </div>
    </div>

    <div class="sticky top-[62px] z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div class="container-x py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button class="tab shrink-0" :class="!subject ? 'tab-on' : ''" @click="subject = ''">Tất cả</button>
        <button v-for="s in subjects" :key="s.key" class="tab shrink-0" :class="subject === s.key ? 'tab-on' : ''" @click="subject = s.key">
          <AppIcon :name="s.icon" size="15" /> {{ s.name }}
        </button>
      </div>
    </div>

    <div class="container-x py-7">
      <div class="flex flex-wrap items-center gap-2.5 mb-6">
        <select v-model="grade" class="input h-9 w-auto text-[13px]">
          <option value="">Tất cả lớp</option>
          <option v-for="g in grades" :key="g" :value="String(g)">Lớp {{ g }}</option>
        </select>
        <select v-model="free" class="input h-9 w-auto text-[13px]">
          <option value="">Miễn phí & trả phí</option>
          <option value="true">Chỉ miễn phí</option>
          <option value="false">Chỉ trả phí</option>
        </select>
        <select v-model="sort" class="input h-9 w-auto text-[13px]">
          <option value="new">Mới nhất</option>
          <option value="popular">Xem nhiều</option>
          <option value="sold">Bán chạy</option>
          <option value="rating">Đánh giá cao</option>
          <option value="price-asc">Giá thấp → cao</option>
          <option value="price-desc">Giá cao → thấp</option>
        </select>
        <span class="ml-auto text-[13px] text-slate-500">{{ data?.total || 0 }} kết quả</span>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DocumentDocSkeleton v-if="pending" :count="8" />
        <DocumentDocCard v-for="(d, i) in data?.items || []" v-else :key="d.id" :doc="d" :index="i" />
      </div>

      <UiEmpty v-if="!pending && !data?.items?.length" title="Không tìm thấy tài liệu" description="Thử thay đổi từ khoá hoặc bộ lọc để xem thêm kết quả." />

      <div v-if="(data?.pages || 1) > 1" class="mt-9 flex items-center justify-center gap-2">
        <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
        <span class="text-[13px] text-slate-500 px-2">Trang {{ page }} / {{ data?.pages }}</span>
        <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
      </div>
    </div>
  </div>
</template>
