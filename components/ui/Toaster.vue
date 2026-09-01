<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const { theme } = useTheme()
</script>

<template>
  <Toaster
    position="top-right"
    :theme="theme === 'dark' ? 'dark' : 'light'"
    :duration="4000"
    :gap="10"
    :visible-toasts="4"
    class="mapdocs-toaster"
    :toast-options="{ classes: { toast: 'mapdocs-toast-shell' } }"
  />
</template>
