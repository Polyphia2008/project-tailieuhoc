<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { num, compact, date } = useFormat()

const page = ref(1)
const q = ref('')
const filter = ref('all')

const query = computed(() => {
  const base: Record<string, any> = { page: page.value, limit: 12, q: q.value || undefined }
  if (filter.value === 'published') base.published = true
  else if (filter.value === 'draft') base.published = false
  return base
})

const { data, pending, refresh } = await useFetch<any>('/api/admin/blogs', { query })

const counts = computed(() => data.value?.counts || {})
const rows = computed<any[]>(() => data.value?.items || [])

const TABS = [
  { key: 'all', label: 'Tất cả', c: 'all' },
  { key: 'published', label: 'Đã xuất bản', c: 'published' },
  { key: 'draft', label: 'Bản nháp', c: 'draft' }
]

const COVERS = [
  'linear-gradient(140deg,#7c3aed,#2563eb)',
  'linear-gradient(140deg,#0ea5e9,#06b6d4)',
  'linear-gradient(140deg,#10b981,#047857)',
  'linear-gradient(140deg,#f97316,#c2410c)',
  'linear-gradient(140deg,#f43f5e,#be123c)',
  'linear-gradient(140deg,#8b5cf6,#4c1d95)'
]

function coverBg(b: any, i: number) {
  if (b.cover && b.cover.startsWith('http')) return `url(${b.cover}) center/cover`
  return COVERS[i % COVERS.length]
}

const busy = ref(false)
const open = ref(false)
const editing = ref<any>(null)
const tagsInput = ref('')

const f = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover: '',
  published: true
})

function openCreate() {
  editing.value = null
  f.title = ''
  f.slug = ''
  f.excerpt = ''
  f.content = ''
  f.cover = ''
  f.published = true
  tagsInput.value = ''
  open.value = true
}

async function openEdit(b: any) {
  editing.value = b
  f.title = b.title
  f.slug = b.slug
  f.excerpt = b.excerpt || ''
  f.cover = b.cover || ''
  f.published = Boolean(b.published)
  tagsInput.value = (b.tags || []).join(', ')
  f.content = ''
  open.value = true
  try {
    const full = await $fetch<any>('/api/admin/blog-detail', { query: { id: b.id } })
    f.content = full?.blog?.content || ''
  } catch {
    f.content = ''
  }
}

async function submit() {
  if (!f.title.trim()) {
    toast.error('Vui lòng nhập tiêu đề')
    return
  }
  if (!editing.value && !f.content.trim()) {
    toast.error('Vui lòng nhập nội dung bài viết')
    return
  }
  busy.value = true
  try {
    const tags = tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean)
    const body: Record<string, any> = editing.value
      ? { action: 'update', id: editing.value.id, title: f.title, excerpt: f.excerpt, cover: f.cover, tags, published: f.published }
      : { action: 'create', title: f.title, slug: f.slug || undefined, excerpt: f.excerpt, content: f.content, cover: f.cover, tags, published: f.published }
    if (editing.value && f.content.trim()) body.content = f.content
    await $fetch('/api/admin/blogs', { method: 'POST', body })
    await refresh()
    open.value = false
    toast.success(editing.value ? 'Đã cập nhật bài viết' : 'Đã thêm bài viết mới')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không lưu được bài viết')
  } finally {
    busy.value = false
  }
}

async function togglePublish(b: any) {
  busy.value = true
  try {
    await $fetch('/api/admin/blogs', { method: 'POST', body: { action: b.published ? 'unpublish' : 'publish', ids: [b.id] } })
    await refresh()
    toast.success(b.published ? 'Đã chuyển về bản nháp' : 'Đã xuất bản bài viết')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thực hiện được hành động')
  } finally {
    busy.value = false
  }
}

const delOpen = ref(false)
const delTarget = ref<any>(null)

function openDelete(b: any) {
  delTarget.value = b
  delOpen.value = true
}

async function submitDelete() {
  busy.value = true
  try {
    await $fetch('/api/admin/blogs', { method: 'POST', body: { action: 'delete', ids: [delTarget.value.id] } })
    await refresh()
    delOpen.value = false
    toast.success('Đã xoá bài viết')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không xoá được bài viết')
  } finally {
    busy.value = false
  }
}

watch(filter, () => {
  page.value = 1
})

useHead({ title: 'Bài viết - MapDocs Admin' })
</script>

