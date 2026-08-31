<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'full' | 'mark'
    size?: number
    light?: boolean
    sub?: boolean
  }>(),
  { variant: 'full', size: 38, light: false, sub: true }
)

const uid = useId()
</script>

<template>
  <span class="inline-flex items-center gap-2.5 select-none">
    <svg
      :width="props.size"
      :height="props.size"
      viewBox="0 0 48 48"
      fill="none"
      class="shrink-0 drop-shadow-[0_6px_18px_rgba(14,165,233,.35)]"
      role="img"
      aria-label="MapDocs"
    >
      <defs>
        <linearGradient :id="`lg-${uid}`" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stop-color="#38bdf8" />
          <stop offset="0.55" stop-color="#0ea5e9" />
          <stop offset="1" stop-color="#0369a1" />
        </linearGradient>
        <linearGradient :id="`lg2-${uid}`" x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="1" stop-color="#e0f2fe" stop-opacity="0.72" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" :fill="`url(#lg-${uid})`" />
      <path
        d="M13 33V16.5c0-1.4 1.5-2.3 2.7-1.6l6.4 3.6c1.2.7 1.2 2.4 0 3.1l-4.6 2.6"
        :stroke="`url(#lg2-${uid})`"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M35 15v16.5c0 1.4-1.5 2.3-2.7 1.6l-6.4-3.6c-1.2-.7-1.2-2.4 0-3.1l4.6-2.6"
        :stroke="`url(#lg2-${uid})`"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="24" cy="24" r="2.6" fill="#ffffff" />
    </svg>

    <span v-if="props.variant === 'full'" class="leading-tight">
      <span
        class="block text-[18.5px] font-extrabold tracking-tight font-ui"
        :class="props.light ? 'text-white' : 'text-foreground'"
      >
        MapDocs
      </span>
      <span
        v-if="props.sub"
        class="block text-[9.5px] font-semibold tracking-[.12em] uppercase"
        :class="props.light ? 'text-white/55' : 'text-muted-foreground'"
      >
        Kho tài liệu học tập
      </span>
    </span>
  </span>
</template>
