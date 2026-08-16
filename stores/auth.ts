import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const mode = ref<'mock' | 'supabase'>('mock')
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSeller = computed(() => user.value?.role === 'seller' || user.value?.role === 'admin')

  async function fetchMe() {
    try {
      // SSR: $fetch khong tu dong forward cookie -> dung useRequestFetch de giu phien dang nhap
      const request = import.meta.server ? useRequestFetch() : $fetch
      const res = await request<any>('/api/auth/me')
      user.value = res?.data ?? null
      if (res?.mode) mode.value = res.mode
    } catch { user.value = null }
  }
  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await $fetch<any>('/api/auth/login', { method: 'POST', body: { email, password } })
      user.value = res.data
      return res
    } finally { loading.value = false }
  }
  async function register(name: string, email: string, password: string) {
    loading.value = true
    try {
      const res = await $fetch<any>('/api/auth/register', { method: 'POST', body: { name, email, password } })
      user.value = res.data
      return res
    } finally { loading.value = false }
  }
  async function logout() {
    try { await $fetch('/api/auth/logout', { method: 'POST' }) } finally {
      user.value = null
      await navigateTo('/')
    }
  }
  function setUser(u: User | null) { user.value = u }

  return { user, mode, loading, isLoggedIn, isAdmin, isSeller, fetchMe, login, register, logout, setUser }
})
