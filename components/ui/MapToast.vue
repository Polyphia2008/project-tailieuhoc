<script setup lang="ts">
type ToastState = 'success' | 'error' | 'info' | 'warning'

const props = withDefaults(
  defineProps<{
    state?: ToastState
    title?: string
    description?: string
    closable?: boolean
  }>(),
  { state: 'info', title: '', description: '', closable: true }
)

const emit = defineEmits<{ close: [] }>()

const ICONS: Record<ToastState, string> = {
  success: 'solar:check-circle-bold',
  error: 'solar:close-circle-bold',
  info: 'solar:info-circle-bold',
  warning: 'solar:danger-triangle-bold'
}

const icon = computed(() => ICONS[props.state] || ICONS.info)
</script>

<template>
  <div data-mapdocs-toast="true" :data-state="state" role="status" aria-live="polite">
    <div data-mapdocs-header="true">
      <div data-mapdocs-badge="true">
        <AppIcon :name="icon" size="14" />
      </div>
      <span data-mapdocs-title="true">{{ title }}</span>
      <button
        v-if="closable"
        type="button"
        data-mapdocs-close="true"
        aria-label="Đóng thông báo"
        @click="emit('close')"
      >
        <AppIcon name="solar:close-circle-linear" size="13" />
      </button>
    </div>
    <p v-if="description" data-mapdocs-description="true">{{ description }}</p>
  </div>
</template>
