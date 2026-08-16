<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý danh mục - MapDocs' })

const ui = useUiStore()
const { number } = useFormat()

const { data, pending, refresh } = await useAsyncData('admin-cats', () => $fetch<any>('/api/categories'))
const cats = computed(() => data.value?.data || [])

const ICONS = ['fa-square-root-variable', 'fa-atom', 'fa-flask', 'fa-dna', 'fa-book-open', 'fa-language', 'fa-landmark', 'fa-earth-asia', 'fa-laptop-code', 'fa-scale-balanced', 'fa-book', 'fa-graduation-cap']

const open = ref(false)
const busy = ref(false)
const editing = ref(false)
const form = reactive({ id: '', name: '', slug: '', icon: 'fa-book', color: '#0b4a8f', description: '' })

function openCreate() {
  editing.value = false
  Object.assign(form, { id: '', name: '', slug: '', icon: 'fa-book', color: '#0b4a8f', description: '' })
  open.value = true
}
function openEdit(c: any) {
  editing.value = true
  Object.assign(form, { id: c.id, name: c.name, slug: c.slug, icon: c.icon || 'fa-book', color: c.color || '#0b4a8f', description: c.description || '' })
  open.value = true
}

async function save() {
  if (!form.name.trim()) return ui.error('Vui lòng nhập tên danh mục')
  busy.value = true
  try {
    const res: any = await $fetch('/api/admin/categories', { method: 'POST', body: { ...form, action: editing.value ? 'update' : 'create' } })
    ui.success(res.message)
    open.value = false
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể lưu danh mục')
  } finally { busy.value = false }
}

const delOpen = ref(false)
const target = ref<any>(null)
function askDelete(c: any) { target.value = c; delOpen.value = true }
async function confirmDelete() {
  busy.value = true
  try {
    const res: any = await $fetch('/api/admin/categories', { method: 'POST', body: { action: 'delete', id: target.value.id } })
    ui.success(res.message)
    delOpen.value = false
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể xoá danh mục')
  } finally { busy.value = false }
}
</script>

<template>
  <section id="admin-categories">
    <header class="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800"><AppIcon name="fa-layer-group" class="text-primary-900 mr-2" />Quản lý danh mục</h1>
        <p class="text-slate-500 text-sm mt-1">Danh mục môn học hiển thị trên trang chủ và bộ lọc thư viện.</p>
      </div>
      <button class="btn btn-accent btn-sm" @click="openCreate"><AppIcon name="fa-plus" class="mr-2" />Thêm danh mục</button>
    </header>

    <UiSpinner v-if="pending" :size="34" label="Đang tải danh mục..." />

    <template v-else>
      <UiEmpty v-if="!cats.length" icon="fa-layer-group" title="Chưa có danh mục nào">
        <button class="btn btn-accent" @click="openCreate"><AppIcon name="fa-plus" class="mr-2" />Thêm danh mục</button>
      </UiEmpty>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="c in cats" :key="c.id" class="card p-5 flex items-start gap-4">
          <span class="w-12 h-12 rounded-xl grid place-items-center text-white text-xl shrink-0" :style="{ background: c.color || '#0b4a8f' }">
            <AppIcon :name="c.icon || 'fa-book'" />
          </span>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-800">{{ c.name }}</h3>
            <p class="text-xs text-slate-400">/{{ c.slug }}</p>
            <p v-if="c.description" class="text-sm text-slate-500 mt-1 line-clamp-2">{{ c.description }}</p>
            <p class="text-xs text-primary-900 font-semibold mt-2">{{ number(c.doc_count || 0) }} tài liệu</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <UiTooltip text="Sửa">
              <button class="act" @click="openEdit(c)"><AppIcon name="fa-pen" /></button>
            </UiTooltip>
            <UiTooltip text="Xoá">
              <button class="act hover:!text-red-600 hover:!border-red-300" @click="askDelete(c)"><AppIcon name="fa-trash" /></button>
            </UiTooltip>
          </div>
        </article>
      </div>
    </template>

    <UiModal v-model="open" :title="editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'">
      <div class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label" for="c-name">Tên danh mục <span class="text-red-500">*</span></label>
            <input id="c-name" v-model="form.name" type="text" class="input" maxlength="60" placeholder="VD: Toán học" />
          </div>
          <div>
            <label class="label" for="c-slug">Slug</label>
            <input id="c-slug" v-model="form.slug" type="text" class="input" maxlength="40" placeholder="Tự động nếu để trống" />
          </div>
        </div>
        <div>
          <label class="label">Biểu tượng</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="ic in ICONS" :key="ic" type="button" class="w-10 h-10 rounded-lg border grid place-items-center transition"
              :class="form.icon === ic ? 'border-primary-900 bg-primary-50 text-primary-900' : 'border-slate-200 text-slate-500 hover:border-primary-900'"
              @click="form.icon = ic"><AppIcon :name="ic" /></button>
          </div>
        </div>
        <div>
          <label class="label" for="c-color">Màu sắc</label>
          <div class="flex items-center gap-3">
            <input id="c-color" v-model="form.color" type="color" class="w-14 h-10 rounded-lg border border-slate-200 cursor-pointer" />
            <input v-model="form.color" type="text" class="input" maxlength="20" />
          </div>
        </div>
        <div>
          <label class="label" for="c-desc">Mô tả</label>
          <textarea id="c-desc" v-model="form.description" rows="3" class="input" maxlength="300" />
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="open = false">Huỷ</button>
        <button class="btn btn-primary btn-sm" :disabled="busy" @click="save">
          <AppIcon name="fa-spinner" class="mr-2" v-if="busy" />{{ editing ? 'Lưu thay đổi' : 'Thêm danh mục' }}
        </button>
      </template>
    </UiModal>

    <UiModal v-model="delOpen" title="Xác nhận xoá danh mục" width="max-w-md">
      <p class="text-sm text-slate-600">Xoá danh mục <strong class="text-slate-800">{{ target?.name }}</strong>? Các tài liệu thuộc danh mục này vẫn được giữ lại.</p>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn btn-danger btn-sm" :disabled="busy" @click="confirmDelete">Xoá</button>
      </template>
    </UiModal>
  </section>
</template>
