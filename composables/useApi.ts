export function useApi() {
  const ui = useUiStore()
  async function call<T = any>(url: string, opts: any = {}, o: { silent?: boolean; successToast?: boolean } = {}): Promise<T | null> {
    try {
      const res: any = await $fetch(url, opts)
      if (o.successToast && res?.message) ui.success(res.message)
      return (res?.data !== undefined ? res.data : res) as T
    } catch (e: any) {
      const msg = e?.data?.statusMessage || e?.data?.message || e?.statusMessage || 'Đã có lỗi xảy ra, vui lòng thử lại'
      if (!o.silent) ui.error(msg)
      return null
    }
  }
  const get = <T = any>(url: string, query?: any, o?: any) => call<T>(url, { query }, o)
  const post = <T = any>(url: string, body?: any, o?: any) => call<T>(url, { method: 'POST', body }, { successToast: true, ...o })
  const put = <T = any>(url: string, body?: any, o?: any) => call<T>(url, { method: 'PUT', body }, { successToast: true, ...o })
  const del = <T = any>(url: string, body?: any, o?: any) => call<T>(url, { method: 'DELETE', body }, { successToast: true, ...o })
  return { call, get, post, put, del }
}
