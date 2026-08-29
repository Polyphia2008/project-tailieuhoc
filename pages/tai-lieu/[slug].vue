<script setup lang="ts">
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { money, price, num, size, dateTime, ago } = useFormat()
const { get, gradient, fileIcon } = useSubjects()
const { download, triggerDownload } = useR2()

const slug = computed(() => String(route.params.slug))
const { data, refresh } = await useFetch<any>(() => `/api/documents/${slug.value}`)

if (!data.value?.document) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })

const doc = computed(() => data.value.document)
const busy = ref(false)
const myRating = ref(5)
const myComment = ref('')

async function toggleFav() {
  if (!auth.loggedIn) return router.push('/auth/dang-nhap')
  try {
    const r = await $fetch<any>(`/api/documents/${doc.value.id}/favorite`, { method: 'POST' })
    data.value.favorited = r.favorited
    toast.success(r.favorited ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích')
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') }
}

async function doDownload() {
  if (!auth.loggedIn) return router.push('/auth/dang-nhap')
  busy.value = true
  try {
    const r = await download(doc.value.id)
    triggerDownload(r.url, r.filename)
    toast.success('Đang tải tài liệu về máy')
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi tải xuống') } finally { busy.value = false }
}

async function buy() {
  if (!auth.loggedIn) return router.push('/auth/dang-nhap')
  busy.value = true
  try {
    const r = await $fetch<any>('/api/orders/checkout', { method: 'POST', body: { document_id: doc.value.id, method: 'wallet' } })
    await $fetch('/api/orders/confirm', { method: 'POST', body: { code: r.order.code } })
    await auth.refresh()
    await refresh()
    toast.success('Mua thành công! Bạn có thể tải tài liệu ngay.')
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi thanh toán') } finally { busy.value = false }
}

async function sendReview() {
  busy.value = true
  try {
    await $fetch(`/api/documents/${doc.value.id}/review`, { method: 'POST', body: { rating: myRating.value, comment: myComment.value } })
    myComment.value = ''
    await refresh()
    toast.success('Cảm ơn bạn đã đánh giá!')
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false }
}

useHead(() => ({ title: `${doc.value?.title || 'Tài liệu'} - MapDocs` }))
</script>

<template>
  <div class="bg-slate-50 min-h-screen pb-14">
    <div class="container-x pt-6">
      <nav class="flex items-center gap-1.5 text-[12.5px] text-slate-400">
        <NuxtLink to="/" class="hover:text-slate-600">Trang chủ</NuxtLink> /
        <NuxtLink to="/tai-lieu" class="hover:text-slate-600">Thư viện</NuxtLink> /
        <span class="text-slate-600 truncate">{{ doc.title }}</span>
      </nav>
    </div>

    <div class="container-x mt-5 grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start">
      <div class="space-y-5">
        <div class="card overflow-hidden">
          <div class="relative h-[190px] sm:h-[230px]" :style="{ background: gradient(doc.subject) }">
            <div class="absolute inset-0 opacity-[.16]" style="background-image: radial-gradient(circle at 18% 22%, #fff 1.6px, transparent 1.8px); background-size: 18px 18px" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            <div class="absolute top-4 left-4 flex flex-wrap gap-2">
              <span class="pill bg-white/22 text-white backdrop-blur-sm font-semibold">{{ get(doc.subject).name }}</span>
              <span class="pill bg-black/30 text-white backdrop-blur-sm">Lớp {{ doc.grade }}</span>
              <span v-if="doc.is_free" class="pill bg-emerald-500 text-white font-bold">MIỄN PHÍ</span>
            </div>
            <AppIcon :name="fileIcon(doc.file_type)" size="74" class="absolute bottom-3 right-4 text-white/25" />
          </div>
          <div class="p-5 sm:p-6">
            <h1 class="text-[21px] sm:text-[26px] font-extrabold text-slate-900 font-ui tracking-tight leading-snug">{{ doc.title }}</h1>
            <div class="mt-3.5 flex flex-wrap items-center gap-4 text-[13px] text-slate-500">
              <UiRating :value="doc.rating_avg" :count="doc.rating_count" show-value />
              <span class="inline-flex items-center gap-1.5"><AppIcon name="solar:eye-linear" size="15" /> {{ num(doc.view_count) }} lượt xem</span>
              <span class="inline-flex items-center gap-1.5"><AppIcon name="solar:download-minimalistic-linear" size="15" /> {{ num(doc.download_count) }} lượt tải</span>
              <span class="inline-flex items-center gap-1.5"><AppIcon name="solar:calendar-linear" size="15" /> {{ ago(doc.created_at) }}</span>
            </div>
            <div v-if="doc.tags?.length" class="mt-4 flex flex-wrap gap-2">
              <span v-for="t in doc.tags" :key="t" class="pill-slate">#{{ t }}</span>
            </div>
            <div class="mt-5 prose prose-sm prose-slate max-w-none">
              <p class="whitespace-pre-line leading-relaxed">{{ doc.description }}</p>
            </div>
          </div>
        </div>

        <div class="card p-5 sm:p-6">
          <h2 class="text-[17px] font-bold text-slate-900 font-ui">Đánh giá ({{ doc.rating_count }})</h2>
          <div v-if="doc.rating_count" class="mt-4 grid sm:grid-cols-[150px_minmax(0,1fr)] gap-5 items-center">
            <div class="text-center">
              <p class="text-[38px] font-extrabold text-slate-900 font-ui leading-none">{{ doc.rating_avg.toFixed(1) }}</p>
              <UiRating :value="doc.rating_avg" :size="16" class="mt-2" />
              <p class="mt-1 text-[12px] text-slate-400">{{ doc.rating_count }} đánh giá</p>
            </div>
            <div class="space-y-1.5">
              <div v-for="d in data.dist" :key="d.star" class="flex items-center gap-2.5 text-[12px]">
                <span class="w-8 text-slate-500">{{ d.star }} ★</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full rounded-full bg-amber-400" :style="{ width: `${doc.rating_count ? (d.count / doc.rating_count) * 100 : 0}%` }" />
                </div>
                <span class="w-7 text-right text-slate-400">{{ d.count }}</span>
              </div>
            </div>
          </div>

          <div v-if="auth.loggedIn && data.owned && !data.reviewed" class="mt-5 pt-5 border-t border-slate-100">
            <p class="label">Đánh giá của bạn</p>
            <UiRating v-model:value="myRating" :size="22" editable />
            <textarea v-model="myComment" rows="3" class="textarea mt-3" placeholder="Chia sẻ cảm nhận về tài liệu này..." />
            <button class="btn-primary mt-3" :disabled="busy" @click="sendReview()">Gửi đánh giá</button>
          </div>

          <div class="mt-5 space-y-4">
            <div v-for="r in data.reviews" :key="r.id" class="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
              <UiAvatar :name="r.user?.name" :size="36" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2.5">
                  <p class="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 font-ui">{{ r.user?.name || 'Người dùng' }}</p>
                  <UiRating :value="r.rating" :size="12" />
                  <span class="text-[11.5px] text-slate-400">{{ ago(r.created_at) }}</span>
                </div>
                <p class="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{{ r.comment }}</p>
              </div>
            </div>
            <UiEmpty v-if="!data.reviews?.length" compact icon="solar:star-linear" title="Chưa có đánh giá" description="Hãy là người đầu tiên đánh giá tài liệu này." />
          </div>
        </div>
      </div>

      <aside class="lg:sticky lg:top-[78px] space-y-4">
        <div class="card p-5">
          <p class="text-[28px] font-extrabold font-ui" :class="doc.is_free ? 'text-emerald-600' : 'text-primary-600'">
            {{ price(doc.price, doc.is_free) }}
          </p>
          <div class="mt-4 space-y-2.5">
            <button v-if="data.owned" class="btn-primary w-full btn-lg" :disabled="busy" @click="doDownload()">
              <AppIcon name="solar:download-minimalistic-bold" size="18" /> Tải tài liệu
            </button>
            <button v-else class="btn-primary w-full btn-lg" :disabled="busy" @click="buy()">
              <AppIcon name="solar:cart-large-4-bold" size="18" /> Mua ngay
            </button>
            <button class="btn-outline w-full" @click="toggleFav()">
              <AppIcon :name="data.favorited ? 'solar:heart-bold' : 'solar:heart-linear'" size="17" :class="data.favorited ? 'text-rose-500' : ''" />
              {{ data.favorited ? 'Đã yêu thích' : 'Yêu thích' }}
            </button>
          </div>
          <dl class="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-[13px]">
            <div class="flex justify-between"><dt class="text-slate-500">Định dạng</dt><dd class="font-medium text-slate-900 dark:text-zinc-100 uppercase">{{ doc.file_type }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Số trang</dt><dd class="font-medium text-slate-900 dark:text-zinc-100">{{ doc.pages }} trang</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Kích thước</dt><dd class="font-medium text-slate-900 dark:text-zinc-100">{{ size(doc.file_size) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Đã bán</dt><dd class="font-medium text-slate-900 dark:text-zinc-100">{{ num(doc.sold_count) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Cập nhật</dt><dd class="font-medium text-slate-900 dark:text-zinc-100">{{ dateTime(doc.updated_at || doc.created_at) }}</dd></div>
          </dl>
        </div>

        <div class="card p-5">
          <p class="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Người đăng</p>
          <div class="mt-3 flex items-center gap-3">
            <UiAvatar :name="doc.seller?.name" :src="doc.seller?.avatar" :size="44" />
            <div class="min-w-0">
              <p class="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 font-ui truncate">{{ doc.seller?.name }}</p>
              <p class="text-[12px] text-slate-400">{{ data.seller_stats?.documents || 0 }} tài liệu</p>
            </div>
          </div>
          <p v-if="doc.seller?.bio" class="mt-3 text-[12.5px] text-slate-500 leading-relaxed">{{ doc.seller.bio }}</p>
          <NuxtLink :to="`/tai-lieu?seller=${doc.seller_id}`" class="btn-outline btn-sm w-full mt-4">Xem tất cả tài liệu</NuxtLink>
        </div>
      </aside>
    </div>

    <div v-if="data.related?.length" class="container-x mt-10">
      <h2 class="text-[19px] font-bold text-slate-900 font-ui">Tài liệu liên quan</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DocumentDocCard v-for="(d, i) in data.related.slice(0, 4)" :key="d.id" :doc="d" :index="i" compact />
      </div>
    </div>
  </div>
</template>
