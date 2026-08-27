import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser, slimUser } from '~/server/utils/auth'
import { assertBody, uniqueSlug, fail, num, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  assertBody(body, ['title', 'description', 'subject', 'grade'])

  const db = useDriver()
  const settings = await db.getSettings()

  const isFree = Boolean(body.is_free)
  const price = isFree ? 0 : Number(body.price || 0)
  if (!isFree && price < settings.min_price) {
    fail(400, `Giá bán tối thiểu là ${settings.min_price.toLocaleString('vi-VN')}đ`)
  }

  const title = String(body.title).trim()
  if (title.length < 10) fail(400, 'Tiêu đề phải có ít nhất 10 ký tự')

  const slug = await uniqueSlug(title, async (s) => Boolean(await db.findOne('documents', { slug: s })))

  const doc = await db.insert('documents', {
    id: 'd_' + cryptoId(),
    title,
    slug,
    description: String(body.description).trim(),
    subject: String(body.subject),
    grade: Number(body.grade),
    price,
    is_free: isFree,
    thumbnail: str(body.thumbnail) || '',
    file_url: str(body.file_url) || `documents/${slug}.pdf`,
    preview_url: str(body.preview_url) || '',
    file_type: str(body.file_type) || 'pdf',
    file_size: num(body.file_size) ?? 1200000,
    pages: num(body.pages) ?? 0,
    status: 'pending',
    seller_id: user.id,
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 8).map(String) : [],
    featured: false,
    view_count: 0,
    download_count: 0,
    sold_count: 0,
    rating_avg: 0,
    rating_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  if (user.role === 'user') await db.update('users', user.id, { role: 'seller' })

  await db.insert('notifications', {
    id: 'n_' + cryptoId(),
    user_id: user.id,
    title: 'Tài liệu đã được gửi kiểm duyệt',
    body: `"${title}" đang chờ duyệt. Chúng tôi sẽ phản hồi trong vòng 24 giờ.`,
    type: 'info',
    link: '/dashboard/dang-ban',
    read: false,
    created_at: new Date().toISOString()
  })

  return { document: { ...doc, seller: slimUser(user) } }
})
