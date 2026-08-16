<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 8 })
</script>

<template>
  <div v-for="i in count" :key="i" class="sk-card">
    <div class="sk-head skeleton" />
    <div class="p-3.5 space-y-2">
      <div class="h-3 w-16 rounded skeleton" />
      <div class="h-3.5 w-full rounded skeleton" />
      <div class="h-3.5 w-3/4 rounded skeleton" />
      <div class="h-3 w-full rounded skeleton" style="opacity: 0.7" />
      <div class="flex items-center gap-1.5 pt-1">
        <div class="h-4 w-4 rounded-full skeleton" />
        <div class="h-3 w-24 rounded skeleton" style="opacity: 0.7" />
      </div>
      <div class="flex justify-between pt-3 border-t border-line">
        <div class="h-4 w-20 rounded skeleton" />
        <div class="h-3 w-14 rounded skeleton" style="opacity: 0.7" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sk-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.sk-head { height: 8rem; }
</style>
