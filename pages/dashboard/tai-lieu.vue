<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { subjects, grades } = useSubjects()
const f = reactive({ title: '', description: '', subject: 'toan', grade: 12, is_free: false, price: 99000, pages: 100, file_type: 'pdf', tags: '' })
const busy = ref(false)
async function submit() {
  busy.value = true
  try {
    await $fetch('/api/documents', { method: 'POST', body: { ...f, tags: f.tags.split(',').map(s => s.trim()).filter(Boolean) } })
    toast.success('Đã gửi tài liệu, đang chờ kiểm duyệt!')
    f.title = ''; f.description = ''
  } catch (e: any) { toast.error(e?.data?.statusMessage || 'Lỗi') } finally { busy.value = false }
}
useHead({ title: 'Đăng bán tài liệu - MapDocs' })
</script>
<template>
  <div class="max-w-[780px]">
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/dashboard" class="hover:text-mdk-sub">Dashboard</NuxtLink> / <span class="text-mdk-sub">Đăng bán tài liệu</span></nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Đăng bán tài liệu</h1>
    <p class="mt-1 text-[13px] text-mdk-mute">Bạn nhận 85% giá bán mỗi lượt mua. Tài liệu được duyệt trong 24 giờ.</p>
    <form class="mt-6 card p-5 space-y-4" @submit.prevent="submit">
      <div><label class="label">Tiêu đề tài liệu</label><input v-model="f.title" required class="input" placeholder="VD: Bộ 50 đề thi thử THPT môn Toán 2025 có lời giải" /></div>
      <div><label class="label">Mô tả chi tiết</label><textarea v-model="f.description" rows="5" required class="textarea" placeholder="Mô tả nội dung, cấu trúc và đối tượng phù hợp..." /></div>
      <div class="grid sm:grid-cols-3 gap-4">
        <div><label class="label">Môn học</label><select v-model="f.subject" class="input"><option v-for="s in subjects" :key="s.key" :value="s.key">{{ s.name }}</option></select></div>
        <div><label class="label">Lớp</label><select v-model.number="f.grade" class="input"><option v-for="g in grades" :key="g" :value="g">Lớp {{ g }}</option></select></div>
        <div><label class="label">Số trang</label><input v-model.number="f.pages" type="number" min="1" class="input" /></div>
      </div>
      <label class="flex items-center gap-2.5 cursor-pointer"><input v-model="f.is_free" type="checkbox" class="rounded border-mdk-line2 bg-mdk-soft text-primary-600" /><span class="text-[13px] text-mdk-sub">Chia sẻ miễn phí</span></label>
      <div v-if="!f.is_free" class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Giá bán (đ)</label><input v-model.number="f.price" type="number" min="10000" step="1000" class="input" /></div>
        <div class="flex items-end"><p class="text-[12.5px] text-emerald-400">Bạn nhận: <b>{{ Math.round(f.price * 0.85).toLocaleString('vi-VN') }}đ</b> / lượt</p></div>
      </div>
      <div><label class="label">Thẻ (phân cách bằng dấu phẩy)</label><input v-model="f.tags" class="input" placeholder="đề thi thử, lời giải, THPT QG" /></div>
      <div class="rounded-xl border border-dashed border-mdk-line2 bg-mdk-soft p-6 text-center">
        <AppIcon name="solar:cloud-upload-bold-duotone" size="34" class="text-mdk-mute" />
        <p class="mt-2 text-[13px] text-mdk-sub">Kéo thả file PDF/DOCX vào đây (tối đa 50MB)</p>
        <p class="mt-1 text-[11.5px] text-mdk-mute">Demo: file sẽ được lưu vào Cloudflare R2 khi cấu hình đủ env</p>
      </div>
      <button type="submit" class="btn-primary btn-lg w-full" :disabled="busy"><UiSpinner v-if="busy" :size="17" /> Gửi kiểm duyệt</button>
    </form>
  </div>
</template>
