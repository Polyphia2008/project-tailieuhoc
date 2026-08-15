import { createHmac } from 'node:crypto'
import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import type { Order } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const cfg = useRuntimeConfig()
  const { code } = await readBody(event)
  const order = await db().findOne<Order>('orders', { code })
  if (!order || order.buyer_id !== user.id) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy đơn hàng' })

  // Chưa cấu hình VNPay -> dùng cổng giả lập
  if (!cfg.vnpTmnCode || !cfg.vnpHashSecret) {
    return {
      success: true,
      data: { url: `/thanh-toan/gia-lap?code=${order.code}&amount=${order.amount}&method=vnpay`, simulated: true },
      message: 'Đang dùng cổng thanh toán giả lập (chưa cấu hình VNPay)'
    }
  }

  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const createDate = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  const params: Record<string, string> = {
    vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: cfg.vnpTmnCode,
    vnp_Amount: String(order.amount * 100), vnp_CurrCode: 'VND', vnp_TxnRef: order.code,
    vnp_OrderInfo: `Thanh toan don hang ${order.code}`, vnp_OrderType: 'other', vnp_Locale: 'vn',
    vnp_ReturnUrl: `${cfg.public.siteUrl}/thanh-toan/ket-qua`, vnp_IpAddr: '127.0.0.1', vnp_CreateDate: createDate
  }
  const sorted = Object.keys(params).sort()
  const signData = sorted.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`).join('&')
  const secureHash = createHmac('sha512', cfg.vnpHashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex')
  const url = `${cfg.vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`

  return { success: true, data: { url, simulated: false }, message: 'Chuyển tới VNPay' }
})
