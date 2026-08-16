<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from 'radix-vue'

type Opt = { value: string; label: string }

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: Opt[]
    placeholder?: string
    /** class them cho trigger, vd 'w-40' */
    triggerClass?: string
    ariaLabel?: string
  }>(),
  { placeholder: 'Chọn...', triggerClass: '', ariaLabel: 'Chọn' }
)

const emit = defineEmits<{ 'update:modelValue': [string]; change: [string] }>()

/** Radix Select khong ho tro value='' -> map sang sentinel '__all' */
const ALL = '__all'
const inner = computed({
  get: () => (props.modelValue === '' ? ALL : props.modelValue),
  set: (v: string) => {
    const out = v === ALL ? '' : v
    emit('update:modelValue', out)
    emit('change', out)
  }
})

const mapped = computed(() => props.options.map((o) => ({ ...o, value: o.value === '' ? ALL : o.value })))

/** Nhan hien tai - dam bao SSR cung hien dung chu (Radix SelectValue chi hydrate o client) */
const currentLabel = computed(() => props.options.find((o) => o.value === props.modelValue)?.label || '')
</script>

<template>
  <SelectRoot v-model="inner">
    <SelectTrigger class="ms-select-trigger" :class="triggerClass" :aria-label="ariaLabel">
      <SelectValue :placeholder="placeholder">
        <span class="truncate">{{ currentLabel || placeholder }}</span>
      </SelectValue>
      <SelectIcon class="shrink-0">
        <AppIcon name="fa-chevron-down" class="text-[10px] text-slate-400" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent class="ms-select-content" position="popper" :side-offset="6">
        <SelectScrollUpButton class="ms-select-scroll">
          <AppIcon name="fa-chevron-up" class="text-[10px]" />
        </SelectScrollUpButton>

        <SelectViewport class="p-1">
          <SelectItem v-for="o in mapped" :key="o.value" :value="o.value" class="ms-select-item">
            <SelectItemText>{{ o.label }}</SelectItemText>
            <SelectItemIndicator class="ms-select-check">
              <AppIcon name="fa-check" variant="bold" class="text-xs" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>

        <SelectScrollDownButton class="ms-select-scroll">
          <AppIcon name="fa-chevron-down" class="text-[10px]" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style>
.ms-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  height: 2.25rem;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.ms-select-trigger:hover { border-color: #cbd5e1; }
.ms-select-trigger[data-state='open'],
.ms-select-trigger:focus-visible {
  border-color: rgba(11, 74, 143, 0.4);
  box-shadow: 0 0 0 3px rgba(11, 74, 143, 0.1);
}
.ms-select-trigger[data-placeholder] { color: #475569; font-weight: 400; }

.ms-select-content {
  z-index: 100;
  min-width: var(--radix-select-trigger-width);
  max-height: 18rem;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 20px 45px rgba(11, 74, 143, 0.18);
}
.ms-select-content[data-state='open'] { animation: ms-select-in 0.15s ease-out; }
@keyframes ms-select-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.ms-select-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.4375rem 0.625rem;
  font-size: 0.875rem;
  color: #0f172a;
  border-radius: 0.375rem;
  cursor: pointer;
  user-select: none;
  outline: none;
}
.ms-select-item[data-highlighted] { background: #eef6ff; color: #0b4a8f; }
.ms-select-item[data-state='checked'] { font-weight: 600; color: #0b4a8f; }
.ms-select-check { color: #0b4a8f; }

.ms-select-scroll {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.25rem;
  color: #475569;
  background: #f8fafc;
  cursor: default;
}
@media (prefers-reduced-motion: reduce) {
  .ms-select-content[data-state] { animation: none !important; }
}
</style>
