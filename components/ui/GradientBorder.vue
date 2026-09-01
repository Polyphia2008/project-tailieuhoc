<script setup lang="ts">
type Variant = 'cyan' | 'accent'

const props = withDefaults(
  defineProps<{
    radius?: string
    width?: number
    inset?: boolean
    as?: string
    animated?: boolean
    variant?: Variant
    intensity?: number
    glow?: boolean
    duration?: number
  }>(),
  {
    radius: '16px',
    width: 1,
    inset: true,
    as: 'div',
    animated: true,
    variant: 'cyan',
    intensity: 1,
    glow: false,
    duration: 7
  }
)

const style = computed(() => ({
  '--gb-radius': props.radius,
  '--gb-width': props.width + 'px',
  '--gb-duration': props.duration + 's',
  '--gb-alpha': String(Math.min(1, Math.max(0.15, props.intensity)))
}))
</script>

<template>
  <component
    :is="props.as"
    class="gb"
    :class="[
      variant === 'accent' ? 'gb-accent' : 'gb-cyan',
      { 'gb-static': !animated, 'gb-glow': glow }
    ]"
    :style="style"
  >
    <span class="gb-ring" aria-hidden="true" />
    <span class="gb-inner" :class="{ 'gb-inner-flush': !inset }"><slot /></span>
  </component>
</template>

<style scoped>
.gb {
  position: relative;
  display: block;
  max-width: 100%;
  border-radius: var(--gb-radius);
  isolation: isolate;
}

.gb-ring {
  position: absolute;
  inset: 0;
  display: block;
  height: 100%;
  width: 100%;
  border-radius: inherit;
  padding: var(--gb-width);
  background-size: 300% 100%;
  background-repeat: no-repeat;
  animation: mapdocsGradient var(--gb-duration) linear infinite;
  opacity: var(--gb-alpha);
  pointer-events: none;
  z-index: 0;
}

.gb-cyan .gb-ring {
  background-image: linear-gradient(
    90deg,
    rgba(56, 189, 248, .6),
    rgba(14, 165, 233, .6),
    rgba(34, 211, 238, .6),
    rgba(56, 189, 248, .6)
  );
}

.gb-accent .gb-ring {
  background-image: linear-gradient(
    90deg,
    rgba(255, 170, 64, .5),
    rgba(156, 64, 255, .5),
    rgba(255, 170, 64, .5)
  );
}

.gb-static .gb-ring {
  animation: none;
  background-position: 0% 50%;
}

.gb-glow::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  opacity: .5;
  filter: blur(14px);
  background-size: 300% 100%;
  animation: mapdocsGradient var(--gb-duration) linear infinite;
}

.gb-cyan.gb-glow::after {
  background-image: linear-gradient(90deg, rgba(56, 189, 248, .6), rgba(14, 165, 233, .6), rgba(34, 211, 238, .6));
}

.gb-accent.gb-glow::after {
  background-image: linear-gradient(90deg, rgba(255, 170, 64, .5), rgba(156, 64, 255, .5), rgba(255, 170, 64, .5));
}

@supports (mask-composite: exclude) or (-webkit-mask-composite: xor) {
  .gb-ring {
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
  }
}

@supports not ((mask-composite: exclude) or (-webkit-mask-composite: xor)) {
  .gb-ring {
    background-image: none;
    border: var(--gb-width) solid rgba(14, 165, 233, .55);
    padding: 0;
    animation: none;
  }
  .gb-accent .gb-ring {
    border-color: rgba(156, 64, 255, .5);
  }
}

.gb-inner {
  position: relative;
  z-index: 1;
  display: block;
  max-width: 100%;
  border-radius: calc(var(--gb-radius) - var(--gb-width));
  margin: var(--gb-width);
  background: rgb(var(--card));
  overflow: hidden;
}

.gb-inner-flush {
  margin: 0;
  background: transparent;
  border-radius: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .gb-ring,
  .gb-glow::after {
    animation: none;
    background-position: 0% 50%;
  }
}
</style>
