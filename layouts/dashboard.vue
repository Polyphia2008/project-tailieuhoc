<script setup lang="ts">
const ui = useUiStore()
const route = useRoute()

watch(() => route.fullPath, () => ui.closeSidebar())
</script>

<template>
  <div class="mdk">
    <LayoutDashSidebar />
    <div
      v-if="ui.sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
      @click="ui.closeSidebar()"
    />
    <div class="lg:pl-[240px] min-h-screen flex flex-col">
      <LayoutDashTopbar />
      <main class="flex-1 px-4 sm:px-6 py-6">
        <slot />
      </main>
      <footer class="px-4 sm:px-6 py-5 border-t border-mdk-line">
        <p class="text-[11.5px] text-mdk-mute">
          © {{ new Date().getFullYear() }} MapDocs — Kho tài liệu học tập chất lượng cao
        </p>
      </footer>
    </div>
  </div>
</template>
