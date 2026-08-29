<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { num } = useFormat()

const { data, pending, refresh } = await useFetch<any>('/api/admin/categories')
const cats = computed<any[]>(() => data.value?.categories || [])

const ICONS = [
  'solar:calculator-bold-duotone',
  'solar:atom-bold-duotone',
  'solar:test-tube-bold-duotone',
  'solar:leaf-bold-duotone',
  'solar:book-2-bold-duotone',
  'solar:global-bold-duotone',
  'solar:notebook-bold-duotone',
  'solar:map-point-wave-bold-duotone',
  'solar:graph-up-bold-duotone',
  'solar:palette-bold-duotone',
  'solar:music-note-bold-duotone',
  'solar:cpu-bolt-bold-duotone'
]

const PRESETS = ['#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#22c55e', '#f59e0b', '#f97316', '#f43f5e']

const open = ref(false)
const editing = ref<any>(null)
const busy = ref(false)

const f = reactive({
  name: '',
  slug: '',
  icon: ICONS[0],
  color: PRESETS[0],
  description: ''
})

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function openCreate() {
  editing.value = null
  f.name = ''
  f.slug = ''
  f.icon = ICONS[0]
  f.color = PRESETS[0]
  f.description = ''
  open.value = true
}

function openEdit(c: any) {
  editing.value = c
  f.name = c.name
  f.slug = c.slug
  f.icon = c.icon
  f.color = c.color
  f.description = c.description || ''
  open.value = true
}

watch(
  () => f.name,
  (v) => {
    if (!editing.value) f.slug = slugify(v)
  }
)

