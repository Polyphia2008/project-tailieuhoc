<script setup lang="ts">
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverArrow, PopoverClose } from 'radix-vue'

withDefaults(defineProps<{
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  width?: string
}>(), { side: 'bottom', align: 'end', width: 'w-64' })
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent class="ms-pop" :class="width" :side="side" :align="align" :side-offset="8">
        <slot :close="() => {}" />
        <PopoverArrow class="ms-pop-arrow" :width="12" :height="6" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<!-- Khong scoped: PopoverContent render qua Portal nen thoat khoi scope -->
<style>
.ms-pop {
  z-index: 70;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 18px 40px rgba(11, 74, 143, 0.16);
  transform-origin: var(--radix-popover-content-transform-origin);
}
.ms-pop-arrow { fill: #fff; stroke: #e2e8f0; }
.ms-pop[data-state='open'] { animation: ms-pop-in 160ms cubic-bezier(0.16, 1, 0.3, 1); }
.ms-pop[data-state='closed'] { animation: ms-pop-out 120ms ease-in; }
@keyframes ms-pop-in {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes ms-pop-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.96); }
}
@media (prefers-reduced-motion: reduce) {
  .ms-pop[data-state='open'], .ms-pop[data-state='closed'] { animation: none; }
}
</style>
