import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const unread = ref(0)
  const ready = ref(false)
  const pending = ref(false)

  const loggedIn = computed(() => Boolean(user.value))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSeller = computed(() => user.value?.role === 'seller' || user.value?.role === 'admin')
  const balance = computed(() => Number(user.value?.balance || 0))

  function client() {
    return import.meta.server ? useRequestFetch() : $fetch
  }

  async function fetchMe() {
    try {
      const res = await client()<{ user: User | null; unread: number }>('/api/auth/me')
      user.value = res.user
      unread.value = res.unread || 0
    } catch {
      user.value = null
      unread.value = 0
    } finally {
      ready.value = true
    }
  }

  async function login(email: string, password: string) {
    pending.value = true
    try {
      const res = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = res.user
      await fetchMe()
      return res.user
    } finally {
      pending.value = false
    }
  }

  async function register(name: string, email: string, password: string) {
    pending.value = true
    try {
      const res = await $fetch<{ user: User; first_register: boolean }>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password }
      })
      user.value = res.user
      return res
    } finally {
      pending.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      unread.value = 0
    }
  }

  async function refresh() {
    await fetchMe()
  }

  function patchBalance(next: number) {
    if (user.value) user.value.balance = next
  }

  async function markAllRead() {
    try {
      const res = await $fetch<{ unread: number }>('/api/user/notifications', {
        method: 'POST',
        body: { all: true }
      })
      unread.value = res.unread
    } catch {}
  }

  return {
    user, unread, ready, pending,
    loggedIn, isAdmin, isSeller, balance,
    fetchMe, login, register, logout, refresh, patchBalance, markAllRead
  }
})
