<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title?: string; desc?: string }>(), { icon: 'fa-inbox', title: 'Chưa có dữ liệu', desc: '' })
</script>
<template>
  <div class="flex flex-col items-center justify-center text-center py-14 px-4">
    <div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <AppIcon :name="icon" class="text-3xl text-slate-400" />
    </div>
    <h3 class="font-semibold text-slate-700 text-lg">{{ title }}</h3>
    <p v-if="desc" class="text-sm text-slate-500 mt-1 max-w-md">{{ desc }}</p>
    <div class="mt-5"><slot /></div>
  </div>
</template>
