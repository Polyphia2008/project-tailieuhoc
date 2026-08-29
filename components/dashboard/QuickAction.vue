<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    icon: string
    to: string
    tone?: 'blue' | 'cyan' | 'orange' | 'purple' | 'green' | 'rose' | 'amber' | 'indigo'
    index?: number
  }>(),
  { tone: 'blue', index: 0 }
)

const TONES: Record<string, string> = {
  blue: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  cyan: 'linear-gradient(135deg, #06b6d4, #0369a1)',
  orange: 'linear-gradient(135deg, #fb923c, #ea580c)',
  purple: 'linear-gradient(135deg, #38bdf8, #0369a1)',
  green: 'linear-gradient(135deg, #34d399, #059669)',
  rose: 'linear-gradient(135deg, #fb7185, #e11d48)',
  amber: 'linear-gradient(135deg, #fbbf24, #d97706)',
  indigo: 'linear-gradient(135deg, #818cf8, #4f46e5)'
}

const bg = computed(() => TONES[props.tone] || TONES.blue)
</script>

<template>
  <NuxtLink
    :to="to"
    class="mdk-quick group"
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 80 + index * 55, duration: 380 } }"
  >
    <span class="mdk-quick-ic transition-transform group-hover:scale-110" :style="{ background: bg }">
      <AppIcon :name="icon" size="20" />
    </span>
    <span class="mdk-quick-label">{{ label }}</span>
  </NuxtLink>
</template>
