<script setup lang="ts">
const ui = useUiStore()
const cls = (t: string) => t === 'success' ? 'bg-green-600' : t === 'error' ? 'bg-red-600' : 'bg-primary-900'
const icon = (t: string) => t === 'success' ? 'fa-circle-check' : t === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'
</script>
<template>
  <Teleport to="body">
    <div id="toaster" class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out" enter-from-class="translate-x-8 opacity-0"
        leave-active-class="transition duration-200 ease-in" leave-to-class="translate-x-8 opacity-0">
        <div v-for="t in ui.toasts" :key="t.id"
          class="flex items-start gap-3 text-white rounded-xl shadow-hover px-4 py-3 cursor-pointer"
          :class="cls(t.type)" @click="ui.remove(t.id)">
          <i class="fa-solid mt-0.5" :class="icon(t.type)" />
          <p class="text-sm flex-1 leading-snug">{{ t.message }}</p>
          <button class="opacity-70 hover:opacity-100"><i class="fa-solid fa-xmark" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