async function submit() {
  if (!f.name.trim()) {
    toast.error('Vui lòng nhập tên danh mục')
    return
  }
  busy.value = true
  try {
    const body: Record<string, any> = editing.value
      ? { action: 'update', id: editing.value.id, name: f.name, icon: f.icon, color: f.color, description: f.description }
      : { action: 'create', name: f.name, slug: f.slug, icon: f.icon, color: f.color, description: f.description }
    await $fetch('/api/admin/categories', { method: 'POST', body })
    await refresh()
    open.value = false
    toast.success(editing.value ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không lưu được danh mục')
  } finally {
    busy.value = false
  }
}

const delOpen = ref(false)
const delTarget = ref<any>(null)

function openDelete(c: any) {
  delTarget.value = c
  delOpen.value = true
}

async function submitDelete() {
  busy.value = true
  try {
    await $fetch('/api/admin/categories', { method: 'POST', body: { action: 'delete', id: delTarget.value.id } })
    await refresh()
    delOpen.value = false
    toast.success('Đã xoá danh mục')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không xoá được danh mục')
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Danh mục - MapDocs Admin' })
</script>

<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Danh mục</span>
    </nav>
    <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-bold text-mdk-text font-ui tracking-tight">Danh mục môn học</h1>
        <p class="mt-1 text-[13px] text-mdk-mute">{{ cats.length }} danh mục đang hoạt động</p>
      </div>
      <button class="btn-primary btn-sm" @click="openCreate">
        <AppIcon name="solar:add-circle-bold" size="16" /> Thêm danh mục
      </button>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="(c, i) in cats"
        :key="c.id"
        class="card-dv p-5"
        v-motion
        :initial="{ opacity: 0, y: 14 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: i * 50 } }"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="w-11 h-11 rounded-xl grid place-items-center text-white shrink-0" :style="{ background: `linear-gradient(140deg, ${c.color}, ${c.color}bb)` }">
            <AppIcon :name="c.icon" size="22" />
          </span>
          <div class="flex items-center gap-1">
            <button class="w-7 h-7 grid place-items-center rounded-md text-primary-400 hover:bg-primary-500/15" title="Sửa" @click="openEdit(c)">
              <AppIcon name="solar:pen-2-bold" size="15" />
            </button>
            <button class="w-7 h-7 grid place-items-center rounded-md text-red-400 hover:bg-red-500/15" title="Xoá" @click="openDelete(c)">
              <AppIcon name="solar:trash-bin-trash-bold" size="15" />
            </button>
          </div>
        </div>
        <div class="mt-3.5 flex items-center gap-2">
          <p class="text-[15.5px] font-bold text-mdk-text font-ui">{{ c.name }}</p>
          <code class="text-[11px] font-mono text-mdk-mute">{{ c.slug }}</code>
        </div>
        <p class="mt-1.5 text-[12.5px] text-mdk-mute leading-relaxed line-clamp-2 min-h-[36px]">{{ c.description || 'Chưa có mô tả' }}</p>
        <dl class="mt-4 pt-4 border-t border-mdk-line grid grid-cols-3 gap-2 text-center">
          <div>
            <dt class="text-[10.5px] text-mdk-mute uppercase tracking-wide">Tổng</dt>
            <dd class="text-[16px] font-bold text-mdk-text tabular-nums">{{ num(c.document_count) }}</dd>
          </div>
          <div>
            <dt class="text-[10.5px] text-mdk-mute uppercase tracking-wide">Đã duyệt</dt>
            <dd class="text-[16px] font-bold text-emerald-400 tabular-nums">{{ num(c.approved_count) }}</dd>
          </div>
          <div>
            <dt class="text-[10.5px] text-mdk-mute uppercase tracking-wide">Miễn phí</dt>
            <dd class="text-[16px] font-bold text-primary-400 tabular-nums">{{ num(c.free_count) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <UiEmpty v-if="!pending && !cats.length" icon="solar:folder-open-bold-duotone" title="Chưa có danh mục nào" description="Thêm danh mục môn học đầu tiên để phân loại tài liệu.">
      <button class="btn-primary btn-sm" @click="openCreate">Thêm danh mục</button>
    </UiEmpty>

    <UiDialog v-model="open" :title="editing ? 'Sửa danh mục' : 'Thêm danh mục'" description="Danh mục dùng để phân loại tài liệu theo môn học." width="max-w-xl">
      <div class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Tên danh mục</label>
            <input v-model="f.name" class="input" placeholder="Ví dụ: Tin học" />
          </div>
          <div>
            <label class="label">Slug</label>
            <input v-model="f.slug" class="input font-mono text-[13px]" :disabled="Boolean(editing)" placeholder="tin-hoc" />
          </div>
        </div>

        <div>
          <label class="label">Biểu tượng</label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="ic in ICONS"
              :key="ic"
              class="h-11 rounded-xl border grid place-items-center transition"
              :class="f.icon === ic ? 'border-primary-500 bg-primary-500/15 text-primary-300' : 'border-mdk-line text-mdk-sub hover:border-mdk-line2'"
              @click="f.icon = ic"
            >
              <AppIcon :name="ic" size="20" />
            </button>
          </div>
        </div>

        <div>
          <label class="label">Màu sắc</label>
          <div class="flex items-center gap-2.5">
            <input v-model="f.color" type="color" class="w-12 h-10 rounded-lg border border-mdk-line bg-transparent cursor-pointer p-1" />
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="p in PRESETS"
                :key="p"
                class="w-7 h-7 rounded-lg border-2 transition"
                :class="f.color === p ? 'border-white scale-110' : 'border-transparent'"
                :style="{ background: p }"
                @click="f.color = p"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="label">Mô tả</label>
          <textarea v-model="f.description" rows="2" class="textarea" placeholder="Nội dung chính của danh mục..." />
        </div>

        <div class="flex items-center gap-3 rounded-xl border border-mdk-line bg-mdk-soft p-3">
          <span class="w-11 h-11 rounded-xl grid place-items-center text-white shrink-0" :style="{ background: `linear-gradient(140deg, ${f.color}, ${f.color}bb)` }">
            <AppIcon :name="f.icon" size="22" />
          </span>
          <div class="min-w-0">
            <p class="text-[14px] font-bold text-mdk-text">{{ f.name || 'Tên danh mục' }}</p>
            <code class="text-[11.5px] font-mono text-mdk-mute">{{ f.slug || 'slug' }}</code>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="open = false">Huỷ</button>
        <button class="btn-primary btn-sm" :disabled="busy" @click="submit">
          <UiSpinner v-if="busy" :size="14" /> {{ editing ? 'Lưu thay đổi' : 'Thêm danh mục' }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="delOpen" title="Xoá danh mục" :description="delTarget ? `Bạn sắp xoá danh mục ${delTarget.name}` : ''" width="max-w-md">
      <p class="text-[13px] text-mdk-sub leading-relaxed">
        Không thể xoá danh mục đang chứa tài liệu. Hiện có <strong class="text-mdk-text">{{ num(delTarget?.document_count || 0) }}</strong> tài liệu thuộc danh mục này.
      </p>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn-danger btn-sm" :disabled="busy" @click="submitDelete">
          <UiSpinner v-if="busy" :size="14" /> Xoá danh mục
        </button>
      </template>
    </UiDialog>
  </div>
</template>
