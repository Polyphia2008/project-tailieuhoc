<script setup lang="ts">
withDefaults(
  defineProps<{
    flip?: boolean
    height?: number
    tone?: 'background' | 'card' | 'brand'
  }>(),
  { flip: false, height: 72, tone: 'background' }
)

const uid = useId()
</script>

<template>
  <div class="wave-wrap" :class="{ 'wave-flip': flip }" :style="{ height: height + 'px' }" aria-hidden="true">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" class="wave-svg" :data-tone="tone">
      <defs>
        <linearGradient :id="`wv-${uid}`" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0ea5e9" stop-opacity=".18" />
          <stop offset="0.5" stop-color="#38bdf8" stop-opacity=".28" />
          <stop offset="1" stop-color="#0369a1" stop-opacity=".18" />
        </linearGradient>
      </defs>
      <path
        d="M0 52c144 34 288 51 432 51s288-17 432-51 288-51 432-51 144 0 144 0v120H0z"
        :fill="tone === 'brand' ? `url(#wv-${uid})` : 'currentColor'"
      />
    </svg>
  </div>
</template>

<style scoped>
.wave-wrap {
  position: relative;
  width: 100%;
  max-width: 100%;
  line-height: 0;
  pointer-events: none;
}

.wave-flip {
  transform: rotate(180deg);
}

.wave-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.wave-svg[data-tone='background'] {
  color: rgb(var(--background));
}

.wave-svg[data-tone='card'] {
  color: rgb(var(--card));
}
</style>
