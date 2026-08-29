<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    icon: string
    required?: boolean
  }>(),
  { required: false }
)
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="label-dv">
        {{ label }}
        <span v-if="required" class="text-destructive">*</span>
      </label>
      <slot name="aside" />
    </div>
    <div class="relative">
      <AppIcon :name="icon" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <slot />
    </div>
    <slot name="below" />
  </div>
</template>
