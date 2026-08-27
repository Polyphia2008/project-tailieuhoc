<script setup lang="ts">
defineProps<{ pending?: { docs?: number; reports?: number } }>()
</script>

<template>
  <LayoutDashTopbar admin />
</template>
