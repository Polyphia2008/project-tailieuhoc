import { toast } from 'vue-sonner'

export function useApi() {
  function errMessage(e: any): string {
    return e?.data?.statusMessage || e?.data?.message || e?.statusMessage || e?.message || 'Đã xảy ra lỗi, vui lòng thử lại'
  }

  async function call<T = any>(url: string, opts: any = {}): Promise<T> {
    const client = import.meta.server ? useRequestFetch() : $fetch
    return client<T>(url, opts)
  }

  async function get<T = any>(url: string, query?: Record<string, any>): Promise<T> {
    return call<T>(url, { query })
  }

  async function post<T = any>(url: string, body?: any): Promise<T> {
    return call<T>(url, { method: 'POST', body })
  }

  async function put<T = any>(url: string, body?: any): Promise<T> {
    return call<T>(url, { method: 'PUT', body })
  }

  async function del<T = any>(url: string): Promise<T> {
    return call<T>(url, { method: 'DELETE' })
  }

  async function guard<T>(fn: () => Promise<T>, success?: string): Promise<T | null> {
    try {
      const res = await fn()
      if (success) toast.success(success)
      return res
    } catch (e: any) {
      toast.error(errMessage(e))
      return null
    }
  }

  return { call, get, post, put, del, guard, errMessage }
}
