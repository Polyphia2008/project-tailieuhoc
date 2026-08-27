import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const searchOpen = ref(false)
  const searchTerm = ref('')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function openSearch() {
    searchOpen.value = true
  }

  function closeSearch() {
    searchOpen.value = false
  }

  return { sidebarOpen, searchOpen, searchTerm, toggleSidebar, closeSidebar, openSearch, closeSearch }
})
