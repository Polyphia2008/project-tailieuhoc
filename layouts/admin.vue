<script setup lang="ts">
const ui = useUiStore()
const route = useRoute()

watch(() => route.fullPath, () => ui.closeSidebar())
</script>

<template>
  <div class="mdk">
    <LayoutAdminSidebar />
    <div
      v-if="ui.sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
      @click="ui.closeSidebar()"
    />
    <div class="lg:pl-[240px] min-h-screen flex flex-col">
      <LayoutAdminTopbar />
      <main class="flex-1 px-4 sm:px-6 py-6">
        <slot />
      </main>
      <footer class="px-4 sm:px-6 py-5 border-t border-mdk-line flex items-center justify-between gap-3">
        <p class="text-[11.5px] text-mdk-mute">© {{ new Date().getFullYear() }} MapDocs Admin</p>
        <span class="pill bg-amber-500/12 text-amber-400 text-[10.5px]">
          <AppIcon name="solar:shield-check-bold" size="12" /> Khu vực quản trị
        </span>
      </footer>
    </div>
  </div>
</template>
