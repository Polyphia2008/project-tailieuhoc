<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose
} from 'radix-vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    width?: string
    /** false = khong cho dong bang ESC / click overlay */
    dismissible?: boolean
  }>(),
  { title: '', width: 'max-w-lg', dismissible: true }
)

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const guard = (e: Event) => {
  if (!props.dismissible) e.preventDefault()
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="ms-overlay" />
      <DialogContent
        class="ms-dialog"
        :class="width"
        @escape-key-down="guard"
        @pointer-down-outside="guard"
      >
        <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <DialogTitle class="font-bold text-ink text-base leading-6">
            <slot name="title">{{ title }}</slot>
          </DialogTitle>
          <DialogClose
            class="w-8 h-8 shrink-0 rounded-lg grid place-items-center text-slate-500 hover:bg-slate-100 hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-900/30"
            aria-label="Đóng"
          >
            <AppIcon name="fa-xmark" />
          </DialogClose>
        </div>

        <div class="px-5 py-4 overflow-y-auto">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="px-5 py-4 border-t border-line flex flex-wrap justify-end gap-2 bg-surface rounded-b-2xl"
        >
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
/* Overlay: mo + blur nhe */
.ms-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.ms-overlay[data-state='open'] {
  animation: ms-fade-in 0.18s ease-out;
}
.ms-overlay[data-state='closed'] {
  animation: ms-fade-out 0.15s ease-in;
}

/* Content: scale + fade */
.ms-dialog {
  position: fixed;
  z-index: 95;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 2rem);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
  outline: none;
}
.ms-dialog[data-state='open'] {
  animation: ms-dialog-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.ms-dialog[data-state='closed'] {
  animation: ms-dialog-out 0.15s ease-in;
}

@keyframes ms-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ms-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes ms-dialog-in {
  from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes ms-dialog-out {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
}

@media (prefers-reduced-motion: reduce) {
  .ms-overlay[data-state],
  .ms-dialog[data-state] {
    animation: none !important;
  }
}
</style>
