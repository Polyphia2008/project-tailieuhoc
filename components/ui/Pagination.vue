<script setup lang="ts">
const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ change: [number] }>()
const pages = computed<(number | string)[]>(() => {
  const t = props.totalPages, p = props.page
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const out: (number | string)[] = [1]
  if (p > 3) out.push('...')
  for (let i = Math.max(2, p - 1); i <= Math.min(t - 1, p + 1); i++) out.push(i)
  if (p < t - 2) out.push('...')
  out.push(t)
  return out
})
const go = (n: number) => n >= 1 && n <= props.totalPages && n !== props.page && emit('change', n)
</script>
<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1 flex-wrap mt-8">
    <button class="pg" :disabled="page <= 1" @click="go(page - 1)"><AppIcon name="fa-chevron-left" /></button>
    <template v-for="(p, i) in pages" :key="i">
      <span v-if="p === '...'" class="px-2 text-slate-400">…</span>
      <button v-else class="pg" :class="p === page ? 'bg-primary-900 text-white border-primary-900' : ''" @click="go(p as number)">{{ p }}</button>
    </template>
    <button class="pg" :disabled="page >= totalPages" @click="go(page + 1)"><AppIcon name="fa-chevron-right" /></button>
  </nav>
</template>
<style scoped>
.pg { @apply min-w-9 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-primary-900 hover:text-primary-900 transition disabled:opacity-40 disabled:cursor-not-allowed; }
</style>
