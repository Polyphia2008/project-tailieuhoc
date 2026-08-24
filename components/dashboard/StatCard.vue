<script setup lang="ts">
/**
 * StatCard — the thong ke kieu thegioidev.com:
 * nen toi, icon goc phai, sparkline gradient o day the.
 */
const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    sub?: string
    icon?: string
    /** Tone mau: quyet dinh mau sparkline + icon */
    tone?: 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan'
    /** Chuoi so de ve sparkline. Neu bo trong se sinh duong on dinh theo label */
    series?: number[]
  }>(),
  { icon: 'fa-chart-simple', tone: 'blue', sub: '' }
)

const TONES = {
  blue: { line: '#3b82f6', from: 'rgba(59,130,246,.35)', icon: 'from-blue-500 to-blue-700' },
  green: { line: '#22c55e', from: 'rgba(34,197,94,.35)', icon: 'from-emerald-500 to-emerald-700' },
  amber: { line: '#f59e0b', from: 'rgba(245,158,11,.35)', icon: 'from-amber-500 to-orange-600' },
  violet: { line: '#a855f7', from: 'rgba(168,85,247,.35)', icon: 'from-violet-500 to-purple-700' },
  rose: { line: '#f43f5e', from: 'rgba(244,63,94,.35)', icon: 'from-rose-500 to-rose-700' },
  cyan: { line: '#06b6d4', from: 'rgba(6,182,212,.35)', icon: 'from-cyan-500 to-sky-700' }
} as const

const t = computed(() => TONES[props.tone] || TONES.blue)

/** ID duy nhat cho gradient SVG (tranh trung khi co nhieu the) */
const uid = Math.random().toString(36).slice(2, 9)

/** Duong sparkline on dinh (hash tu label) khi khong truyen series */
const points = computed<number[]>(() => {
  if (props.series?.length) return props.series
  let seed = 0
  for (const c of props.label) seed = (seed * 31 + c.charCodeAt(0)) % 9973
  const out: number[] = []
  let v = 40 + (seed % 20)
  for (let i = 0; i < 12; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    v = Math.max(12, Math.min(88, v + ((seed % 33) - 13)))
    out.push(v)
  }
  return out
})

const W = 260
const H = 46

/** SVG path smooth cho duong + vung fill */
const paths = computed(() => {
  const arr = points.value.length > 1 ? points.value : [30, 30]
  const max = Math.max(...arr, 1)
  const min = Math.min(...arr, 0)
  const span = max - min || 1
  const step = W / Math.max(arr.length - 1, 1)
  const xy = arr.map((p, i) => [i * step, H - 4 - ((p - min) / span) * (H - 10)] as [number, number])

  let d = `M ${xy[0][0]} ${xy[0][1]}`
  for (let i = 1; i < xy.length; i++) {
    const [px, py] = xy[i - 1]
    const [cx, cy] = xy[i]
    const mx = (px + cx) / 2
    d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`
  }
  return { line: d, area: `${d} L ${W} ${H} L 0 ${H} Z` }
})
</script>

<template>
  <div class="stat">
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-[#a1a1aa]">{{ label }}</p>
        <p class="mt-1 truncate text-xl font-extrabold tracking-tight text-white">{{ value }}</p>
        <p v-if="sub" class="mt-0.5 truncate text-[11px] text-[#71717a]">{{ sub }}</p>
      </div>
      <span class="stat__icon bg-gradient-to-br" :class="t.icon">
        <AppIcon :name="icon" />
      </span>
    </div>

    <!-- Sparkline gradient -->
    <svg class="stat__spark" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient :id="`sp-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="t.from" />
          <stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <path :d="paths.area" :fill="`url(#sp-${uid})`" />
      <path :d="paths.line" fill="none" :stroke="t.line" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</template>

<style scoped>
.stat {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #27272a;
  background: #18181b;
  padding: 1.125rem 1.125rem 2.75rem;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.stat:hover {
  transform: translateY(-2px);
  border-color: #3f3f46;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
}
.stat__icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.625rem;
  color: #fff;
  font-size: 0.95rem;
  transition: transform 0.18s ease;
}
.stat:hover .stat__icon { transform: scale(1.08); }
.stat__spark {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 46px;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .stat:hover { transform: none; }
  .stat:hover .stat__icon { transform: none; }
}
</style>
