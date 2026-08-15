<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Tài liệu đã mua - MapDocs' })

const ui = useUiStore()
const { currency, dateTime, fileSize } = useFormat()
const { meta } = useSubjects()
const page = ref(1)

const { data, pending, refresh } = await useAsyncData('orders',
  () => $fetch<any>('/api/orders', { query: { page: page.value, limit: 10 } }),
  { watch: [page] })

const downloading = ref<string | null>(null)
async function download(docId: string) {
  downloading.value = docId
  try {
    const res: any = await $fetch(`/api/documents/${docId}/download`, { method: 'POST' })
    ui.success(res.message || 'Bắt đầu tải tài liệu')
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể tải tài liệu')
  } finally { downloading.value = null }
}
</script>

<template>
  <section id="purchased-page">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><i class="fa-solid fa-bag-shopping text-accent-500 mr-2" />Tài liệu đã mua</h1>
      <p class="text-slate-500 text-sm mt-1">Danh sách tài liệu bạn đã thanh toán. Tải về không giới hạn số lần.</p>
    </header>

    <UiSpinner v-if="pending" :size="34" label="Đang tải đơn hàng..." />

    <template v-else-if="data?.data">
      <UiEmpty v-if="!data.data.items.length" icon="fa-cart-shopping" title="Bạn chưa mua tài liệu nào"
        desc="Khám phá thư viện hơn 30.000 tài liệu chất lượng cao từ giáo viên trên cả nước.">
        <NuxtLink to="/tai-lieu" class="btn btn-primary"><i class="fa-solid fa-book-open mr-2" />Khám phá thư viện</NuxtLink>
      </UiEmpty>

      <div v-else class="space-y-3">
        <article v-for="o in data.data.items" :key="o.id" class="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <span class="w-14 h-14 rounded-xl bg-gradient-to-br grid place-items-center text-white shrink-0 text-xl" :class="meta(o.document?.subject).gradient">
            <i class="fa-solid" :class="meta(o.document?.subject).icon" />
          </span>
          <div class="flex-1 min-w-0">
            <NuxtLink :to="`/tai-lieu/${o.document?.slug}`" class="font-semibold text-slate-800 hover:text-primary-900 line-clamp-1">
              {{ o.document?.title || 'Tài liệu đã bị gỡ' }}
            </NuxtLink>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
              <span><i class="fa-solid fa-hashtag mr-1" />{{ o.code }}</span>
              <span><i class="fa-regular fa-clock mr-1" />{{ dateTime(o.created_at) }}</span>
              <span><i class="fa-solid fa-credit-card mr-1" />{{ o.payment_method === 'wallet' ? 'Ví MapDocs' : o.payment_method?.toUpperCase() }}</span>
              <span v-if="o.document?.file_size"><i class="fa-solid fa-file mr-1" />{{ o.document.file_type?.toUpperCase() }} · {{ fileSize(o.document.file_size) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 sm:flex-col sm:items-end">
            <span class="font-bold text-accent-500">{{ currency(o.amount) }}</span>
            <button class="btn btn-primary btn-sm" :disabled="downloading === o.document_id || !o.document" @click="download(o.document_id)">
              <i class="fa-solid mr-2" :class="downloading === o.document_id ? 'fa-spinner fa-spin' : 'fa-download'" />Tải xuống
            </button>
          </div>
        </article>

        <UiPagination :page="page" :total-pages="data.data.totalPages" @change="(p:number) => (page = p)" />
      </div>
    </template>
  </section>
</template>
