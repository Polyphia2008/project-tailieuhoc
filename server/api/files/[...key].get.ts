import { useR2 } from '~/server/utils/r2'
import { fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const key = decodeURIComponent((getRouterParam(event, 'key') || '').replace(/^\/+/, ''))
  if (!key) fail(400, 'Thiếu đường dẫn tệp')

  const r2 = useR2()
  const obj = await r2.get(key)

  if (!obj) {
    setResponseHeader(event, 'Content-Type', 'application/json')
    return {
      placeholder: true,
      key,
      storage: r2.kind,
      message: 'Tệp chưa tồn tại trong bộ lưu trữ. Cấu hình R2 trong .env để dùng lưu trữ thật.'
    }
  }

  setResponseHeader(event, 'Content-Type', obj.meta.contentType)
  setResponseHeader(event, 'Content-Length', String(obj.meta.size))
  return obj.body
})
