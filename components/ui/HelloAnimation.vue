<script setup lang="ts">
const props = withDefaults(defineProps<{ name?: string; confetti?: number }>(), { confetti: 26 })

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4']

const bits = computed(() =>
  Array.from({ length: props.confetti }, (_, i) => {
    const angle = (i / props.confetti) * Math.PI * 2 + (i % 3) * 0.2
    const dist = 130 + ((i * 37) % 190)
    return {
      id: i,
      color: COLORS[i % COLORS.length],
      cx: `${Math.round(Math.cos(angle) * dist)}px`,
      cy: `${Math.round(Math.sin(angle) * dist)}px`,
      cr: `${((i * 71) % 720) - 360}deg`,
      delay: `${((i * 43) % 400) / 1000}s`
    }
  })
)
</script>

<template>
  <div class="relative flex flex-col items-center justify-center select-none">
    <div class="absolute left-1/2 top-[86px] w-0 h-0 pointer-events-none">
      <span
        v-for="b in bits"
        :key="b.id"
        class="confetti-bit"
        :style="{
          background: b.color,
          '--cx': b.cx,
          '--cy': b.cy,
          '--cr': b.cr,
          animationDelay: b.delay
        }"
      />
    </div>

    <div class="success-check relative z-10">
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="44" fill="url(#hgrad)" opacity=".18" />
        <circle cx="48" cy="48" r="34" fill="url(#hgrad)" />
        <path d="M33 49.5 L43.5 60 L63 38" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="hgrad" x1="0" y1="0" x2="96" y2="96">
            <stop offset="0" stop-color="#3b82f6" />
            <stop offset="1" stop-color="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <svg viewBox="0 0 420 190" class="w-[300px] sm:w-[380px] h-auto mt-2 overflow-visible">
      <text x="210" y="140" text-anchor="middle" class="success-hello-stroke">hello</text>
      <text x="210" y="140" text-anchor="middle" class="success-hello-fill">hello</text>
    </svg>

    <p
      v-if="name"
      class="text-xl sm:text-2xl font-bold text-white font-ui tracking-tight opacity-0"
      style="animation: helloFill .7s ease 2.1s forwards"
    >
      Chào mừng {{ name }}!
    </p>
  </div>
</template>