<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Bài viết</span>
    </nav>
    <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-bold text-mdk-text font-ui tracking-tight">Bài viết blog</h1>
        <p class="mt-1 text-[13px] text-mdk-mute">
          {{ num(counts.all || 0) }} bài viết · {{ num(counts.published || 0) }} đã xuất bản · {{ compact(counts.views || 0) }} lượt xem
        </p>
      </div>
      <button class="btn-primary btn-sm" @click="openCreate">
        <AppIcon name="solar:add-circle-bold" size="16" /> Thêm bài viết
      </button>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-3">
      <div class="tab-row no-scrollbar">
        <button v-for="t in TABS" :key="t.key" class="tab whitespace-nowrap" :class="filter === t.key ? 'tab-on' : ''" @click="filter = t.key">
          {{ t.label }} <span class="text-xs opacity-70">({{ counts[t.c] || 0 }})</span>
        </button>
      </div>
      <div class="relative flex-1 min-w-[180px] max-w-[280px]">
        <AppIcon name="solar:magnifer-linear" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
        <input v-model="q" type="search" placeholder="Tìm bài viết..." class="input h-9 pl-9 text-[13px]" @keyup.enter="page = 1; refresh()" />
      </div>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-2">
      <article
        v-for="(b, i) in rows"
        :key="b.id"
        class="card-dv overflow-hidden flex flex-col"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: i * 50 } }"
      >
        <div class="h-32 relative" :style="{ background: coverBg(b, i) }">
          <span class="absolute top-3 right-3" :class="b.published ? 'pill-green' : 'pill-amber'">
            {{ b.published ? 'Đã xuất bản' : 'Bản nháp' }}
          </span>
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <h2 class="text-[15.5px] font-bold text-mdk-text font-ui leading-snug line-clamp-2">{{ b.title }}</h2>
          <p class="mt-2 text-[12.5px] text-mdk-mute leading-relaxed line-clamp-2 flex-1">{{ b.excerpt }}</p>
          <div v-if="b.tags?.length" class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="t in b.tags.slice(0, 4)" :key="t" class="pill-slate text-[10.5px]">{{ t }}</span>
          </div>
          <div class="mt-4 pt-4 border-t border-mdk-line flex items-center gap-2.5">
            <UiAvatar :name="b.author?.name" :src="b.author?.avatar" :size="28" />
            <div class="min-w-0 flex-1">
              <p class="text-[12.5px] font-medium text-mdk-sub truncate">{{ b.author?.name || 'MapDocs' }}</p>
              <p class="text-[11px] text-mdk-mute">{{ date(b.created_at) }} · {{ compact(b.view_count || 0) }} xem</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                class="w-7 h-7 grid place-items-center rounded-md hover:bg-mdk-line"
                :class="b.published ? 'text-amber-400' : 'text-emerald-400'"
                :title="b.published ? 'Chuyển về nháp' : 'Xuất bản'"
                :disabled="busy"
                @click="togglePublish(b)"
              >
                <AppIcon :name="b.published ? 'solar:eye-closed-bold' : 'solar:eye-bold'" size="16" />
              </button>
              <button class="w-7 h-7 grid place-items-center rounded-md text-primary-400 hover:bg-primary-500/15" title="Sửa" :disabled="busy" @click="openEdit(b)">
                <AppIcon name="solar:pen-2-bold" size="15" />
              </button>
              <button class="w-7 h-7 grid place-items-center rounded-md text-red-400 hover:bg-red-500/15" title="Xoá" :disabled="busy" @click="openDelete(b)">
                <AppIcon name="solar:trash-bin-trash-bold" size="15" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <UiEmpty v-if="!pending && !rows.length" icon="solar:notebook-bold-duotone" title="Chưa có bài viết nào" description="Viết bài blog đầu tiên để chia sẻ kinh nghiệm học tập.">
      <button class="btn-primary btn-sm" @click="openCreate">Thêm bài viết</button>
    </UiEmpty>

    <div v-if="(data?.pages || 1) > 1" class="mt-6 flex items-center justify-center gap-2">
      <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
      <span class="text-[13px] text-mdk-sub px-2">{{ page }} / {{ data?.pages }}</span>
      <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
    </div>

    <UiDialog v-model="open" :title="editing ? 'Sửa bài viết' : 'Thêm bài viết'" description="Nội dung hỗ trợ Markdown cơ bản." width="max-w-2xl">
      <div class="space-y-3.5">
        <div>
          <label class="label">Tiêu đề</label>
          <input v-model="f.title" class="input" placeholder="Tiêu đề bài viết" />
        </div>
        <div v-if="!editing">
          <label class="label">Slug (để trống sẽ tự sinh)</label>
          <input v-model="f.slug" class="input font-mono text-[13px]" placeholder="huong-dan-on-thi" />
        </div>
        <div>
          <label class="label">Mô tả ngắn</label>
          <textarea v-model="f.excerpt" rows="2" class="textarea" placeholder="Tóm tắt hiển thị ở danh sách..." />
        </div>
        <div>
          <label class="label">Nội dung {{ editing ? '(để trống nếu không đổi)' : '' }}</label>
          <textarea v-model="f.content" rows="8" class="textarea font-mono text-[12.5px]" placeholder="## Tiêu đề mục&#10;&#10;Nội dung bài viết..." />
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Ảnh bìa (URL)</label>
            <input v-model="f.cover" class="input text-[13px]" placeholder="https://..." />
          </div>
          <div>
            <label class="label">Tags (phân cách bởi dấu phẩy)</label>
            <input v-model="tagsInput" class="input text-[13px]" placeholder="ôn thi, toán, lớp 12" />
          </div>
        </div>
        <label class="flex items-center gap-3 cursor-pointer rounded-xl border border-mdk-line bg-mdk-soft p-3">
          <span class="switch" :class="f.published ? 'switch-on' : ''" @click.prevent="f.published = !f.published">
            <span class="switch-dot" :class="f.published ? 'translate-x-5' : 'translate-x-0'" />
          </span>
          <span>
            <span class="block text-[13px] font-medium text-mdk-text">Xuất bản ngay</span>
            <span class="block text-[12px] text-mdk-mute">Tắt để lưu dưới dạng bản nháp</span>
          </span>
        </label>
      </div>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="open = false">Huỷ</button>
        <button class="btn-primary btn-sm" :disabled="busy" @click="submit">
          <UiSpinner v-if="busy" :size="14" /> {{ editing ? 'Lưu thay đổi' : 'Thêm bài viết' }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="delOpen" title="Xoá bài viết" :description="delTarget ? delTarget.title : ''" width="max-w-md">
      <p class="text-[13px] text-mdk-sub leading-relaxed">Bài viết sẽ bị xoá vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.</p>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn-danger btn-sm" :disabled="busy" @click="submitDelete">
          <UiSpinner v-if="busy" :size="14" /> Xoá bài viết
        </button>
      </template>
    </UiDialog>
  </div>
</template>
