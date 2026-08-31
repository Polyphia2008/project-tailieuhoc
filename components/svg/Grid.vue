<script setup lang="ts">
withDefaults(
  defineProps<{
    cell?: number
    opacity?: number
    fade?: boolean
  }>(),
  { cell: 54, opacity: 0.5, fade: true }
)

const uid = useId()
</script>

<template>
  <svg class="grid-svg" :style="{ opacity }" aria-hidden="true">
    <defs>
      <pattern :id="`grid-${uid}`" :width="cell" :height="cell" patternUnits="userSpaceOnUse">
        <path :d="`M ${cell} 0 L 0 0 0 ${cell}`" fill="none" stroke="currentColor" stroke-width="1" />
      </pattern>
      <radialGradient :id="`mask-${uid}`" cx="50%" cy="0%" r="85%">
        <stop offset="0%" stop-color="#fff" stop-opacity="1" />
        <stop offset="60%" stop-color="#fff" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0" />
      </radialGradient>
      <mask :id="`m-${uid}`">
        <rect width="100%" height="100%" :fill="fade ? `url(#mask-${uid})` : '#fff'" />
      </mask>
    </defs>
    <rect width="100%" height="100%" :fill="`url(#grid-${uid})`" :mask="`url(#m-${uid})`" />
  </svg>
</template>

<style scoped>
.grid-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: rgb(var(--foreground) / 0.11);
  pointer-events: none;
}
</style>
