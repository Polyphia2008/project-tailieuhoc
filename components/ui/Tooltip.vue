<script setup lang="ts">
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow
} from 'radix-vue'

withDefaults(
  defineProps<{
    /** Noi dung tooltip */
    text: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    delay?: number
  }>(),
  { side: 'top', delay: 180 }
)
</script>

<template>
  <TooltipProvider :delay-duration="delay">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent :side="side" :side-offset="6" class="ms-tip">
          {{ text }}
          <TooltipArrow class="ms-tip-arrow" :width="10" :height="5" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style>
.ms-tip {
  z-index: 100;
  max-width: 16rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  background: #0f172a;
  color: #fff;
  font-size: 0.75rem;
  line-height: 1.1rem;
  font-weight: 500;
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.2);
  user-select: none;
}
.ms-tip[data-state='delayed-open'] {
  animation: ms-tip-in 0.14s ease-out;
}
.ms-tip-arrow { fill: #0f172a; }
@keyframes ms-tip-in {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .ms-tip[data-state] { animation: none !important; }
}
</style>
