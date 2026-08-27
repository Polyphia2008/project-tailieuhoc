<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    icon: string
    tone?: 'blue' | 'green' | 'orange' | 'purple' | 'rose' | 'cyan' | 'amber'
    spark?: number[]
    hint?: string
    delta?: number
    to?: string
    index?: number
  }>(),
  { tone: 'blue', index: 0 }
)

const TONES: Record<string, { bg: string; fg: string; line: string }> = {
  blue: { bg: 'rgba(59,130,246,.14)', fg: '#60a5fa', line: '#3b82f6' },
  green: { bg: 'rgba(16,185,129,.14)', fg: '#34d399', line: '#10b981' },
  orange: { bg: 'rgba(249,115,22,.14)', fg: '#fb923c', line: '#f97316' },
  purple: { bg: 'rgba(139,92,246,.14)', fg: '#a78bfa', line: '#8b5cf6' },
  rose: { bg: 'rgba(244,63,94,.14)', fg: '#fb7185', line: '#f43f5e' },
  cyan: { bg: 'rgba(6,182,212,.14)', fg: '#22d3ee', line: '#06b6d4' },
  amber: { bg: 'rgba(245,158,11,.14)', fg: '#fbbf24', line: '#f59e0b' }
}

const t = computed(() => TONES[props.tone] || TONES.blue)
const uid = 'sp' + Math.random().toString(36).slice(2, 9)

const series = computed(() => {
  const raw = props.spark?.length ? props.spark : []
  if (raw.length >= 2) return raw
  return Array.from({ length: 22 }, (_, i) => 40 + Math.sin(i * 0.72) * 18 + (i % 4) * 5)
})

const path = computed(() => {
  const d = series.value
  const w = 100
  const h = 30
  const max = Math.max(...d, 1)
  const min = Math.min(...d, 0)
  const span = max - min || 1
  const pts = d.map((v, i) => {
    const x = (i / Math.max(1, d.length - 1)) * w
    const y = h - ((v - min) / span) * (h - 4) - 2
    return [x, y] as [number, number]
  })

  let line = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const mx = (px + cx) / 2
    line += ` C ${mx.toFixed(2)} ${py.toFixed(2)} ${mx.toFixed(2)} ${cy.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)}`
  }
  return { line, area: `${line} L ${w} ${h} L 0 ${h} Z` }
})

const Tag = computed(() => (props.to ? resolveComponent('NuxtLink') : 'div'))
</script>

<template>
  <component
    :is="Tag"
    :to="to"
    class="stat-card group block"
    v-motion
    :initial="{ opacity: 0, y: 14 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 60 + index * 70, duration: 420 } }"
  >
    <div class="relative z-10 flex items-start justify-between gap-3">
      <p class="text-[11.5px] font-medium text-mdk-mute leading-snug">{{ label }}</p>
      <span
        class="shrink-0 w-9 h-9 rounded-[10px] grid place-items-center transition-transform group-hover:scale-105"
        :style="{ background: t.bg, color: t.fg }"
      >
        <AppIcon :name="icon" size="19" />
      </span>
    </div>

    <p class="relative z-10 mt-2.5 text-[26px] leading-none font-bold text-mdk-text font-ui tracking-tight tabular-nums">
      {{ value }}
    </p>

    <div class="relative z-10 mt-2 flex items-center gap-2 min-h-[18px]">
      <span
        v-if="delta !== undefined"
        class="inline-flex items-center gap-0.5 text-[11px] font-semibold"
        :class="delta >= 0 ? 'text-emerald-400' : 'text-rose-400'"
      >
        <AppIcon :name="delta >= 0 ? 'solar:arrow-right-up-linear' : 'solar:arrow-right-down-linear'" size="13" />
        {{ Math.abs(delta) }}%
      </span>
      <span v-if="hint" class="text-[11px] text-mdk-mute truncate">{{ hint }}</span>
    </div>

    <svg class="stat-spark" viewBox="0 0 100 30" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="uid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="t.line" stop-opacity=".28" />
          <stop offset="100%" :stop-color="t.line" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="path.area" :fill="`url(#${uid})`" />
      <path :d="path.line" fill="none" :stroke="t.line" stroke-width="1.4" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".92" />
    </svg>
  </component>
</template>
