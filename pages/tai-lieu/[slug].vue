<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const api = useApi()
const { meta } = useSubjects()
const { currency, number, fileSize, date, timeAgo } = useFormat()

const slug = computed(() => String(route.params.slug))
const { data, refresh } = await useAsyncData(`doc-${slug.value}`, () => $fetch<any>(`/api/documents/${slug.value}`))
if (!data.value?.data) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })

const doc = computed(() => data.value.data.document)
const reviews = ref<any[]>(data.value.data.reviews || [])
const related = computed(() => data.value.data.related || [])
const owned = ref(!!data.value.data.owned)
const favorited = ref(!!data.value.data.favorited)
const s = computed(() => meta(doc.value.subject))

const busy = ref(false)
const reportOpen = ref(false)
const reportForm = reactive({ reason: 'Nội dung sai lệch', detail: '' })
const reviewForm = reactive({ rating: 5, comment: '' })

function requireLogin() {
  if (!auth.isLoggedIn) {
    navigateTo(`/auth/dang-nhap?redirect=${encodeURIComponent(route.fullPath)}`)
    return false
  }
  return true
}

async function buy() {
  if (!requireLogin()) return
  busy.value = true
  const res = await api.post<any>('/api/orders/checkout', { document_id: doc.value.id, method: 'wallet' })
  busy.value = false
  if (res) { owned.value = true; await auth.fetchMe(); await refresh() }
}

async function buyGateway() {
  if (!requireLogin()) return
  busy.value = true
  const res = await api.post<any>('/api/orders/checkout', { document_id: doc.value.id, method: 'vnpay' })
  busy.value = false
  if (res?.redirect) await navigateTo(res.redirect)
}

async function download() {
  if (!requireLogin()) return
  busy.value = true
  const res = await api.post<any>(`/api/documents/${doc.value.id}/download`)
  busy.value = false
  if (res) ui.success(`Đang tải: ${res.filename}`)
}

async function toggleFav() {
  if (!requireLogin()) return
  const res = await api.post<any>(`/api/documents/${doc.value.id}/favorite`)
  if (res) favorited.value = res.favorited
}

async function submitReview() {
  if (!requireLogin()) return
  if (!reviewForm.comment.trim()) return ui.error('Vui lòng nhập nội dung đánh giá')
  busy.value = true
  const res = await api.post<any>(`/api/documents/${doc.value.id}/review`, { rating: reviewForm.rating, comment: reviewForm.comment })
  busy.value = false
  if (res) { reviewForm.comment = ''; await refresh(); reviews.value = data.value.data.reviews }
}

async function submitReport() {
  if (!requireLogin()) return
  busy.value = true
  const res = await api.post(`/api/documents/${doc.value.id}/report`, { ...reportForm })
  busy.value = false
  if (res) { reportOpen.value = false; reportForm.detail = '' }
}

