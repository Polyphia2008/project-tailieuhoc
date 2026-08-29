<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'radix-vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    width?: string
  }>(),
  { width: 'max-w-lg' }
)

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <DialogRoot :open="props.modelValue" @update:open="emit('update:modelValue', $event)">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="dialog-content" :class="props.width">
        <DialogTitle class="dialog-title">{{ props.title }}</DialogTitle>
        <DialogDescription v-if="props.description" class="dialog-desc">{{ props.description }}</DialogDescription>
        <DialogClose class="dialog-close">
          <AppIcon name="solar:close-circle-linear" size="19" />
        </DialogClose>
        <div class="dialog-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="dialog-footer">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
