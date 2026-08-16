<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Đăng bán tài liệu - MapDocs' })

const ui = useUiStore()
const { list, grades } = useSubjects()
const { currency } = useFormat()

const form = reactive({
  title: '', description: '', subject: '', grade: 12,
  is_free: false, price: 30000,
  file_type: 'pdf', file_name: '', file_size: 2 * 1024 * 1024, pages: 20
})
const tagInput = ref('')
const tags = ref<string[]>([])
const submitting = ref(false)
const errors = reactive<Record<string, string>>({})

const FILE_TYPES = [
  { v: 'pdf', label: 'PDF', icon: 'fa-file-pdf' },
  { v: 'docx', label: 'Word', icon: 'fa-file-word' },
  { v: 'xlsx', label: 'Excel', icon: 'fa-file-excel' },
  { v: 'image', label: 'Hình ảnh', icon: 'fa-file-image' },
  { v: 'zip', label: 'ZIP', icon: 'fa-file-zipper' }
]

function addTag() {
  const t = tagInput.value.trim()
  if (!t) return
  if (tags.value.length >= 8) return ui.error('Tối đa 8 thẻ')
  if (tags.value.includes(t)) return ui.error('Thẻ này đã tồn tại')
  tags.value.push(t)
  tagInput.value = ''
}
const removeTag = (i: number) => tags.value.splice(i, 1)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (form.title.trim().length < 10) errors.title = 'Tiêu đề phải từ 10 đến 200 ký tự'
  if (form.title.trim().length > 200) errors.title = 'Tiêu đề tối đa 200 ký tự'
  if (form.description.trim().length < 30) errors.description = 'Mô tả phải từ 30 đến 8000 ký tự'
  if (!form.subject) errors.subject = 'Vui lòng chọn môn học'
  if (![10, 11, 12].includes(Number(form.grade))) errors.grade = 'Vui lòng chọn lớp'
  if (!form.is_free && Number(form.price) < 10000) errors.price = 'Giá bán tối thiểu là 10.000đ'
  if (!form.file_name.trim()) errors.file_name = 'Vui lòng nhập tên file tài liệu'
  return Object.keys(errors).length === 0
}

const earning = computed(() => (form.is_free ? 0 : Math.round(Number(form.price) * 0.85)))

async function submit() {
  if (!validate()) return ui.error('Vui lòng kiểm tra lại thông tin đã nhập')
  submitting.value = true
  try {
    const res: any = await $fetch('/api/documents', {
      method: 'POST',
      body: { ...form, price: form.is_free ? 0 : Number(form.price), tags: tags.value }
    })
    ui.success(res.message || 'Đã gửi tài liệu để duyệt')
    await navigateTo('/dashboard/tai-lieu')
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể đăng tài liệu')
  } finally { submitting.value = false }
}
</script>

