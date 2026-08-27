<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <Toaster
    position="top-right"
    theme="dark"
    :duration="3600"
    close-button
    rich-colors
    :toast-options="{
      style: {
        background: '#18181b',
        border: '1px solid #27272a',
        color: '#fafafa',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13.5px'
      }
    }"
  />
</template>
