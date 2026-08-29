<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const { theme } = useTheme()
</script>

<template>
  <Toaster
    position="top-right"
    :theme="theme === 'dark' ? 'dark' : 'light'"
    :duration="4000"
    close-button
    rich-colors
    :toast-options="{
      classes: {
        toast: 'border border-cmstdev/20 bg-background text-foreground'
      },
      style: {
        fontFamily: 'Signika, Inter, sans-serif',
        fontSize: '13.5px',
        borderRadius: '12px'
      }
    }"
  />
</template>
