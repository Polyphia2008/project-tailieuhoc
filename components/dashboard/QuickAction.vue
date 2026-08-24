<script setup lang="ts">
/** QuickAction — the "Truy cap nhanh" (icon gradient tron + label) */
withDefaults(
  defineProps<{
    to: string
    icon: string
    label: string
    tone?: 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan'
  }>(),
  { tone: 'blue' }
)

const TONES: Record<string, string> = {
  blue: 'from-blue-500 to-blue-700',
  green: 'from-emerald-500 to-emerald-700',
  amber: 'from-amber-500 to-orange-600',
  violet: 'from-violet-500 to-purple-700',
  rose: 'from-rose-500 to-rose-700',
  cyan: 'from-cyan-500 to-sky-700'
}
</script>

<template>
  <NuxtLink :to="to" class="mdk-quick">
    <span class="mdk-quick__icon bg-gradient-to-br" :class="TONES[tone]">
      <AppIcon :name="icon" />
    </span>
    <span class="mdk-quick__label">{{ label }}</span>
  </NuxtLink>
</template>
