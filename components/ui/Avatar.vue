<script setup lang="ts">
const props = withDefaults(defineProps<{ name?: string; src?: string; size?: number }>(), { name: '', size: 40 })
const COLORS = ['#0b4a8f', '#ff8412', '#16a34a', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#b45309']
const initials = computed(() => (props.name || '?').trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase())
const bg = computed(() => {
  const s = (props.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return COLORS[s % COLORS.length]
})
</script>
<template>
  <img v-if="src" :src="src" :alt="name" class="rounded-full object-cover shrink-0" :style="{ width: size + 'px', height: size + 'px' }" />
  <span v-else class="rounded-full flex items-center justify-center text-white font-semibold shrink-0 select-none"
    :style="{ width: size + 'px', height: size + 'px', background: bg, fontSize: size * 0.4 + 'px' }">{{ initials }}</span>
</template>
