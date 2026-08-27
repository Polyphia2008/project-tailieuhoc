<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value?: number
    count?: number
    size?: number
    editable?: boolean
    showValue?: boolean
  }>(),
  { value: 0, size: 15 }
)

const emit = defineEmits<{ 'update:value': [number] }>()

const hover = ref(0)
const shown = computed(() => (hover.value || props.value || 0))

function pick(n: number) {
  if (!props.editable) return
  emit('update:value', n)
}
</script>

<template>
  <div class="inline-flex items-center gap-1.5">
    <div class="inline-flex items-center gap-0.5" @mouseleave="hover = 0">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        :disabled="!editable"
        class="transition-transform"
        :class="editable ? 'hover:scale-115 cursor-pointer' : 'cursor-default'"
        @mouseenter="editable && (hover = n)"
        @click="pick(n)"
      >
        <AppIcon
          :name="shown >= n - 0.25 ? 'solar:star-bold' : 'solar:star-linear'"
          :size="String(size)"
          :class="shown >= n - 0.25 ? 'text-amber-400' : 'text-slate-300'"
        />
      </button>
    </div>
    <span v-if="showValue && value" class="text-[13px] font-semibold text-slate-700 font-ui">{{ value.toFixed(1) }}</span>
    <span v-if="count !== undefined" class="text-xs text-slate-400">({{ count }})</span>
  </div>
</template>
