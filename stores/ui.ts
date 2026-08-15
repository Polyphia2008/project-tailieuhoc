import { defineStore } from 'pinia'
import type { Toast } from '~/types'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const sidebarOpen = ref(false)
  let seq = 0
  function toast(message: string, type: Toast['type'] = 'info') {
    const id = ++seq
    toasts.value.push({ id, message, type })
    setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, 4000)
  }
  const success = (m: string) => toast(m, 'success')
  const error = (m: string) => toast(m, 'error')
  const remove = (id: number) => (toasts.value = toasts.value.filter((t) => t.id !== id))
  return { toasts, sidebarOpen, toast, success, error, remove }
})
