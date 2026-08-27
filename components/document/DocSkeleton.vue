<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 8 })
</script>

<template>
  <div v-for="i in count" :key="i" class="card overflow-hidden">
    <div class="skel h-[132px] rounded-none" />
    <div class="p-3.5 space-y-2.5">
      <div class="skel h-3.5 w-4/5 rounded" />
      <div class="skel h-3.5 w-3/5 rounded" />
      <div class="flex items-center gap-2 pt-1.5">
        <div class="skel h-7 w-7 rounded-full" />
        <div class="skel h-3 w-24 rounded" />
      </div>
      <div class="flex items-center justify-between pt-2">
        <div class="skel h-4 w-20 rounded" />
        <div class="skel h-7 w-16 rounded-md" />
      </div>
    </div>
  </div>
</template>
