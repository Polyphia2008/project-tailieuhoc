<script setup lang="ts">
withDefaults(defineProps<{ value?: number; count?: number; size?: string; showCount?: boolean }>(), { value: 0, count: 0, size: 'text-xs', showCount: true })
</script>
<template>
  <div class="flex items-center gap-1" :class="size">
    <span class="flex items-center gap-px leading-none">
      <AppIcon
        v-for="i in 5"
        :key="i"
        name="fa-star"
        :variant="i <= Math.round(value) ? 'bold' : 'linear'"
        :class="i <= Math.round(value) ? 'text-warn' : 'text-slate-300'"
      />
    </span>
    <span class="font-semibold text-slate-700">{{ (value || 0).toFixed(1) }}</span>
    <span v-if="showCount" class="text-slate-400">({{ count || 0 }})</span>
  </div>
</template>
