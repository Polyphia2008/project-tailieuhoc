<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'radix-vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    width?: string
    dark?: boolean
  }>(),
  { width: 'max-w-lg', dark: true }
)

const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm animate-fade-in" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl animate-dialog-in max-h-[88vh] overflow-y-auto"
        :class="[
          width,
          dark ? 'bg-mdk-panel border-mdk-line text-mdk-text' : 'bg-white border-slate-200 text-slate-900 dark:text-zinc-100'
        ]"
      >
        <div class="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div class="min-w-0">
            <DialogTitle v-if="title" class="text-base font-semibold font-ui" :class="dark ? 'text-mdk-text' : 'text-slate-900'">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-[13px] leading-relaxed" :class="dark ? 'text-mdk-sub' : 'text-slate-500'">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose
            class="shrink-0 w-8 h-8 grid place-items-center rounded-lg transition"
            :class="dark ? 'text-mdk-mute hover:text-mdk-text hover:bg-mdk-line' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'"
          >
            <AppIcon name="solar:close-circle-linear" size="19" />
          </DialogClose>
        </div>
        <div class="px-5 pb-5">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-5 py-4 border-t" :class="dark ? 'border-mdk-line bg-mdk-soft/40' : 'border-slate-200 bg-slate-50/60'">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
