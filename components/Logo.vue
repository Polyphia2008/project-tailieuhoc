<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'full' | 'mark'
    light?: boolean
    size?: number
  }>(),
  { variant: 'full', light: false, size: 40 }
)

const markSize = computed(() => props.size)
const titleClass = computed(() => (props.light ? 'text-white' : 'text-foreground'))
const subClass = computed(() => (props.light ? 'text-zinc-400' : 'text-muted-foreground'))
</script>

<template>
  <span class="inline-flex items-center gap-2.5 select-none">
    <span
      class="shrink-0 grid place-items-center rounded-xl text-white shadow-lg shadow-cmstdev/25"
      :style="{ width: markSize + 'px', height: markSize + 'px', background: 'linear-gradient(135deg, #38bdf8, #0369a1)' }"
    >
      <AppIcon name="solar:book-bookmark-bold" :size="Math.round(markSize * 0.52)" />
    </span>
    <span v-if="props.variant === 'full'" class="leading-tight">
      <span class="block text-[19px] font-extrabold tracking-tight font-ui" :class="titleClass">MapDocs</span>
      <span class="block text-[10.5px] font-medium tracking-wide" :class="subClass">KHO TÀI LIỆU HỌC TẬP</span>
    </span>
  </span>
</template>