<template>
  <section id="upload-page">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><AppIcon name="fa-cloud-arrow-up" class="text-accent-500 mr-2" />Đăng bán tài liệu</h1>
      <p class="text-slate-500 text-sm mt-1">Chia sẻ tài liệu chất lượng của bạn và nhận <strong class="text-primary-900">85% doanh thu</strong> mỗi lượt bán.</p>
    </header>

    <form class="grid gap-6 lg:grid-cols-3" @submit.prevent="submit">
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-5 space-y-4">
          <h2 class="font-bold text-slate-800"><AppIcon name="fa-circle-info" class="text-primary-900 mr-2" />Thông tin cơ bản</h2>

          <div>
            <label class="label" for="doc-title">Tiêu đề tài liệu <span class="text-red-500">*</span></label>
            <input id="doc-title" v-model="form.title" type="text" maxlength="200" class="input"
              placeholder="VD: Chuyên đề hàm số bậc hai - Toán 10 có lời giải chi tiết" />
            <div class="flex justify-between mt-1">
              <span class="text-xs text-red-600">{{ errors.title }}</span>
              <span class="text-xs text-slate-400">{{ form.title.length }}/200</span>
            </div>
          </div>

          <div>
            <label class="label" for="doc-desc">Mô tả chi tiết <span class="text-red-500">*</span></label>
            <textarea id="doc-desc" v-model="form.description" rows="7" maxlength="8000" class="input"
              placeholder="Mô tả nội dung tài liệu: cấu trúc, số trang, dạng bài, đối tượng phù hợp..." />
            <div class="flex justify-between mt-1">
              <span class="text-xs text-red-600">{{ errors.description }}</span>
              <span class="text-xs text-slate-400">{{ form.description.length }}/8000</span>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label" for="doc-subject">Môn học <span class="text-red-500">*</span></label>
              <select id="doc-subject" v-model="form.subject" class="input">
                <option value="">-- Chọn môn học --</option>
                <option v-for="s in list" :key="s.key" :value="s.key">{{ s.label }}</option>
              </select>
              <span class="text-xs text-red-600">{{ errors.subject }}</span>
            </div>
            <div>
              <label class="label" for="doc-grade">Lớp <span class="text-red-500">*</span></label>
              <select id="doc-grade" v-model.number="form.grade" class="input">
                <option v-for="g in grades" :key="g" :value="g">Lớp {{ g }}</option>
              </select>
              <span class="text-xs text-red-600">{{ errors.grade }}</span>
            </div>
          </div>

          <div>
            <label class="label">Thẻ từ khoá <span class="text-slate-400 font-normal">(tối đa 8)</span></label>
            <div class="flex gap-2">
              <input v-model="tagInput" type="text" class="input" placeholder="Nhập thẻ rồi nhấn Enter" @keydown.enter.prevent="addTag" />
              <button type="button" class="btn btn-outline btn-sm shrink-0" @click="addTag"><AppIcon name="fa-plus" /></button>
            </div>
            <div v-if="tags.length" class="flex flex-wrap gap-2 mt-3">
              <span v-for="(t, i) in tags" :key="t" class="inline-flex items-center gap-1.5 bg-primary-50 text-primary-900 text-xs font-medium px-2.5 py-1 rounded-full">
                #{{ t }}
                <button type="button" class="hover:text-red-600" @click="removeTag(i)"><AppIcon name="fa-xmark" /></button>
              </span>
            </div>
          </div>
        </div>

        <div class="card p-5 space-y-4">
          <h2 class="font-bold text-slate-800"><AppIcon name="fa-file-arrow-up" class="text-primary-900 mr-2" />Tệp tài liệu</h2>

          <div>
            <label class="label">Định dạng tệp</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="f in FILE_TYPES" :key="f.v" type="button" class="ftype" :class="form.file_type === f.v ? 'ftype-on' : ''" @click="form.file_type = f.v">
                <AppIcon :name="f.icon" />{{ f.label }}
              </button>
            </div>
          </div>

          <div>
            <label class="label" for="doc-file">Tên tệp <span class="text-red-500">*</span></label>
            <input id="doc-file" v-model="form.file_name" type="text" class="input" placeholder="vd: chuyen-de-ham-so-bac-hai.pdf" />
            <span class="text-xs text-red-600">{{ errors.file_name }}</span>
            <p class="text-xs text-slate-500 mt-1">
              <AppIcon name="fa-circle-info" class="mr-1" />Phiên bản demo chưa hỗ trợ upload tệp thật — bạn chỉ cần khai báo tên tệp.
            </p>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label" for="doc-pages">Số trang</label>
              <input id="doc-pages" v-model.number="form.pages" type="number" min="1" class="input" />
            </div>
            <div>
              <label class="label" for="doc-size">Dung lượng (MB)</label>
              <input id="doc-size" type="number" min="0.1" step="0.1" class="input"
                :value="(form.file_size / 1048576).toFixed(1)"
                @input="form.file_size = Math.round(Number(($event.target as HTMLInputElement).value) * 1048576)" />
            </div>
          </div>
        </div>
      </div>

      <aside class="space-y-6">
        <div class="card p-5 space-y-4 lg:sticky lg:top-20">
          <h2 class="font-bold text-slate-800"><AppIcon name="fa-tag" class="text-accent-500 mr-2" />Giá bán</h2>

          <div class="space-y-2">
            <label class="ropt" :class="form.is_free ? 'ropt-on' : ''">
              <input v-model="form.is_free" type="radio" :value="true" class="mt-1" />
              <span><span class="block font-semibold text-slate-800">Miễn phí</span>
              <span class="text-xs text-slate-500">Chia sẻ cộng đồng, tăng uy tín người bán</span></span>
            </label>
            <label class="ropt" :class="!form.is_free ? 'ropt-on' : ''">
              <input v-model="form.is_free" type="radio" :value="false" class="mt-1" />
              <span><span class="block font-semibold text-slate-800">Có phí</span>
              <span class="text-xs text-slate-500">Nhận 85% doanh thu mỗi lượt bán</span></span>
            </label>
          </div>

          <div v-if="!form.is_free">
            <label class="label" for="doc-price">Giá bán (đ) <span class="text-red-500">*</span></label>
            <input id="doc-price" v-model.number="form.price" type="number" min="10000" step="1000" class="input" />
            <span class="text-xs text-red-600">{{ errors.price }}</span>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button v-for="p in [10000, 20000, 30000, 50000, 100000]" :key="p" type="button"
                class="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:border-accent-500 hover:text-accent-500 transition"
                @click="form.price = p">{{ currency(p) }}</button>
            </div>
            <div class="mt-4 rounded-xl bg-slate-50 p-3 text-sm space-y-1">
              <div class="flex justify-between"><span class="text-slate-500">Giá bán</span><span class="font-medium">{{ currency(form.price) }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Phí nền tảng (15%)</span><span class="text-red-600">-{{ currency(Math.round(form.price * 0.15)) }}</span></div>
              <div class="flex justify-between pt-1 border-t border-slate-200"><span class="font-semibold text-slate-700">Bạn nhận được</span><span class="font-bold text-green-600">{{ currency(earning) }}</span></div>
            </div>
          </div>

          <button type="submit" class="btn btn-accent w-full" :disabled="submitting">
            <AppIcon :name="submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'" class="mr-2" />
            Gửi duyệt tài liệu
          </button>
          <p class="text-xs text-slate-500 text-center">Tài liệu sẽ được quản trị viên kiểm duyệt trong vòng 24 giờ.</p>
        </div>

        <div class="card p-5">
          <h3 class="font-bold text-slate-800 mb-3"><AppIcon name="fa-lightbulb" class="text-amber-500 mr-2" />Mẹo đăng bán hiệu quả</h3>
          <ul class="text-sm text-slate-600 space-y-2">
            <li><AppIcon name="fa-check" variant="bold" class="text-green-600 mr-2" />Tiêu đề rõ ràng, có tên chuyên đề &amp; lớp</li>
            <li><AppIcon name="fa-check" variant="bold" class="text-green-600 mr-2" />Mô tả chi tiết cấu trúc và số lượng bài tập</li>
            <li><AppIcon name="fa-check" variant="bold" class="text-green-600 mr-2" />Thêm thẻ từ khoá để dễ tìm kiếm</li>
            <li><AppIcon name="fa-check" variant="bold" class="text-green-600 mr-2" />Giá hợp lý 10.000đ - 100.000đ dễ bán hơn</li>
          </ul>
        </div>
      </aside>
    </form>
  </section>
</template>

<style scoped>
.ftype { @apply inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary-900 hover:text-primary-900 transition; }
.ftype-on { @apply bg-primary-900 border-primary-900 text-white hover:text-white; }
.ropt { @apply flex gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary-900 transition; }
.ropt-on { @apply border-primary-900 bg-primary-50/60; }
</style>
