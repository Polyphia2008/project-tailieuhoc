<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý bài viết — MapDocs Admin' })

const ui = useUiStore()
const { number, date } = useFormat()

const page = ref(1)
const q = ref('')
const search = ref('')

const { data, pending, refresh } = await useAsyncData(
  'admin-blogs',
  () => $fetch<any>('/api/blogs', { query: { page: page.value, limit: 12, q: search.value } }),
  { watch: [page, search] }
)

const items = computed<any[]>(() => data.value?.data?.items || [])
const totalPages = computed(() => data.value?.data?.totalPages || 1)
const total = computed(() => data.value?.data?.total || 0)

let timer: any = null
watch(q, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { search.value = v.trim(); page.value = 1 }, 400)
})

// slug helper (mirrors server slugify)
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 90)

// Editor modal
const showEditor = ref(false)
const editing = ref<any>(null)
const busy = ref(false)
const tagInput = ref('')

const blank = () => ({ title: '', slug: '', excerpt: '', content: '', thumbnail: '', tags: [] as string[], published: true })
const form = reactive<any>(blank())

const slugTouched = ref(false)
watch(() => form.title, (v) => { if (!slugTouched.value && !editing.value) form.slug = slugify(v || '') })

const openCreate = () => {
  editing.value = null
  Object.assign(form, blank())
  slugTouched.value = false
  tagInput.value = ''
  showEditor.value = true
}

const openEdit = (b: any) => {
  editing.value = b
  Object.assign(form, {
    title: b.title || '', slug: b.slug || '', excerpt: b.excerpt || '',
    content: b.content || '', thumbnail: b.thumbnail || b.cover || '',
    tags: Array.isArray(b.tags) ? [...b.tags] : [], published: b.published !== false
  })
  slugTouched.value = true
  tagInput.value = ''
  showEditor.value = true
}

const addTag = () => {
  const t = tagInput.value.trim()
  if (!t) return
  if (form.tags.length >= 8) return ui.error('Tối đa 8 thẻ')
  if (form.tags.includes(t)) return ui.error('Thẻ đã tồn tại')
  form.tags.push(t)
  tagInput.value = ''
}
const removeTag = (i: number) => form.tags.splice(i, 1)

const save = async () => {
  if (form.title.trim().length < 10) return ui.error('Tiêu đề tối thiểu 10 ký tự')
  if (form.content.trim().length < 50) return ui.error('Nội dung tối thiểu 50 ký tự')
  busy.value = true
  try {
    const res = await $fetch<any>('/api/admin/blogs', {
      method: 'POST',
      body: {
        action: editing.value ? 'update' : 'create',
        id: editing.value?.id,
        title: form.title.trim(),
        slug: (form.slug || slugify(form.title)).trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        thumbnail: form.thumbnail.trim(),
        tags: form.tags,
        published: form.published
      }
    })
    ui.success(res.message || 'Đã lưu bài viết')
    showEditor.value = false
    await refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể lưu bài viết')
  } finally {
    busy.value = false
  }
}

