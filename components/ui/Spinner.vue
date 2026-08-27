<script setup lang="ts">
withDefaults(defineProps<{ size?: number; class?: string }>(), { size: 20 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    class="animate-spin"
    :class="$props.class"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.4" opacity=".2" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
  </svg>
</template>
