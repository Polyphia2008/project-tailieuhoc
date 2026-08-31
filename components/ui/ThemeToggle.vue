<script setup lang="ts">
const props = withDefaults(defineProps<{ light?: boolean }>(), { light: false })

const { isDark, toggle } = useTheme()

const label = computed(() => (isDark.value ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'))
</script>

<template>
  <button
    type="button"
    class="theme-toggle-v3"
    :class="props.light ? 'shrink-0' : ''"
    :aria-label="label"
    :title="label"
    @click="toggle()"
  >
    <AppIcon name="solar:sun-2-bold-duotone" size="19" class="tt-ic tt-sun" />
    <AppIcon name="solar:moon-stars-bold-duotone" size="18" class="tt-ic tt-moon" />
  </button>
</template>
