<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    from?: string
    to?: string
    blur?: number
    opacity?: number
    delay?: number
  }>(),
  { size: 460, from: '#38bdf8', to: '#0369a1', blur: 110, opacity: 0.3, delay: 0 }
)
</script>

<template>
  <span
    class="blob animate-glow-pulse"
    :style="{
      width: size + 'px',
      height: size + 'px',
      background: `radial-gradient(circle at 35% 35%, ${from}, ${to} 70%, transparent 78%)`,
      filter: `blur(${blur}px)`,
      opacity,
      animationDelay: delay + 's'
    }"
    aria-hidden="true"
  />
</template>

<style scoped>
.blob {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  will-change: opacity;
}
</style>
