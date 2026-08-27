import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'
import { createHmac } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  assertBody(body, ['code'])

  const cfg = useRuntimeConfig()
  const db = useDriver()

  const order = await db.findOne<any>('orders', { code: String(body.code) })
  if (!order) fail(404, 'Không tìm thấy đơn hàng')
  if (order.buyer_id !== user.id) fail(403, 'Đơn hàng không thuộc về bạn')
  if (order.status === 'paid') fail(400, 'Đơn hàng đã được thanh toán')

  if (!cfg.vnpTmnCode || !cfg.vnpHashSecret) {
    return {
      mock: true,
      url: `/thanh-toan/gia-lap?code=${order.code}`,
      message: 'Chưa cấu hình VNPay, dùng cổng giả lập'
    }
  }

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const createDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`

  const params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: cfg.vnpTmnCode,
    vnp_Amount: String(order.amount * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: order.code,
    vnp_OrderInfo: `Thanh toan don hang ${order.code}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: `${cfg.public.siteUrl}/thanh-toan/ket-qua`,
    vnp_IpAddr: getRequestHeader(event, 'x-forwarded-for') || '127.0.0.1',
    vnp_CreateDate: createDate
  }

  const sorted = Object.keys(params).sort()
  const signData = sorted.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`).join('&')
  const signature = createHmac('sha512', cfg.vnpHashSecret).update(signData).digest('hex')

  return {
    mock: false,
    url: `${cfg.vnpUrl}?${signData}&vnp_SecureHash=${signature}`
  }
})
