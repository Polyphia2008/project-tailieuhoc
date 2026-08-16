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

/** Phan bo so sao 5->1 de ve progress bar */
const ratingBreakdown = computed(() => {
  const total = reviews.value.length
  return [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.value.filter((r: any) => Math.round(r.rating) === star).length
    return { star, count, percent: total ? Math.round((count / total) * 100) : 0 }
  })
})

const shareUrl = computed(() => `https://mapdocs.vn/tai-lieu/${slug.value}`)
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ui.success('Đã sao chép liên kết')
  } catch {
    ui.error('Không sao chép được, vui lòng copy thủ công')
  }
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

    <!-- 70 / 30 -->
    <div class="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <!-- LEFT -->
      <article class="min-w-0 space-y-6">
        <div class="card overflow-hidden">
          <div class="doc-hero h-56 sm:h-64 bg-gradient-to-br grid place-items-center relative" :class="s.gradient">
            <span class="doc-hero__pattern" aria-hidden="true" />
            <AppIcon :name="s.icon" class="relative text-white/90 text-6xl" />
            <span v-if="doc.is_free" class="absolute top-4 left-4 bg-ok text-white text-xs font-bold px-3 py-1 rounded-full">MIỄN PHÍ</span>
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
          <h2 class="font-bold text-lg text-ink mb-4">Đánh giá ({{ reviews.length }})</h2>

          <!-- Tong quan: diem + progress tung sao -->
          <div class="rating-box">
            <div class="rating-box__score">
              <span class="text-4xl font-extrabold text-ink leading-none">{{ (doc.rating_avg || 0).toFixed(1) }}</span>
              <UiRating :value="doc.rating_avg" :show-count="false" size="text-base" class="mt-2 justify-center" />
              <p class="text-xs text-ink-soft mt-1">{{ number(doc.rating_count || 0) }} đánh giá</p>
            </div>
            <div class="flex-1 min-w-0 space-y-1.5">
              <div v-for="b in ratingBreakdown" :key="b.star" class="flex items-center gap-2">
                <span class="w-10 shrink-0 text-xs font-medium text-ink-soft tabular-nums">
                  {{ b.star }}<AppIcon name="fa-star" variant="bold" class="ml-1 text-warn text-[10px]" />
                </span>
                <span class="rating-track">
                  <span class="rating-fill" :style="{ width: b.percent + '%' }" />
                </span>
                <span class="w-7 shrink-0 text-right text-xs text-ink-soft tabular-nums">{{ b.count }}</span>
              </div>
            </div>
          </div>

          <div v-if="reviews.length" class="divide-y divide-line mt-2">
            <div v-for="(r, i) in reviews" :key="r.id" class="py-4 flex gap-3"
              v-motion :initial="{ opacity: 0, y: 12 }"
              :visible-once="{ opacity: 1, y: 0, transition: { duration: 380, delay: Math.min(i * 50, 250) } }">
              <UiAvatar :name="r.user?.name" :src="r.user?.avatar" :size="40" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-ink text-sm">{{ r.user?.name || 'Người dùng' }}</span>
                  <UiRating :value="r.rating" :show-count="false" />
                  <span class="text-xs text-slate-400">{{ timeAgo(r.created_at) }}</span>
                </div>
                <p class="text-sm text-ink-soft mt-1 leading-relaxed">{{ r.comment }}</p>
              </div>
            </div>
          </div>
          <p v-else class="py-6 text-center text-ink-soft text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>

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

      <!-- RIGHT (sticky) -->
      <aside class="min-w-0 space-y-4">
        <div class="card p-5 lg:sticky lg:top-20">
          <p class="text-3xl font-extrabold" :class="doc.is_free ? 'text-ok' : 'text-accent-600'">{{ currency(doc.price) }}</p>
          <p v-if="!doc.is_free" class="text-xs text-ink-soft mt-1">Thanh toán 1 lần, tải về vĩnh viễn</p>

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
              <UiPopover width="w-72">
                <template #trigger>
                  <button class="btn btn-outline" aria-label="Chia sẻ tài liệu"><AppIcon name="fa-share-nodes" /></button>
                </template>
                <p class="text-sm font-semibold text-ink mb-2">Chia sẻ tài liệu</p>
                <div class="flex items-center gap-1.5">
                  <input :value="shareUrl" readonly class="input h-9 text-xs flex-1 min-w-0" />
                  <UiTooltip text="Sao chép liên kết">
                    <button class="act" aria-label="Sao chép" @click="copyLink"><AppIcon name="fa-copy" /></button>
                  </UiTooltip>
                </div>
              </UiPopover>
              <UiTooltip text="Báo cáo tài liệu">
                <button class="btn btn-outline" aria-label="Báo cáo tài liệu" @click="reportOpen = true"><AppIcon name="fa-flag" /></button>
              </UiTooltip>
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

    <!-- RELATED: cuon ngang -->
    <section v-if="related.length" id="related-section" class="mt-10">
      <div class="flex items-end justify-between gap-3 mb-4">
        <h2 class="text-xl sm:text-2xl font-extrabold text-ink">Tài liệu liên quan</h2>
        <NuxtLink :to="`/tai-lieu?subject=${doc.subject}`" class="link text-sm shrink-0">
          Xem tất cả<AppIcon name="fa-arrow-right" class="ml-1 text-xs" />
        </NuxtLink>
      </div>
      <div class="related-rail no-scrollbar">
        <div v-for="(d, i) in related" :key="d.id" class="related-rail__item">
          <DocumentDocCard :doc="d" :index="i" />
        </div>
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

<style scoped>
/* Overlay hoa van cho anh bia */
.doc-hero__pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.2), transparent 55%),
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 12px);
}

/* Khoi tong quan danh gia */
.rating-box {
  @apply flex flex-col sm:flex-row items-center sm:items-stretch gap-5 rounded-xl2 border border-line bg-surface p-4 mb-2;
}
.rating-box__score {
  @apply flex flex-col items-center justify-center shrink-0 sm:w-32 sm:border-r sm:border-line sm:pr-5;
}
.rating-track { @apply relative flex-1 h-2 rounded-full bg-slate-200 overflow-hidden; }
.rating-fill {
  @apply absolute inset-y-0 left-0 rounded-full bg-warn;
  transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hang tai lieu lien quan cuon ngang */
.related-rail {
  @apply flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory;
}
.related-rail__item { @apply w-[calc(100%-2rem)] sm:w-56 shrink-0 snap-start; }

.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

@media (prefers-reduced-motion: reduce) {
  .rating-fill { transition: none; }
}
</style>
