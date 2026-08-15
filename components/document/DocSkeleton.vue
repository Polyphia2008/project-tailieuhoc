<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 8 })
</script>
<template>
  <div v-for="i in count" :key="i" class="bg-white rounded-xl overflow-hidden shadow-card border border-slate-100">
    <div class="h-32 bg-slate-200 animate-pulse" />
    <div class="p-3.5 space-y-2">
      <div class="h-3 w-16 bg-slate-200 rounded animate-pulse" />
      <div class="h-4 w-full bg-slate-200 rounded animate-pulse" />
      <div class="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
      <div class="h-3 w-full bg-slate-100 rounded animate-pulse" />
      <div class="flex justify-between pt-3 border-t border-slate-100">
        <div class="h-4 w-20 bg-slate-200 rounded animate-pulse" />
        <div class="h-4 w-14 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  </div>
</template>
