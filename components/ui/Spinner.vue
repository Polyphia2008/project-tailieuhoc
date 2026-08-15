<script setup lang="ts">
withDefaults(defineProps<{ size?: number; label?: string }>(), { size: 28, label: '' })
</script>
<template>
  <div class="flex flex-col items-center justify-center gap-2 py-6">
    <span class="inline-block rounded-full border-[3px] border-slate-200 border-t-primary-900 animate-spin"
      :style="{ width: size + 'px', height: size + 'px' }" />
    <span v-if="label" class="text-sm text-slate-500">{{ label }}</span>
  </div>
</template>