// Delete
const delTarget = ref<any>(null)
const confirmDelete = async () => {
  if (!delTarget.value) return
  busy.value = true
  try {
    const res = await $fetch<any>('/api/admin/blogs', { method: 'POST', body: { action: 'delete', id: delTarget.value.id } })
    ui.success(res.message || 'Đã xoá bài viết')
    delTarget.value = null
    await refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể xoá bài viết')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Quản lý bài viết</h2>
        <p class="text-sm text-slate-500 mt-0.5">Tổng {{ number(total) }} bài viết trên blog</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" :disabled="pending" @click="refresh()">
          <AppIcon name="fa-rotate" :class="pending ? 'fa-spin' : ''" /> Làm mới
        </button>
        <button class="btn btn-accent btn-sm" @click="openCreate">
          <AppIcon name="fa-plus" /> Viết bài mới
        </button>
      </div>
    </div>

    <div class="card p-4">
      <div class="relative max-w-md">
        <AppIcon name="fa-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input v-model="q" type="text" class="input pl-9" placeholder="Tìm theo tiêu đề, mô tả, nội dung…" >
      </div>
    </div>

    <div v-if="pending" class="card p-10 text-center text-slate-400">
      <UiSpinner /> <span class="ml-2 text-sm">Đang tải bài viết…</span>
    </div>

    <UiEmpty v-else-if="!items.length" icon="fa-newspaper" title="Chưa có bài viết"
      desc="Hãy tạo bài viết đầu tiên cho blog MapDocs.">
      <button class="btn btn-accent btn-sm mt-3" @click="openCreate"><AppIcon name="fa-plus" /> Viết bài mới</button>
    </UiEmpty>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <article v-for="b in items" :key="b.id" class="card overflow-hidden flex flex-col">
        <div class="h-36 bg-gradient-to-br from-primary-900 to-primary-950 relative overflow-hidden">
          <img v-if="b.thumbnail || b.cover" :src="b.thumbnail || b.cover" :alt="b.title" class="w-full h-full object-cover" >
          <div v-else class="w-full h-full grid place-items-center text-white/30 text-4xl"><AppIcon name="fa-newspaper" /></div>
          <span class="absolute top-2 left-2 badge"
            :class="b.published !== false ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'">
            {{ b.published !== false ? 'Đã đăng' : 'Bản nháp' }}
          </span>
        </div>

        <div class="p-4 flex-1 flex flex-col">
          <h3 class="font-bold text-slate-800 line-clamp-2 leading-snug">{{ b.title }}</h3>
          <p class="text-sm text-slate-500 line-clamp-2 mt-1.5 flex-1">{{ b.excerpt }}</p>

          <div v-if="b.tags?.length" class="flex flex-wrap gap-1 mt-2.5">
            <span v-for="t in b.tags.slice(0, 3)" :key="t" class="badge bg-slate-100 text-slate-600 text-[11px]">#{{ t }}</span>
          </div>

          <div class="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            <span><AppIcon name="fa-eye" class="mr-1" />{{ number(b.view_count || 0) }}</span>
            <span><AppIcon name="fa-calendar" class="mr-1" />{{ date(b.created_at) }}</span>
          </div>

          <div class="flex gap-2 mt-3">
            <UiTooltip text="Xem bài viết">
              <NuxtLink :to="`/blog/${b.slug}`" target="_blank" class="act">
                <AppIcon name="fa-arrow-up-right-from-square" />
              </NuxtLink>
            </UiTooltip>
            <UiTooltip text="Sửa">
              <button class="act" @click="openEdit(b)"><AppIcon name="fa-pen" /></button>
            </UiTooltip>
            <UiTooltip text="Xoá">
              <button class="act hover:!border-red-500 hover:!text-red-500" @click="delTarget = b">
                <AppIcon name="fa-trash" />
              </button>
            </UiTooltip>
          </div>
        </div>
      </article>
    </div>

    <UiPagination :page="page" :total-pages="totalPages" @change="(p:number) => (page = p)" />

    <!-- Editor modal -->
    <UiModal v-model="showEditor" :title="editing ? 'Sửa bài viết' : 'Viết bài mới'" width="max-w-3xl">
      <div class="space-y-4">
        <div>
          <label class="label">Tiêu đề <span class="text-red-500">*</span></label>
          <input v-model="form.title" type="text" class="input" maxlength="200" placeholder="Nhập tiêu đề bài viết…" >
          <div class="text-xs text-slate-400 mt-1 text-right">{{ form.title.length }}/200</div>
        </div>

        <div>
          <label class="label">Đường dẫn (slug)</label>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-400 whitespace-nowrap">/blog/</span>
            <input v-model="form.slug" type="text" class="input" maxlength="90" @input="slugTouched = true" >
          </div>
        </div>

        <div>
          <label class="label">Mô tả ngắn</label>
          <textarea v-model="form.excerpt" rows="2" class="input" maxlength="400"
            placeholder="Tóm tắt hiển thị ở danh sách blog…" />
          <div class="text-xs text-slate-400 mt-1 text-right">{{ form.excerpt.length }}/400</div>
        </div>

        <div>
          <label class="label">Ảnh bìa (URL)</label>
          <input v-model="form.thumbnail" type="url" class="input" placeholder="https://…" >
          <img v-if="form.thumbnail" :src="form.thumbnail" alt="preview" class="mt-2 h-32 w-full object-cover rounded-xl border border-slate-200" >
        </div>

        <div>
          <label class="label">Thẻ (tối đa 8)</label>
          <div class="flex gap-2">
            <input v-model="tagInput" type="text" class="input" maxlength="30" placeholder="Nhập thẻ rồi Enter…"
              @keydown.enter.prevent="addTag" >
            <button type="button" class="btn btn-outline btn-sm shrink-0" @click="addTag">Thêm</button>
          </div>
          <div v-if="form.tags.length" class="flex flex-wrap gap-1.5 mt-2">
            <span v-for="(t, i) in form.tags" :key="t" class="badge bg-primary-50 text-primary-900 border border-primary-200">
              #{{ t }}
              <button class="ml-1.5 text-primary-400 hover:text-red-500" @click="removeTag(i)"><AppIcon name="fa-xmark" /></button>
            </span>
          </div>
        </div>

        <div>
          <label class="label">Nội dung <span class="text-red-500">*</span> <span class="font-normal text-slate-400">(hỗ trợ HTML cơ bản)</span></label>
          <textarea v-model="form.content" rows="10" class="input font-mono text-xs leading-relaxed" maxlength="30000"
            placeholder="<h2>Tiêu đề mục</h2>&#10;<p>Nội dung đoạn văn…</p>" />
          <div class="text-xs text-slate-400 mt-1 text-right">{{ form.content.length }}/30000</div>
        </div>

        <label class="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary-900 transition">
          <input v-model="form.published" type="checkbox" class="w-4 h-4 accent-[#0b4a8f]" >
          <span class="text-sm">
            <strong class="text-slate-800">Xuất bản ngay</strong>
            <span class="block text-xs text-slate-500">Bỏ chọn để lưu dưới dạng bản nháp (không hiển thị công khai)</span>
          </span>
        </label>
      </div>

      <template #footer>
        <button class="btn btn-outline btn-sm" :disabled="busy" @click="showEditor = false">Huỷ</button>
        <button class="btn btn-primary btn-sm" :disabled="busy" @click="save">
          <AppIcon name="fa-spinner" v-if="busy" />
          {{ editing ? 'Lưu thay đổi' : 'Đăng bài viết' }}
        </button>
      </template>
    </UiModal>

    <!-- Delete confirm -->
    <UiModal :model-value="!!delTarget" title="Xoá bài viết"
      @update:model-value="(v:boolean) => { if (!v) delTarget = null }">
      <p class="text-sm text-slate-600">
        Bạn có chắc muốn xoá bài viết <strong class="text-slate-800">"{{ delTarget?.title }}"</strong>?
        Hành động này không thể hoàn tác.
      </p>
      <template #footer>
        <button class="btn btn-outline btn-sm" :disabled="busy" @click="delTarget = null">Huỷ</button>
        <button class="btn btn-danger btn-sm" :disabled="busy" @click="confirmDelete">
          <AppIcon name="fa-spinner" v-if="busy" /> Xoá bài viết
        </button>
      </template>
    </UiModal>
  </div>
</template>