useSeoMeta({ title: () => `${doc.value?.title} - MapDocs`, description: () => doc.value?.description?.slice(0, 160) })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <nav class="text-sm text-slate-500 mb-4 flex flex-wrap items-center gap-2">
      <NuxtLink to="/" class="hover:text-primary-900">Trang chủ</NuxtLink>
      <AppIcon name="fa-chevron-right" class="text-[10px]" />
      <NuxtLink to="/tai-lieu" class="hover:text-primary-900">Thư viện</NuxtLink>
      <AppIcon name="fa-chevron-right" class="text-[10px]" />
      <NuxtLink :to="`/tai-lieu?subject=${doc.subject}`" class="hover:text-primary-900">{{ s.label }}</NuxtLink>
    </nav>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- LEFT -->
      <article class="lg:col-span-2 space-y-6">
        <div class="card overflow-hidden">
          <div class="h-56 sm:h-64 bg-gradient-to-br grid place-items-center relative" :class="s.gradient">
            <AppIcon :name="s.icon" class="text-white/90 text-6xl" />
            <span v-if="doc.is_free" class="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">MIỄN PHÍ</span>
            <span v-if="doc.featured" class="absolute top-4 right-4 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full"><AppIcon name="fa-fire" variant="bold" class="mr-1" />NỔI BẬT</span>
          </div>
          <div class="p-5 sm:p-6">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="badge" :class="[s.bg, s.text]">{{ s.label }}</span>
              <span v-if="doc.grade" class="badge bg-slate-100 text-slate-700">Lớp {{ doc.grade }}</span>
              <span class="badge bg-slate-100 text-slate-700 uppercase">{{ doc.file_type }}</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug">{{ doc.title }}</h1>
            <div class="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
              <UiRating :value="doc.rating_avg" :count="doc.rating_count" size="text-sm" />
              <span><AppIcon name="fa-eye" class="mr-1" />{{ number(doc.view_count) }} lượt xem</span>
              <span><AppIcon name="fa-download" class="mr-1" />{{ number(doc.download_count) }} lượt tải</span>
              <span><AppIcon name="fa-cart-shopping" class="mr-1" />{{ number(doc.sold_count) }} lượt mua</span>
            </div>
            <div class="prose prose-slate max-w-none mt-5 text-slate-700 whitespace-pre-line leading-relaxed">{{ doc.description }}</div>
            <div v-if="doc.tags?.length" class="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
              <NuxtLink v-for="t in doc.tags" :key="t" :to="`/tai-lieu?q=${encodeURIComponent(t)}`"
                class="badge bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-900 transition"># {{ t }}</NuxtLink>
            </div>
          </div>
        </div>

        <!-- REVIEWS -->
        <section id="reviews-section" class="card p-5 sm:p-6">
          <h2 class="font-bold text-lg text-slate-800 mb-1">Đánh giá ({{ reviews.length }})</h2>
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
            <span class="text-3xl font-extrabold text-slate-800">{{ (doc.rating_avg || 0).toFixed(1) }}</span>
            <UiRating :value="doc.rating_avg" :count="doc.rating_count" size="text-base" />
          </div>

          <div v-if="reviews.length" class="divide-y divide-slate-100">
            <div v-for="r in reviews" :key="r.id" class="py-4 flex gap-3">
              <UiAvatar :name="r.user?.name" :src="r.user?.avatar" :size="40" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-slate-800 text-sm">{{ r.user?.name || 'Người dùng' }}</span>
                  <UiRating :value="r.rating" :show-count="false" />
                  <span class="text-xs text-slate-400">{{ timeAgo(r.created_at) }}</span>
                </div>
                <p class="text-sm text-slate-600 mt-1 leading-relaxed">{{ r.comment }}</p>
              </div>
            </div>
          </div>
          <p v-else class="py-6 text-center text-slate-500 text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>

          <form class="mt-4 pt-4 border-t border-slate-100" @submit.prevent="submitReview">
            <label class="label">Đánh giá của bạn</label>
            <div class="flex items-center gap-1 text-2xl text-amber-400 mb-3">
              <button v-for="i in 5" :key="i" type="button" @click="reviewForm.rating = i">
                <AppIcon
                  name="fa-star"
                  :variant="i <= reviewForm.rating ? 'bold' : 'linear'"
                  :class="i <= reviewForm.rating ? 'text-warn' : 'text-slate-300'"
                />
              </button>
            </div>
            <textarea v-model="reviewForm.comment" rows="3" class="input" placeholder="Chia sẻ cảm nhận của bạn về tài liệu này..." />
            <button type="submit" class="btn btn-primary mt-3" :disabled="busy">
              <AppIcon name="fa-paper-plane" class="mr-2" />Gửi đánh giá
            </button>
          </form>
        </section>
      </article>

      <!-- RIGHT -->
      <aside class="space-y-4">
        <div class="card p-5 lg:sticky lg:top-20">
          <p class="text-3xl font-extrabold" :class="doc.is_free ? 'text-green-600' : 'text-accent-500'">{{ currency(doc.price) }}</p>
          <p v-if="!doc.is_free" class="text-xs text-slate-500 mt-1">Thanh toán 1 lần, tải về vĩnh viễn</p>

          <div class="mt-4 space-y-2">
            <button v-if="owned || doc.is_free" class="btn btn-primary w-full h-11" :disabled="busy" @click="download">
              <AppIcon name="fa-download" class="mr-2" />Tải xuống ngay
            </button>
            <template v-else>
              <button class="btn btn-accent w-full h-11" :disabled="busy" @click="buy">
                <AppIcon name="fa-wallet" class="mr-2" />Mua bằng ví
              </button>
              <button class="btn btn-outline w-full h-11" :disabled="busy" @click="buyGateway">
                <AppIcon name="fa-credit-card" class="mr-2" />Thanh toán VNPay
              </button>
            </template>
            <div class="flex gap-2">
              <button class="btn btn-outline flex-1" @click="toggleFav">
                <AppIcon
                  name="fa-heart"
                  :variant="favorited ? 'bold' : 'linear'"
                  :class="['mr-2', favorited ? 'text-bad' : '']"
                />{{ favorited ? 'Đã thích' : 'Yêu thích' }}
              </button>
              <button class="btn btn-outline" title="Báo cáo tài liệu" @click="reportOpen = true"><AppIcon name="fa-flag" /></button>
            </div>
          </div>

          <div class="mt-5 pt-5 border-t border-slate-100">
            <p class="label mb-2">Người đăng</p>
            <div class="flex items-center gap-3">
              <UiAvatar :name="doc.seller?.name" :src="doc.seller?.avatar" :size="44" />
              <div class="min-w-0">
                <p class="font-semibold text-slate-800 text-sm truncate">{{ doc.seller?.name || 'MapDocs' }}</p>
                <NuxtLink :to="`/tai-lieu?seller=${doc.seller_id}`" class="link text-xs">Xem tài liệu khác</NuxtLink>
              </div>
            </div>
          </div>

          <dl class="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-sm">
            <div class="flex justify-between"><dt class="text-slate-500">Định dạng</dt><dd class="font-medium text-slate-800 uppercase">{{ doc.file_type }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Dung lượng</dt><dd class="font-medium text-slate-800">{{ fileSize(doc.file_size) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Số trang</dt><dd class="font-medium text-slate-800">{{ doc.pages || '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Môn học</dt><dd class="font-medium text-slate-800">{{ s.label }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Lớp</dt><dd class="font-medium text-slate-800">{{ doc.grade || '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Ngày đăng</dt><dd class="font-medium text-slate-800">{{ date(doc.created_at) }}</dd></div>
          </dl>
        </div>
      </aside>
    </div>

    <!-- RELATED -->
    <section v-if="related.length" id="related-section" class="mt-10">
      <h2 class="section-title">Tài liệu liên quan</h2>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DocumentDocCard v-for="(d, i) in related.slice(0, 4)" :key="d.id" :doc="d" :index="i" />
      </div>
    </section>

    <!-- REPORT MODAL -->
    <UiModal v-model="reportOpen" title="Báo cáo tài liệu">
      <div class="space-y-3">
        <div>
          <label class="label">Lý do</label>
          <select v-model="reportForm.reason" class="input">
            <option>Nội dung sai lệch</option>
            <option>Vi phạm bản quyền</option>
            <option>Tài liệu kém chất lượng</option>
            <option>Nội dung không phù hợp</option>
            <option>Lý do khác</option>
          </select>
        </div>
        <div>
          <label class="label">Mô tả chi tiết</label>
          <textarea v-model="reportForm.detail" rows="4" class="input" placeholder="Mô tả cụ thể vấn đề bạn gặp phải..." />
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="reportOpen = false">Huỷ</button>
        <button class="btn btn-danger" :disabled="busy" @click="submitReport"><AppIcon name="fa-flag" class="mr-2" />Gửi báo cáo</button>
      </template>
    </UiModal>
  </div>
</template>
