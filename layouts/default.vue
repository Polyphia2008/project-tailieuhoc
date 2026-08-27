<script setup lang="ts">
const auth = useAuthStore()
onMounted(() => {
  if (!auth.ready) auth.fetchMe()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <LayoutDefaultHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutFooterPublic />
  </div>
</template>
