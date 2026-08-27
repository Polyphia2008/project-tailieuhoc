<script setup lang="ts">
const auth = useAuthStore()

if (import.meta.server) {
  await auth.fetchMe()
}
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiToaster />
  </div>
</template>
