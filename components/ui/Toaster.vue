<script setup lang="ts">
/**
 * UiToaster — bridge tu useUiStore() sang Sonner (vue-sonner).
 * Giu nguyen API cu: ui.toast() / ui.success() / ui.error()
 * nhung hien thi bang Sonner (animation muot, stack, swipe de dismiss).
 * Luu y: vue-sonner@1.x da nhung san CSS trong bundle JS, khong import style rieng.
 */
import { Toaster, toast } from 'vue-sonner'

const ui = useUiStore()
const shown = new Set<number>()

watch(
  () => ui.toasts.map((t) => t.id).join(','),
  () => {
    for (const t of ui.toasts) {
      if (shown.has(t.id)) continue
      shown.add(t.id)

      const opts = { duration: 4000 }
      if (t.type === 'success') toast.success(t.message, opts)
      else if (t.type === 'error') toast.error(t.message, opts)
      else if (t.type === 'warning') toast.warning(t.message, opts)
      else toast.info(t.message, opts)

      // store tu xoa sau 4s, don set de tranh phinh bo nho
      setTimeout(() => shown.delete(t.id), 6000)
    }
  }
)
</script>

<template>
  <Toaster
    position="bottom-right"
    :visible-toasts="4"
    :offset="20"
    close-button
    rich-colors
  />
</template>

<style>
/* ===== Sonner theme MapDocs ===== */
[data-sonner-toaster] {
  --width: 380px;
  font-family: 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif;
}

[data-sonner-toast] {
  border-radius: 12px !important;
  box-shadow: 0 8px 25px rgba(11, 74, 143, .12), 0 2px 6px rgba(16, 24, 40, .06) !important;
  border: 1px solid #e2e8f0 !important;
  padding: 14px 16px !important;
  gap: 10px !important;
}

[data-sonner-toast] [data-title] {
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 1.45 !important;
}

[data-sonner-toast] [data-icon] { width: 20px; height: 20px; }

/* Success — xanh la */
[data-sonner-toast][data-type='success'] {
  background: #f0fdf4 !important;
  border-color: #bbf7d0 !important;
}
[data-sonner-toast][data-type='success'] [data-title] { color: #14532d !important; }
[data-sonner-toast][data-type='success'] [data-icon] { color: #16a34a !important; }

/* Error — do */
[data-sonner-toast][data-type='error'] {
  background: #fef2f2 !important;
  border-color: #fecaca !important;
}
[data-sonner-toast][data-type='error'] [data-title] { color: #7f1d1d !important; }
[data-sonner-toast][data-type='error'] [data-icon] { color: #dc2626 !important; }

/* Warning — vang */
[data-sonner-toast][data-type='warning'] {
  background: #fffbeb !important;
  border-color: #fde68a !important;
}
[data-sonner-toast][data-type='warning'] [data-title] { color: #78350f !important; }
[data-sonner-toast][data-type='warning'] [data-icon] { color: #f59e0b !important; }

/* Info — xanh duong MapDocs */
[data-sonner-toast][data-type='info'] {
  background: #eef6ff !important;
  border-color: #bcdaff !important;
}
[data-sonner-toast][data-type='info'] [data-title] { color: #0a2d5c !important; }
[data-sonner-toast][data-type='info'] [data-icon] { color: #0b4a8f !important; }

/* Nut dong */
[data-sonner-toast] [data-close-button] {
  background: #fff !important;
  border-color: #e2e8f0 !important;
  color: #475569 !important;
  transition: all .15s;
}
[data-sonner-toast] [data-close-button]:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}
</style>
