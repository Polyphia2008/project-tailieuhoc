<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    radius?: string
    width?: number
    inset?: boolean
    as?: string
    animated?: boolean
  }>(),
  { radius: '16px', width: 1, inset: true, as: 'div', animated: true }
)

const style = computed(() => ({
  '--gb-radius': props.radius,
  '--gb-width': props.width + 'px'
}))
</script>

<template>
  <component :is="props.as" class="gb" :class="{ 'gb-static': !animated }" :style="style">
    <span class="gb-ring" aria-hidden="true" />
    <span class="gb-inner" :class="{ 'gb-inner-flush': !inset }">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.gb {
  position: relative;
  display: block;
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
  background: linear-gradient(90deg, rgba(56, 189, 248, .6), rgba(14, 165, 233, .6), rgba(34, 211, 238, .6), rgba(56, 189, 248, .6));
  background-size: 300% 100%;
  animation: gradientShift 7s linear infinite;
  pointer-events: none;
  z-index: 0;
}

.gb-static .gb-ring {
  animation: none;
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
    background: none;
    border: var(--gb-width) solid rgba(14, 165, 233, .55);
    padding: 0;
  }
}

.gb-inner {
  position: relative;
  z-index: 1;
  display: block;
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
</style>
