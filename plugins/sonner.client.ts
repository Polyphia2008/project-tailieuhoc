import { Toaster, toast } from 'vue-sonner'
import MapToast from '~/components/ui/MapToast.vue'

type State = 'success' | 'error' | 'info' | 'warning'

const DEFAULT_TITLE: Record<State, string> = {
  success: 'Thành công',
  error: 'Có lỗi xảy ra',
  info: 'Thông báo',
  warning: 'Cảnh báo'
}

function textOf(v: any): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  return ''
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Toaster', Toaster)

  const api = toast as any
  if (api.__mapdocs) return

  const native: Record<string, any> = {
    success: api.success,
    error: api.error,
    info: api.info,
    warning: api.warning
  }

  function build(state: State) {
    return (message?: any, data?: any) => {
      const msg = textOf(message)
      if (!msg && message) return native[state](message, data)

      const opts = data || {}
      const holder: { id?: string | number } = {}

      const created = api.custom(MapToast, {
        ...opts,
        description: undefined,
        componentProps: {
          state,
          title: msg || DEFAULT_TITLE[state],
          description: textOf(opts.description),
          closable: opts.closeButton !== false,
          onClose: () => api.dismiss(holder.id)
        }
      })
      holder.id = created
      return created
    }
  }

  api.success = build('success')
  api.error = build('error')
  api.info = build('info')
  api.warning = build('warning')
  api.__mapdocs = true
})
